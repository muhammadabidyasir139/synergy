"use client";

import { useEffect, useRef } from "react";

const SECTION_IDS = ["teknologi", "tim", "berita"];

export default function CursorAura() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const dotRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current!;
    const inner = innerRef.current!;
    const dot   = dotRef.current!;
    if (!outer || !inner || !dot) return;

    let visible = false;
    let raf = 0;
    let cx = -9999, cy = -9999;

    function inTargetSection(x: number, y: number) {
      return SECTION_IDS.some((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      });
    }

    function applyPos() {
      outer.style.transform = `translate(calc(${cx}px - 50%), calc(${cy}px - 50%))`;
      inner.style.transform = `translate(calc(${cx}px - 50%), calc(${cy}px - 50%))`;
      dot.style.transform   = `translate(calc(${cx}px - 50%), calc(${cy}px - 50%))`;
    }

    function onMove(e: MouseEvent) {
      cx = e.clientX;
      cy = e.clientY;

      const hit = inTargetSection(cx, cy);

      if (hit && !visible) {
        outer.style.opacity = "1";
        inner.style.opacity = "1";
        dot.style.opacity   = "1";
        visible = true;
      } else if (!hit && visible) {
        outer.style.opacity = "0";
        inner.style.opacity = "0";
        dot.style.opacity   = "0";
        visible = false;
      }

      if (visible) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(applyPos);
      }
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", () => {
      outer.style.opacity = "0";
      inner.style.opacity = "0";
      dot.style.opacity   = "0";
      visible = false;
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const base: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    pointerEvents: "none",
    willChange: "transform",
    borderRadius: "50%",
    opacity: 0,
    transition: "opacity 0.35s ease",
    mixBlendMode: "screen",
  };

  return (
    <>
      {/* Outer wide glow — large soft halo */}
      <div
        ref={outerRef}
        style={{
          ...base,
          zIndex: 48,
          width: 420,
          height: 420,
          background:
            "radial-gradient(circle, rgba(100,200,255,0.10) 0%, rgba(47,134,255,0.06) 45%, transparent 70%)",
        }}
      />

      {/* Inner mid glow — brighter core */}
      <div
        ref={innerRef}
        style={{
          ...base,
          zIndex: 49,
          width: 160,
          height: 160,
          background:
            "radial-gradient(circle, rgba(160,225,255,0.22) 0%, rgba(80,170,255,0.12) 50%, transparent 70%)",
        }}
      />

      {/* Cursor dot — sharp center light point */}
      <div
        ref={dotRef}
        style={{
          ...base,
          zIndex: 50,
          width: 10,
          height: 10,
          background: "rgba(190,235,255,0.90)",
          boxShadow:
            "0 0 8px 3px rgba(120,210,255,0.65), 0 0 22px 6px rgba(80,170,255,0.30)",
          mixBlendMode: "screen",
        }}
      />
    </>
  );
}
