"use client";

import { useEffect, useRef } from "react";

const SPACING = 32;
const BASE_RADIUS = 1.2;
const HOVER_RADIUS = 18;
const DECAY_MS = 1000;
const LERP_SPEED = 0.08;

export default function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const smoothRef = useRef({ x: -9999, y: -9999 });
  const hoverRef = useRef({ gx: -1, gy: -1, time: 0 });
  const lastHoverRef = useRef({ gx: -1, gy: -1, time: 0 });
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

    function render() {
      if (!ctx || !canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const now = performance.now();

      const sm = smoothRef.current;
      sm.x += (mx - sm.x) * LERP_SPEED;
      sm.y += (my - sm.y) * LERP_SPEED;

      const cur = hoverRef.current;
      const prev = lastHoverRef.current;

      const elapsed = now - cur.time;
      const decay = Math.min(elapsed / DECAY_MS, 1);
      const fade = 1 - decay * decay;

      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = c * SPACING;
          const cy = r * SPACING;

          let boost = 0;

          if (cur.gx >= 0) {
            const dx = sm.x - cx;
            const dy = sm.y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < HOVER_RADIUS) {
              const t = 1 - dist / HOVER_RADIUS;
              boost = t * t * (3 - 2 * t) * fade;
            }
          }

          if (boost < 0.01 && prev.gx >= 0 && decay < 1) {
            const px = prev.gx * SPACING;
            const py = prev.gy * SPACING;
            const dx = px - cx;
            const dy = py - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < HOVER_RADIUS * 2) {
              const t = 1 - dist / (HOVER_RADIUS * 2);
              boost = Math.max(boost, t * t * (1 - decay));
            }
          }

          const radius = BASE_RADIUS + boost * 3;
          const alpha = 0.18 + boost * 0.6;

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

      const gx = Math.round(e.clientX / SPACING);
      const gy = Math.round(e.clientY / SPACING);

      if (gx !== hoverRef.current.gx || gy !== hoverRef.current.gy) {
        lastHoverRef.current = { ...hoverRef.current };
        hoverRef.current = { gx, gy, time: performance.now() };
      }
    }

    function onMouseLeave() {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
      lastHoverRef.current = { ...hoverRef.current };
      hoverRef.current = { gx: -1, gy: -1, time: performance.now() };
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
