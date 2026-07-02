"use client";

import { useEffect, useRef } from "react";

const SPACING = 32;
const BASE_RADIUS = 1;
const MAX_RADIUS = 3;
const TWINKLE_COUNT = 12;
const TWINKLE_SPEED = 0.015;

interface Star {
  gx: number;
  gy: number;
  phase: number;
  speed: number;
  maxScale: number;
}

export default function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";
      ctx!.scale(dpr, dpr);
    }

    function spawnStar(): Star {
      const cols = Math.ceil(window.innerWidth / SPACING);
      const rows = Math.ceil(window.innerHeight / SPACING);
      return {
        gx: Math.floor(Math.random() * cols),
        gy: Math.floor(Math.random() * rows),
        phase: 0,
        speed: TWINKLE_SPEED + Math.random() * 0.02,
        maxScale: 1.5 + Math.random() * 2,
      };
    }

    function render() {
      if (!ctx || !canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const stars = starsRef.current;

      while (stars.length < TWINKLE_COUNT) {
        stars.push(spawnStar());
      }

      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.phase += s.speed;

        if (s.phase > Math.PI) {
          stars.splice(i, 1);
          continue;
        }

        const t = Math.sin(s.phase);
        const scale = 1 + t * s.maxScale;
        const radius = BASE_RADIUS * scale;
        const alpha = 0.15 + t * 0.55;

        const cx = s.gx * SPACING;
        const cy = s.gy * SPACING;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }

      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = c * SPACING;
          const cy = r * SPACING;
          ctx.beginPath();
          ctx.arc(cx, cy, BASE_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
