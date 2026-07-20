import { EventEmitter } from "events";
import type { ChatSenderRole } from "@/generated/prisma";

/**
 * Bus event in-process untuk mendorong pesan baru ke klien lewat SSE.
 *
 * CATATAN PENSKALAAN: bus ini hidup di memori satu proses. Aplikasi berjalan
 * sebagai satu instance pm2 (mode fork), jadi ini cukup. Bila nanti dijalankan
 * dalam mode cluster atau multi-server, event tidak akan menyeberang antar
 * proses dan bus ini perlu diganti Redis pub/sub atau Postgres LISTEN/NOTIFY.
 * Klien tetap melakukan refetch saat reconnect, sehingga pesan tidak hilang —
 * hanya pengirimannya yang tidak lagi instan.
 */

export interface ChatEvent {
  roomId: string;
  investorProfileId: string;
  umkmProfileId: string;
  message: {
    id: string;
    roomId: string;
    senderRole: ChatSenderRole;
    content: string;
    createdAt: string;
  };
}

const CHANNEL = "chat:message";

// Simpan di globalThis agar hot-reload dev tidak membuat emitter ganda.
const globalForChat = globalThis as unknown as { __chatEmitter?: EventEmitter };

const emitter =
  globalForChat.__chatEmitter ??
  (() => {
    const e = new EventEmitter();
    // Tiap koneksi SSE menambah satu listener; batas default 10 terlalu kecil.
    e.setMaxListeners(0);
    globalForChat.__chatEmitter = e;
    return e;
  })();

export function publishChatEvent(event: ChatEvent) {
  emitter.emit(CHANNEL, event);
}

export function subscribeChatEvents(listener: (event: ChatEvent) => void) {
  emitter.on(CHANNEL, listener);
  return () => {
    emitter.off(CHANNEL, listener);
  };
}
