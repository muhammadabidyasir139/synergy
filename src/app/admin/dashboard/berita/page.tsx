"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

interface BeritaItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  authorName: string;
}

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  isPublished: boolean;
}

const EMPTY_FORM: FormState = { title: "", slug: "", excerpt: "", content: "", category: "", isPublished: false };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}


export default function BeritaAdminPage() {
  const [items, setItems] = useState<BeritaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchNews(p = page) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/news?page=${p}`);
      const data = await res.json();
      setItems(data.news ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      showToast("Gagal memuat berita", false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchNews(page); }, [page]);

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(item: BeritaItem) {
    setEditId(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: "",
      category: item.category ?? "",
      isPublished: item.isPublished,
    });
    fetch(`/api/admin/news/${item.id}`)
      .then((r) => r.json())
      .then((d) => setForm((f) => ({ ...f, content: d.content ?? "" })));
    setModalOpen(true);
  }

  function handleTitleChange(title: string) {
    setForm((f) => ({ ...f, title, slug: editId ? f.slug : slugify(title) }));
  }

  async function handleSave() {
    if (!form.title || !form.slug || !form.excerpt || !form.content) {
      showToast("Judul, slug, ringkasan, dan konten wajib diisi", false);
      return;
    }
    setSaving(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/admin/news/${editId}` : "/api/admin/news";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error ?? "Terjadi kesalahan", false);
        return;
      }
      showToast(editId ? "Berita diperbarui" : "Berita dibuat");
      setModalOpen(false);
      fetchNews(page);
    } catch {
      showToast("Gagal menyimpan", false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      showToast("Berita dihapus");
      setDeleteConfirm(null);
      fetchNews(page);
    } catch {
      showToast("Gagal menghapus", false);
    }
  }

  async function togglePublish(item: BeritaItem) {
    try {
      await fetch(`/api/admin/news/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      showToast(item.isPublished ? "Berita di-unpublish" : "Berita dipublish");
      fetchNews(page);
    } catch {
      showToast("Gagal update status", false);
    }
  }

  const fmtDate = (s: string | null) =>
    s ? new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

  return (
    <div className={styles.page}>
      {toast && (
        <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErr}`}>
          {toast.msg}
        </div>
      )}

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Manajemen Berita</h1>
          <p className={styles.subtitle}>Kelola artikel berita yang tampil di landing page</p>
        </div>
        <button className={styles.btnCreate} onClick={openCreate}>+ Tulis Berita</button>
      </div>

      <div className={`${styles.tableWrap} glass`}>
        {loading ? (
          <div className={styles.loadingRow}>Memuat...</div>
        ) : items.length === 0 ? (
          <div className={styles.loadingRow}>Belum ada berita.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Judul</th>
                <th>Kategori</th>
                <th>Penulis</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemSlug}>/{item.slug}</span>
                  </td>
                  <td>
                    {item.category ? (
                      <span className={styles.categoryBadge}>{item.category}</span>
                    ) : "—"}
                  </td>
                  <td>{item.authorName}</td>
                  <td>
                    <button
                      className={`${styles.statusBadge} ${item.isPublished ? styles.published : styles.draft}`}
                      onClick={() => togglePublish(item)}
                      title="Klik untuk toggle publish"
                    >
                      {item.isPublished ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td>{fmtDate(item.publishedAt ?? item.createdAt)}</td>
                  <td className={styles.actions}>
                    <button className={styles.btnEdit} onClick={() => openEdit(item)}>Edit</button>
                    <button className={styles.btnDelete} onClick={() => setDeleteConfirm(item.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={styles.pgBtn}>‹</button>
            <span className={styles.pgInfo}>{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className={styles.pgBtn}>›</button>
          </div>
        )}
      </div>

      {/* ── Modal: Create / Edit ── */}
      {modalOpen && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editId ? "Edit Berita" : "Tulis Berita Baru"}</h2>
              <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>×</button>
            </div>

            <div className={styles.modalBody}>
              <label className={styles.label}>Judul *</label>
              <input
                className={styles.input}
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Judul berita"
              />

              <label className={styles.label}>Slug *</label>
              <input
                className={styles.input}
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="url-friendly-slug"
              />

              <div className={styles.row2}>
                <div>
                  <label className={styles.label}>Kategori</label>
                  <select
                    className={styles.input}
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">Pilih Kategori</option>
                    {["Berita", "Teknologi", "Edukasi", "Prestasi", "Kegiatan"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.publishToggle}>
                  <label className={styles.label}>Status</label>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                    />
                    <span className={styles.toggleSlider} />
                    <span className={styles.toggleLabel}>{form.isPublished ? "Published" : "Draft"}</span>
                  </label>
                </div>
              </div>

              <label className={styles.label}>Ringkasan (Excerpt) *</label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="Ringkasan singkat artikel (tampil di kartu berita)"
                rows={3}
              />

              <label className={styles.label}>Konten (HTML) *</label>
              <textarea
                className={`${styles.input} ${styles.textareaLg}`}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="<p>Isi konten artikel...</p>"
                rows={10}
              />
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setModalOpen(false)}>Batal</button>
              <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
                {saving ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Publikasikan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className={styles.overlay}>
          <div className={styles.confirmBox}>
            <p>Yakin ingin menghapus berita ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className={styles.confirmActions}>
              <button className={styles.btnCancel} onClick={() => setDeleteConfirm(null)}>Batal</button>
              <button className={styles.btnDelete} onClick={() => handleDelete(deleteConfirm)}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
