"use client";

import { useEffect, useRef } from "react";
import styles from "./CursorGlow.module.css";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      
      const x = e.clientX;
      const y = e.clientY;
      
      // Update position via CSS variables for smooth 60fps performance
      // without triggering React state re-renders
      glowRef.current.style.setProperty('--cursor-x', `${x}px`);
      glowRef.current.style.setProperty('--cursor-y', `${y}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <div ref={glowRef} className={styles.cursorGlow} />;
}
