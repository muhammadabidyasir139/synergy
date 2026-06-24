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
  cr: number;
  cg: number;
  cb: number;
}

interface Pulse {
  ai: number;
  bi: number;
  t: number;
  speed: number;
}

// Brand color palette
const PALETTES: [number, number, number][] = [
  [0, 82, 204],
  [0, 210, 255],
  [47, 111, 224],
  [0, 112, 243],
];

const LINE_RGB    = "0, 82, 204";
const CURSOR_RGB  = "47, 111, 224";
const MAX_LINE    = 150;
const CURSOR_LINK = 200;
const CURSOR_R    = 180;
const REPEL       = 5.0;
const BASE_SPEED  = 0.55;
const MAX_SPEED   = 2.8;
const MAX_PULSES  = 6;

export default function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const NUM = isMobile ? 55 : 120;

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
        const base  = Math.random() * 2.2 + 1.4;
        const pal   = PALETTES[Math.floor(Math.random() * PALETTES.length)];
        return {
          x:        Math.random() * W,
          y:        Math.random() * zoneH,
          vx:       Math.cos(angle) * spd,
          vy:       Math.sin(angle) * spd,
          baseSize: base,
          size:     base,
          phase:    Math.random() * Math.PI * 2,
          waveAmp:  Math.random() * 0.4 + 0.1,
          waveFreq: Math.random() * 0.006 + 0.003,
          cr: pal[0], cg: pal[1], cb: pal[2],
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

      type VP = { p: Particle; idx: number; vpX: number; vpY: number };
      const visible: VP[] = [];

      /* 1. Physics — sinusoidal wave + cursor repulsion */
      for (let idx = 0; idx < particles.length; idx++) {
        const p  = particles[idx];
        const wt = frame * p.waveFreq + p.phase;

        // Organic sinusoidal perturbation for non-uniform drift
        p.vx += Math.sin(wt * 1.27) * p.waveAmp * 0.01;
        p.vy += Math.cos(wt * 0.83) * p.waveAmp * 0.01;

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

        // Breathing size
        p.size = p.baseSize * (1 + Math.sin(frame * 0.022 + p.phase) * 0.35);

        const curVpY = p.y - scrollY;
        if (curVpY > -60 && curVpY < H + 60) {
          visible.push({ p, idx, vpX: p.x, vpY: curVpY });
        }
      }

      /* 2. Lines with flickering alpha */
      ctx.lineWidth = 0.9;
      const hotEdges: [number, number][] = [];

      for (let i = 0; i < visible.length; i++) {
        const a = visible[i];
        for (let j = i + 1; j < visible.length; j++) {
          const b = visible[j];
          const d = Math.hypot(a.vpX - b.vpX, a.vpY - b.vpY);
          if (d < MAX_LINE) {
            const base    = (1 - d / MAX_LINE) * 0.42;
            const flicker = Math.sin(frame * 0.016 + a.idx * 0.63 + b.idx * 0.47) * 0.07;
            const alpha   = Math.max(0.02, Math.min(0.6, base + flicker));
            ctx.strokeStyle = `rgba(${LINE_RGB},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.vpX, a.vpY);
            ctx.lineTo(b.vpX, b.vpY);
            ctx.stroke();
            if (alpha > 0.22) hotEdges.push([a.idx, b.idx]);
          }
        }
      }

      /* 3. Spawn data-pulse packets along bright edges */
      if (pulses.length < MAX_PULSES && hotEdges.length > 0 && frame % 22 === 0) {
        const e = hotEdges[Math.floor(Math.random() * hotEdges.length)];
        pulses.push({ ai: e[0], bi: e[1], t: 0, speed: 0.016 + Math.random() * 0.018 });
      }

      /* 4. Animate data pulses */
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.t += pulse.speed;
        if (pulse.t >= 1) { pulses.splice(i, 1); continue; }

        const pa  = particles[pulse.ai];
        const pb  = particles[pulse.bi];
        if (!pa || !pb) { pulses.splice(i, 1); continue; }

        const ayVp = pa.y - scrollY;
        const byVp = pb.y - scrollY;
        const px   = pa.x  + (pb.x  - pa.x) * pulse.t;
        const py   = ayVp  + (byVp  - ayVp)  * pulse.t;
        const env  = Math.sin(pulse.t * Math.PI); // fade-in fade-out envelope

        ctx.save();
        ctx.shadowBlur  = 14;
        ctx.shadowColor = `rgba(0,210,255,${env * 0.9})`;
        ctx.fillStyle   = `rgba(200,240,255,${env})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      /* 5. Cursor-to-particle lines */
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

      /* 6. Nodes — glow + breathing + color variation */
      for (const { p, vpX, vpY } of visible) {
        const pulse = (Math.sin(frame * 0.028 + p.phase) + 1) / 2; // 0..1

        ctx.save();
        ctx.shadowBlur  = p.size * 4.5 + pulse * 4;
        ctx.shadowColor = `rgba(${p.cr},${p.cg},${p.cb},${0.5 + pulse * 0.35})`;
        ctx.fillStyle   = `rgba(${p.cr},${p.cg},${p.cb},0.82)`;
        ctx.beginPath();
        ctx.arc(vpX, vpY, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
      style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 5 }}
    />
  );
}
