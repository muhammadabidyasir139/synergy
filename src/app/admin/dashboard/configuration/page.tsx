"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";

interface ConfigField {
  id: string;
  key: string;
  description: string | null;
  value: string;
  updatedAt: string;
}

const UNIT_MAP: Record<string, string> = {
  nisbah_mudharabah: "%",
  nisbah_musyarakah: "%",
  platform_fee: "%",
  ai_threshold_low: "score",
  ai_threshold_medium: "score",
  ai_threshold_high: "score",
  max_funding_days: "hari",
  min_investment: "Rp",
};

export default function ConfigurationPage() {
  const [config, setConfig] = useState<ConfigField[]>([]);
  const [local, setLocal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchConfig = useCallback(async () => {
    const res = await fetch("/api/admin/config");
    const data: ConfigField[] = await res.json();
    setConfig(data);
    const map: Record<string, string> = {};
    data.forEach((c) => { map[c.key] = c.value; });
    setLocal(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleChange = (key: string, newValue: string) => {
    setLocal((prev) => ({ ...prev, [key]: newValue }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const updates = Object.entries(local).map(([key, value]) => ({ key, value }));
    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      setSaved(true);
      await fetchConfig();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "4rem", opacity: 0.6 }}>Memuat konfigurasi...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>⚙️ Konfigurasi Nisbah & AI</h1>
      <p className={styles.subtitle}>Atur parameter bagi hasil, fee, dan threshold AI scoring</p>

      <div className={styles.configGrid}>
        {config.map((field) => (
          <div key={field.key} className={styles.fieldCard}>
            <label className={styles.fieldLabel}>{field.description ?? field.key}</label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={styles.fieldInput}
                value={local[field.key] ?? field.value}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
              <span className={styles.fieldUnit}>{UNIT_MAP[field.key] ?? ""}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? "⏳ Menyimpan..." : saved ? "✅ Tersimpan!" : "💾 Simpan Konfigurasi"}
        </button>
      </div>
    </div>
  );
}
