"use client";

import { useEffect, useRef } from "react";

const SPACING = 32;
const BASE_RADIUS = 1.2;
const HOVER_RANGE = 60;
const DECAY_MS = 1000;

export default function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, time: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastMouseTime = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";
      ctx!.scale(dpr, dpr);
    }

    function render() {
      if (!ctx || !canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mTime = mouseRef.current.time;
      const now = performance.now();
      const mouseAge = now - mTime;

      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = c * SPACING;
          const cy = r * SPACING;

          const dx = mx - cx;
          const dy = my - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let boost = 0;

          if (dist < HOVER_RANGE) {
            const proximity = 1 - dist / HOVER_RANGE;
            boost = proximity * proximity * (3 - 2 * proximity);
          }

          if (mouseAge > 0 && boost < 0.01) {
            const decay = Math.min(mouseAge / DECAY_MS, 1);
            const residual = 1 - decay * decay;
            if (residual > 0.01) {
              const prevRange = HOVER_RANGE + mouseAge * 0.15;
              if (dist < prevRange) {
                const p = 1 - dist / prevRange;
                boost = p * p * residual * 0.6;
              }
            }
          }

          if (boost < 0.01) continue;

          const radius = BASE_RADIUS + boost * 4;
          const alpha = 0.18 + boost * 0.65;

          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(render);
    }

    function onMouseMove(e: MouseEvent) {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.time = performance.now();
    }

    function onMouseLeave() {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
      mouseRef.current.time = performance.now();
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
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
