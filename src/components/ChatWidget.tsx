"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ChatWidget.module.css";
import { MessageCircle, Send, X, ArrowLeft, Plus } from "@/components/icons";

interface RoomSummary {
  id: string;
  title: string;
  campaignTitle: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

interface Message {
  id: string;
  senderRole: "INVESTOR" | "UMKM";
  content: string;
  createdAt: string;
  mine: boolean;
}

interface Contact {
  id: string;
  name: string;
  context: string;
  campaignId: string;
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [activeRoom, setActiveRoom] = useState<RoomSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [isPickingContact, setIsPickingContact] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Dibaca di dalam handler SSE yang dibuat sekali, jadi disimpan sebagai ref
  // agar handler selalu melihat room yang sedang dibuka.
  const activeRoomRef = useRef<RoomSummary | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  // Peran pengguna baru diketahui setelah memuat kontak/pesan; disimpan di ref
  // karena hanya dipakai di dalam handler, bukan untuk render.
  const myRoleRef = useRef<"INVESTOR" | "UMKM" | null>(null);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  const loadRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/rooms");
      if (!res.ok) return;
      setRooms(await res.json());
    } catch {
      // Diamkan: daftar akan dimuat ulang saat widget dibuka lagi.
    }
  }, []);

  const openRoom = useCallback(async (room: RoomSummary) => {
    setActiveRoom(room);
    setMessages([]);
    setError("");
    try {
      const res = await fetch(`/api/chat/rooms/${room.id}/messages`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(data.messages);
      // Pesan sudah ditandai terbaca oleh server.
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, unreadCount: 0 } : r))
      );
    } catch {
      setError("Gagal memuat pesan.");
    }
  }, []);

  const openContactPicker = useCallback(async () => {
    setIsPickingContact(true);
    setIsLoadingContacts(true);
    setError("");
    try {
      const res = await fetch("/api/chat/contacts");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setContacts(data.contacts);
      myRoleRef.current = data.myRole;
    } catch {
      setError("Gagal memuat daftar kontak.");
    } finally {
      setIsLoadingContacts(false);
    }
  }, []);

  const startChatWith = useCallback(
    async (contact: Contact) => {
      setError("");
      try {
        // UMKM membuka room lewat id investor; investor lewat campaign agar
        // negosiasi otomatis terikat ke konteks pendanaannya.
        const body =
          myRoleRef.current === "UMKM"
            ? { investorProfileId: contact.id, campaignId: contact.campaignId }
            : { campaignId: contact.campaignId };

        const res = await fetch("/api/chat/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Gagal membuka ruang negosiasi.");
        }
        const created = await res.json();

        const listRes = await fetch("/api/chat/rooms");
        const list: RoomSummary[] = listRes.ok ? await listRes.json() : [];
        setRooms(list);
        setIsPickingContact(false);

        const target = list.find((r) => r.id === created.id);
        if (target) openRoom(target);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal membuka ruang negosiasi.");
      }
    },
    [openRoom]
  );

  // Muat daftar room saat mount agar lencana belum-dibaca tampil tanpa dibuka.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/chat/rooms");
        if (!res.ok || cancelled) return;
        setRooms(await res.json());
      } catch {
        // Diamkan: daftar dimuat ulang saat ada event masuk.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Satu koneksi SSE untuk seluruh sesi; EventSource otomatis reconnect.
  useEffect(() => {
    const source = new EventSource("/api/chat/stream");

    source.onmessage = (event) => {
      const incoming = JSON.parse(event.data) as Message & { roomId: string };
      const current = activeRoomRef.current;

      if (current && incoming.roomId === current.id) {
        setMessages((prev) =>
          prev.some((m) => m.id === incoming.id)
            ? prev
            : [...prev, { ...incoming, mine: false }]
        );
        // Room sedang terbuka, jadi langsung tandai terbaca di server.
        fetch(`/api/chat/rooms/${incoming.roomId}/messages`).catch(() => {});
      }

      setRooms((prev) => {
        const exists = prev.some((r) => r.id === incoming.roomId);
        if (!exists) {
          // Room baru dibuat lawan bicara: ambil ulang daftarnya.
          loadRooms();
          return prev;
        }
        return prev
          .map((r) =>
            r.id === incoming.roomId
              ? {
                  ...r,
                  lastMessage: incoming.content,
                  lastMessageAt: incoming.createdAt,
                  unreadCount:
                    current?.id === incoming.roomId ? 0 : r.unreadCount + 1,
                }
              : r
          )
          .sort((a, b) =>
            (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? "")
          );
      });
    };

    return () => source.close();
  }, [loadRooms]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Halaman lain (mis. detail kampanye) dapat meminta widget membuka room
  // tertentu setelah membuatnya.
  useEffect(() => {
    const handler = async (event: Event) => {
      const roomId = (event as CustomEvent<{ roomId?: string }>).detail?.roomId;
      if (!roomId) return;

      setIsOpen(true);
      const res = await fetch("/api/chat/rooms");
      if (!res.ok) return;
      const list: RoomSummary[] = await res.json();
      setRooms(list);

      const target = list.find((r) => r.id === roomId);
      if (target) openRoom(target);
    };

    window.addEventListener("synergy:open-chat", handler);
    return () => window.removeEventListener("synergy:open-chat", handler);
  }, [openRoom]);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || !activeRoom || isSending) return;

    setIsSending(true);
    setError("");
    try {
      const res = await fetch(`/api/chat/rooms/${activeRoom.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal mengirim pesan.");
      }
      const message: Message = await res.json();
      setMessages((prev) => [...prev, message]);
      setDraft("");
      setRooms((prev) =>
        prev.map((r) =>
          r.id === activeRoom.id
            ? { ...r, lastMessage: message.content, lastMessageAt: message.createdAt }
            : r
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim pesan.");
    } finally {
      setIsSending(false);
    }
  };

  const totalUnread = rooms.reduce((sum, r) => sum + r.unreadCount, 0);

  return (
    <>
      <button
        type="button"
        className={styles.launcher}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Tutup chat" : "Buka chat negosiasi"}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {!isOpen && totalUnread > 0 && (
          <span className={styles.launcherBadge}>
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.panel} role="dialog" aria-label="Chat negosiasi akad">
          <header className={styles.header}>
            {activeRoom ? (
              <>
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={() => setActiveRoom(null)}
                  aria-label="Kembali ke daftar chat"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className={styles.headerText}>
                  <strong>{activeRoom.title}</strong>
                  {activeRoom.campaignTitle && <span>{activeRoom.campaignTitle}</span>}
                </div>
              </>
            ) : isPickingContact ? (
              <>
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={() => setIsPickingContact(false)}
                  aria-label="Kembali ke daftar chat"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className={styles.headerText}>
                  <strong>Mulai Negosiasi</strong>
                  <span>Pilih mitra yang ingin dihubungi</span>
                </div>
              </>
            ) : (
              <>
                <div className={styles.headerText}>
                  <strong>Negosiasi Akad</strong>
                  <span>Diskusi langsung dengan mitra Anda</span>
                </div>
                <button
                  type="button"
                  className={styles.newChatButton}
                  onClick={openContactPicker}
                  aria-label="Mulai percakapan baru"
                  title="Mulai percakapan baru"
                >
                  <Plus size={18} />
                </button>
              </>
            )}
          </header>

          {!activeRoom && isPickingContact ? (
            <div className={styles.roomList}>
              {isLoadingContacts ? (
                <p className={styles.empty}>Memuat kontak…</p>
              ) : contacts.length === 0 ? (
                <p className={styles.empty}>
                  Belum ada mitra untuk diajak negosiasi. Kontak muncul setelah ada
                  investasi yang menghubungkan Anda.
                </p>
              ) : (
                contacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    className={styles.roomItem}
                    onClick={() => startChatWith(contact)}
                  >
                    <span className={styles.avatar}>
                      {contact.name.charAt(0).toUpperCase()}
                    </span>
                    <span className={styles.roomBody}>
                      <span className={styles.roomTop}>
                        <strong>{contact.name}</strong>
                      </span>
                      <span className={styles.roomPreview}>{contact.context}</span>
                    </span>
                  </button>
                ))
              )}
              {error && <p className={styles.error}>{error}</p>}
            </div>
          ) : !activeRoom ? (
            <div className={styles.roomList}>
              {rooms.length === 0 ? (
                <p className={styles.empty}>
                  Belum ada percakapan. Tekan ＋ di atas untuk mulai negosiasi.
                </p>
              ) : (
                rooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    className={styles.roomItem}
                    onClick={() => openRoom(room)}
                  >
                    <span className={styles.avatar}>
                      {room.title.charAt(0).toUpperCase()}
                    </span>
                    <span className={styles.roomBody}>
                      <span className={styles.roomTop}>
                        <strong>{room.title}</strong>
                        <time>{formatTime(room.lastMessageAt)}</time>
                      </span>
                      <span className={styles.roomPreview}>
                        {room.lastMessage ?? "Belum ada pesan"}
                      </span>
                    </span>
                    {room.unreadCount > 0 && (
                      <span className={styles.unread}>{room.unreadCount}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          ) : (
            <>
              <div className={styles.messages}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${styles.bubble} ${m.mine ? styles.mine : styles.theirs}`}
                  >
                    <p>{m.content}</p>
                    <time>{formatTime(m.createdAt)}</time>
                  </div>
                ))}
                <div ref={listEndRef} />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.composer}>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Tulis pesan…"
                  rows={1}
                  maxLength={2000}
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={isSending || draft.trim().length === 0}
                  aria-label="Kirim pesan"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
