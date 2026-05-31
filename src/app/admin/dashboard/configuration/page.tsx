"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface ConfigField {
  key: string;
  label: string;
  value: string;
  unit: string;
}

const initialConfig: ConfigField[] = [
  { key: "nisbah_mudharabah", label: "Nisbah Mudharabah (Investor)", value: "60", unit: "%" },
  { key: "nisbah_musyarakah", label: "Nisbah Musyarakah (Investor)", value: "50", unit: "%" },
  { key: "platform_fee", label: "Platform Fee", value: "2.5", unit: "%" },
  { key: "ai_threshold_low", label: "AI Threshold – Low Risk", value: "30", unit: "score" },
  { key: "ai_threshold_medium", label: "AI Threshold – Medium Risk", value: "60", unit: "score" },
  { key: "ai_threshold_high", label: "AI Threshold – High Risk", value: "80", unit: "score" },
  { key: "max_funding_days", label: "Maks Hari Pendanaan", value: "90", unit: "hari" },
  { key: "min_investment", label: "Min Investasi", value: "100000", unit: "Rp" },
];

export default function ConfigurationPage() {
  const [config, setConfig] = useState<ConfigField[]>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, newValue: string) => {
    setConfig((prev) =>
      prev.map((c) => (c.key === key ? { ...c, value: newValue } : c))
    );
    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 1200);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>⚙️ Konfigurasi Nisbah & AI</h1>
      <p className={styles.subtitle}>Atur parameter bagi hasil, fee, dan threshold AI scoring</p>

      <div className={styles.configGrid}>
        {config.map((field) => (
          <div key={field.key} className={styles.fieldCard}>
            <label className={styles.fieldLabel}>{field.label}</label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={styles.fieldInput}
                value={field.value}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
              <span className={styles.fieldUnit}>{field.unit}</span>
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
