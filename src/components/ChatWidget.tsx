"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ChatWidget.module.css";
import { MessageCircle, Send, X, ArrowLeft, Plus, Trash } from "@/components/icons";

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

const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    // Ignore if audio fails
  }
};

const showNotification = (title: string, body: string) => {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
  }
};

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
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const getRoleQuery = useCallback(() => {
    let role = myRoleRef.current;
    if (!role) {
      if (typeof window !== "undefined") {
        const inv = sessionStorage.getItem("synergy_investor_session");
        if (inv) role = "INVESTOR";
        else {
          const umkm = sessionStorage.getItem("synergy_umkm_session");
          if (umkm) role = "UMKM";
        }
      }
      myRoleRef.current = role as "INVESTOR" | "UMKM" | null;
    }
    return role ? `?role=${role}` : "";
  }, []);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  const loadRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/rooms" + getRoleQuery());
      if (!res.ok) return;
      setRooms(await res.json());
    } catch {
      // Diamkan: daftar akan dimuat ulang saat widget dibuka lagi.
    }
  }, [getRoleQuery]);

  const openRoom = useCallback(async (room: RoomSummary) => {
    setActiveRoom(room);
    setMessages([]);
    setError("");
    try {
      const res = await fetch(`/api/chat/rooms/${room.id}/messages` + getRoleQuery());
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
  }, [getRoleQuery]);

  const openContactPicker = useCallback(async () => {
    setIsPickingContact(true);
    setIsLoadingContacts(true);
    setError("");
    try {
      const res = await fetch("/api/chat/contacts" + getRoleQuery());
      if (!res.ok) throw new Error();
      const data = await res.json();
      setContacts(data.contacts);
      myRoleRef.current = data.myRole;
    } catch {
      setError("Gagal memuat daftar kontak.");
    } finally {
      setIsLoadingContacts(false);
    }
  }, [getRoleQuery]);

  const startChatWith = useCallback(
    async (contact: Contact) => {
      setError("");
      try {
        // Baik UMKM maupun Investor bebas membuka obrolan ke akun lawan secara langsung
        // via ID profil jika tidak ada campaign yang spesifik (seperti saat klik dari daftar UMKM Terdaftar).
        const body =
          myRoleRef.current === "UMKM"
            ? { investorProfileId: contact.id, campaignId: contact.campaignId || undefined }
            : { umkmProfileId: contact.id, campaignId: contact.campaignId || undefined };

        const res = await fetch("/api/chat/rooms" + getRoleQuery(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Gagal membuka ruang negosiasi.");
        }
        const created = await res.json();

        const listRes = await fetch("/api/chat/rooms" + getRoleQuery());
        const list: RoomSummary[] = listRes.ok ? await listRes.json() : [];
        setRooms(list);
        setIsPickingContact(false);

        const target = list.find((r) => r.id === created.id);
        if (target) openRoom(target);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal membuka ruang negosiasi.");
      }
    },
    [openRoom, getRoleQuery]
  );

  const deleteRoom = useCallback(async (roomId: string) => {
    if (!confirm("Hapus percakapan ini secara permanen?")) return;
    setError("");
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}` + getRoleQuery(), { method: "DELETE" });
      if (!res.ok) throw new Error();
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      setActiveRoom(null);
    } catch {
      setError("Gagal menghapus percakapan.");
    }
  }, [getRoleQuery]);

  // Muat daftar room saat mount agar lencana belum-dibaca tampil tanpa dibuka.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/chat/rooms" + getRoleQuery());
        if (!res.ok || cancelled) return;
        setRooms(await res.json());
      } catch {
        // Diamkan: daftar dimuat ulang saat ada event masuk.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getRoleQuery]);

  // Satu koneksi SSE untuk seluruh sesi; EventSource otomatis reconnect.
  useEffect(() => {
    const roleQuery = getRoleQuery();
    const source = new EventSource("/api/chat/stream" + roleQuery);

    source.onmessage = (event) => {
      const incoming = JSON.parse(event.data) as Message & { roomId: string };
      const current = activeRoomRef.current;
      const isMine = incoming.senderRole === myRoleRef.current;
      
      if (!isMine) {
        playNotificationSound();
      }

      if (current && incoming.roomId === current.id) {
        setMessages((prev) =>
          prev.some((m) => m.id === incoming.id)
            ? prev
            : [...prev, { ...incoming, mine: isMine }]
        );
        // Room sedang terbuka, jadi langsung tandai terbaca di server (jika bukan dari diri sendiri).
        if (!isMine) {
          fetch(`/api/chat/rooms/${incoming.roomId}/messages` + roleQuery).catch(() => {});
        }
      } else if (!isMine) {
        // Room tidak terbuka, tampilkan notifikasi push
        showNotification("Pesan Baru Synergy", incoming.content.slice(0, 50) + "...");
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
  }, [loadRooms, getRoleQuery]);

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
      const res = await fetch("/api/chat/rooms" + getRoleQuery());
      if (!res.ok) return;
      const list: RoomSummary[] = await res.json();
      setRooms(list);

      const target = list.find((r) => r.id === roomId);
      if (target) openRoom(target);
    };

    window.addEventListener("synergy:open-chat", handler);
    return () => window.removeEventListener("synergy:open-chat", handler);
  }, [openRoom, getRoleQuery]);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || !activeRoom || isSending) return;

    setIsSending(true);
    setError("");
    try {
      const res = await fetch(`/api/chat/rooms/${activeRoom.id}/messages` + getRoleQuery(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal mengirim pesan.");
      }
      const message: Message = await res.json();
      setMessages((prev) =>
        prev.some((m) => m.id === message.id)
          ? prev.map((m) => (m.id === message.id ? { ...m, mine: true } : m))
          : [...prev, message]
      );
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
                <button
                  type="button"
                  className={styles.newChatButton}
                  style={{ marginLeft: "auto", marginRight: "0.5rem" }}
                  onClick={() => deleteRoom(activeRoom.id)}
                  aria-label="Hapus percakapan"
                  title="Hapus percakapan"
                >
                  <Trash size={16} />
                </button>
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
