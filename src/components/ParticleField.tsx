"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSize: number;
  size: number;
  phase: number;
  waveAmp: number;
  waveFreq: number;
  colorStr: string;   // pre-computed "r,g,b" — avoids string building per frame
  glowPulse: number;  // cached each physics tick, reused in draw
}

interface Pulse {
  ai: number;
  bi: number;
  t: number;
  speed: number;
}

const PALETTES: [number, number, number][] = [
  [0,  82, 204],
  [0, 210, 255],
  [47, 111, 224],
  [0, 112, 243],
];

const LINE_RGB    = "0,82,204";
const CURSOR_RGB  = "47,111,224";
const MAX_LINE    = 150;
const CURSOR_LINK = 200;
const CURSOR_R    = 180;
const REPEL       = 5.0;
const BASE_SPEED  = 0.55;
const MAX_SPEED   = 2.8;
const MAX_PULSES  = 3;

export default function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    // Fewer particles on every platform — makes O(n²) line check proportionally cheaper
    const NUM = isMobile ? 38 : 85;

    let particles: Particle[] = [];
    let pulses: Pulse[] = [];
    const mouse = { x: -9999, y: -9999 };
    let zoneH = window.innerHeight * 2.5;
    let raf = 0;
    let frame = 0;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();

    function initParticles() {
      const tentang = document.getElementById("tentang");
      zoneH = tentang
        ? tentang.getBoundingClientRect().bottom + window.scrollY + 80
        : window.innerHeight * 2.5;

      const W = window.innerWidth;
      particles = Array.from({ length: NUM }, () => {
        const angle = Math.random() * Math.PI * 2;
        const spd   = (Math.random() * 0.6 + 0.35) * BASE_SPEED;
        const base  = Math.random() * 2.0 + 1.2;
        const pal   = PALETTES[Math.floor(Math.random() * PALETTES.length)];
        return {
          x:         Math.random() * W,
          y:         Math.random() * zoneH,
          vx:        Math.cos(angle) * spd,
          vy:        Math.sin(angle) * spd,
          baseSize:  base,
          size:      base,
          phase:     Math.random() * Math.PI * 2,
          waveAmp:   Math.random() * 0.35 + 0.08,
          waveFreq:  Math.random() * 0.005 + 0.002,
          colorStr:  `${pal[0]},${pal[1]},${pal[2]}`,
          glowPulse: 0,
        };
      });
      pulses = [];
    }

    function draw() {
      const W       = canvas.width;
      const H       = canvas.height;
      const scrollY = window.scrollY;
      frame++;

      ctx.clearRect(0, 0, W, H);

      // ONE sin call per frame replaces O(n²) per-pair calls for line flicker
      const globalFlicker = Math.sin(frame * 0.015) * 0.05;

      type VP = { p: Particle; idx: number; vpX: number; vpY: number };
      const visible: VP[] = [];

      /* ── 1. Physics — organic wave motion ── */
      for (let idx = 0; idx < particles.length; idx++) {
        const p  = particles[idx];
        const wt = frame * p.waveFreq + p.phase;

        p.vx += Math.sin(wt * 1.27) * p.waveAmp * 0.009;
        p.vy += Math.cos(wt * 0.83) * p.waveAmp * 0.009;

        const vpY = p.y - scrollY;
        const dx  = p.x - mouse.x;
        const dy  = vpY - mouse.y;
        const d0  = Math.hypot(dx, dy);
        if (d0 < CURSOR_R && d0 > 0.1) {
          const f = (1 - d0 / CURSOR_R) * REPEL;
          p.vx += (dx / d0) * f * 0.14;
          p.vy += (dy / d0) * f * 0.14;
        }

        const spd = Math.hypot(p.vx, p.vy);
        if (spd > MAX_SPEED) { p.vx = p.vx / spd * MAX_SPEED; p.vy = p.vy / spd * MAX_SPEED; }
        p.vx *= 0.985;
        p.vy *= 0.985;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0)     { p.x = 0;      p.vx =  Math.abs(p.vx); }
        if (p.x > W)     { p.x = W;      p.vx = -Math.abs(p.vx); }
        if (p.y < 0)     { p.y = 0;      p.vy =  Math.abs(p.vy); }
        if (p.y > zoneH) { p.y = zoneH;  p.vy = -Math.abs(p.vy); }

        // Compute once, cache — reused in the draw step below (avoids double-computing)
        p.size      = p.baseSize * (1 + Math.sin(frame * 0.022 + p.phase) * 0.28);
        p.glowPulse = (Math.sin(frame * 0.028 + p.phase) + 1) * 0.5;

        const curVpY = p.y - scrollY;
        if (curVpY > -60 && curVpY < H + 60) {
          visible.push({ p, idx, vpX: p.x, vpY: curVpY });
        }
      }

      /* ── 2. Lines — global flicker, no per-pair sin ── */
      ctx.lineWidth = 0.9;
      const hotEdges: [number, number][] = [];

      for (let i = 0; i < visible.length; i++) {
        const a = visible[i];
        for (let j = i + 1; j < visible.length; j++) {
          const b = visible[j];
          const d = Math.hypot(a.vpX - b.vpX, a.vpY - b.vpY);
          if (d < MAX_LINE) {
            const alpha = Math.max(0.02, Math.min(0.55, (1 - d / MAX_LINE) * 0.42 + globalFlicker));
            ctx.strokeStyle = `rgba(${LINE_RGB},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.vpX, a.vpY);
            ctx.lineTo(b.vpX, b.vpY);
            ctx.stroke();
            if (alpha > 0.2) hotEdges.push([a.idx, b.idx]);
          }
        }
      }

      /* ── 3. Spawn data pulses ── */
      if (pulses.length < MAX_PULSES && hotEdges.length > 0 && frame % 35 === 0) {
        const e = hotEdges[Math.floor(Math.random() * hotEdges.length)];
        pulses.push({ ai: e[0], bi: e[1], t: 0, speed: 0.018 + Math.random() * 0.016 });
      }

      /* ── 4. Data pulses — two plain circles, NO shadowBlur ── */
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.t += pulse.speed;
        if (pulse.t >= 1) { pulses.splice(i, 1); continue; }

        const pa  = particles[pulse.ai];
        const pb  = particles[pulse.bi];
        if (!pa || !pb) { pulses.splice(i, 1); continue; }

        const px  = pa.x  + (pb.x  - pa.x) * pulse.t;
        const py  = (pa.y - scrollY) + ((pb.y - scrollY) - (pa.y - scrollY)) * pulse.t;
        const env = Math.sin(pulse.t * Math.PI);

        ctx.fillStyle = `rgba(0,210,255,${env * 0.28})`;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(200,240,255,${env * 0.9})`;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ── 5. Cursor lines ── */
      if (mouse.x > -100) {
        ctx.lineWidth = 0.8;
        for (const { vpX, vpY } of visible) {
          const d = Math.hypot(vpX - mouse.x, vpY - mouse.y);
          if (d < CURSOR_LINK) {
            ctx.strokeStyle = `rgba(${CURSOR_RGB},${(1 - d / CURSOR_LINK) * 0.35})`;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(vpX, vpY);
            ctx.stroke();
          }
        }
      }

      /* ── 6. Nodes — two plain circles instead of shadowBlur ──
              Outer (large, low-alpha): simulates a glow halo cheaply.
              Inner (core dot): the actual node.
              No save/restore, no shadowBlur = zero GPU blur passes.      */
      for (const { p, vpX, vpY } of visible) {
        // Halo — big, mostly transparent circle
        ctx.fillStyle = `rgba(${p.colorStr},${0.07 + p.glowPulse * 0.06})`;
        ctx.beginPath();
        ctx.arc(vpX, vpY, p.size * 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(${p.colorStr},0.8)`;
        ctx.beginPath();
        ctx.arc(vpX, vpY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    const onMouseMove  = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const onResize     = () => { resize(); };

    window.addEventListener("mousemove",    onMouseMove,  { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize",       onResize,     { passive: true });

    const t = setTimeout(() => { initParticles(); draw(); }, 220);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove",    onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize",       onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 5,
        willChange: "transform", // promote to own GPU compositing layer
      }}
    />
  );
}
