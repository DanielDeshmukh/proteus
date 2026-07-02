"use client";

import { useEffect, useRef } from "react";

const SPACING = 32;
const BASE_RADIUS = 1;
const HOVER_SCALE = 0.005;
const HOVER_RADIUS = 20;

export default function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const hoveredRef = useRef({ gx: -1, gy: -1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";
      ctx!.scale(dpr, dpr);
      render();
    }

    function render() {
      if (!ctx || !canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const hgx = hoveredRef.current.gx;
      const hgy = hoveredRef.current.gy;

      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = c * SPACING;
          const cy = r * SPACING;

          let scale = 1;
          if (c === hgx && r === hgy) {
            scale = HOVER_SCALE;
          } else {
            const dx = mx - cx;
            const dy = my - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < HOVER_RADIUS) {
              const t = dist / HOVER_RADIUS;
              scale = HOVER_SCALE + (1 - HOVER_SCALE) * t * t;
            }
          }

          const radius = BASE_RADIUS * scale;
          if (radius < 0.05) continue;

          const alpha = 0.12 + 0.13 * scale;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fill();
        }
      }
    }

    function onMouseMove(e: MouseEvent) {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      const gx = Math.round(e.clientX / SPACING);
      const gy = Math.round(e.clientY / SPACING);

      if (gx !== hoveredRef.current.gx || gy !== hoveredRef.current.gy) {
        hoveredRef.current.gx = gx;
        hoveredRef.current.gy = gy;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(render);
      }
    }

    function onMouseLeave() {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
      hoveredRef.current.gx = -1;
      hoveredRef.current.gy = -1;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
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
