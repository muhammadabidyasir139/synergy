import { ChatSenderRole } from "@/generated/prisma";
import { getChatParticipant } from "@/lib/chat";
import { subscribeChatEvents, type ChatEvent } from "@/lib/chat-events";

// SSE harus dirender per-permintaan dan berjalan di runtime Node.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEARTBEAT_MS = 25000;

/**
 * Aliran Server-Sent Events berisi pesan baru untuk pengguna aktif.
 * Klien memakainya lewat EventSource dan otomatis reconnect bila terputus.
 */
export async function GET(request: Request) {
  const me = await getChatParticipant();
  if (!me) return new Response("Unauthorized", { status: 401 });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      const send = (data: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          // Klien sudah pergi; pembersihan ditangani oleh cleanup().
        }
      };

      send(": connected\n\n");

      const unsubscribe = subscribeChatEvents((event: ChatEvent) => {
        // Hanya kirim event untuk room yang memang milik pengguna ini.
        const isMine =
          me.role === ChatSenderRole.INVESTOR
            ? event.investorProfileId === me.profileId
            : event.umkmProfileId === me.profileId;
        if (!isMine) return;

        send(`data: ${JSON.stringify(event.message)}\n\n`);
      });

      // Komentar berkala agar proxy tidak menutup koneksi yang dianggap idle.
      const heartbeat = setInterval(() => send(": ping\n\n"), HEARTBEAT_MS);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Sudah tertutup.
        }
      };

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Mencegah nginx menyangga aliran sehingga pesan tertahan.
      "X-Accel-Buffering": "no",
    },
  });
}
