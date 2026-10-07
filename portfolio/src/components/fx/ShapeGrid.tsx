"use client";

import { useEffect, useRef } from "react";

/**
 * Drifting square grid; the square under the pointer fills with a colour and
 * fades out, leaving a short trail.
 * Adapted from React Bits "Shape Grid" (https://reactbits.dev/backgrounds/shape-grid,
 * MIT + Commons Clause): squares only, HiDPI canvas, pointer tracked on the
 * whole host section (content sits on top of the canvas), and no drift for
 * prefers-reduced-motion. Like the original it pauses off-screen.
 */
interface ShapeGridProps {
  direction?: "right" | "left" | "up" | "down" | "diagonal";
  speed?: number;
  squareSize?: number;
  borderColor?: string;
  hoverFillColor?: string;
  /** number of previously hovered squares that keep fading behind the pointer */
  hoverTrailAmount?: number;
  className?: string;
}

export function ShapeGrid({
  direction = "diagonal",
  speed = 0.3,
  squareSize = 48,
  borderColor = "rgba(255, 255, 255, 0.05)",
  hoverFillColor = "rgba(0, 255, 198, 0.16)",
  hoverTrailAmount = 4,
  className = "",
}: ShapeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const drift = reduce ? 0 : speed;
    const host = canvas.closest("section") ?? canvas.parentElement ?? canvas;
    const offset = { x: 0, y: 0 };
    let hovered: { x: number; y: number } | null = null;
    let trail: Array<{ x: number; y: number }> = [];
    const opacities = new Map<string, number>();
    let raf: number | null = null;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const wrap = (v: number) => ((v % squareSize) + squareSize) % squareSize;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const ox = wrap(offset.x);
      const oy = wrap(offset.y);
      const cols = Math.ceil(w / squareSize) + 3;
      const rows = Math.ceil(h / squareSize) + 3;
      ctx.lineWidth = 1;
      ctx.strokeStyle = borderColor;
      ctx.fillStyle = hoverFillColor;
      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          // +0.5 keeps 1px lines on the pixel grid (crisp, not blurred)
          const sx = Math.round(col * squareSize + ox) + 0.5;
          const sy = Math.round(row * squareSize + oy) + 0.5;
          const alpha = opacities.get(`${col},${row}`);
          if (alpha) {
            ctx.globalAlpha = alpha;
            ctx.fillRect(sx, sy, squareSize, squareSize);
            ctx.globalAlpha = 1;
          }
          ctx.strokeRect(sx, sy, squareSize, squareSize);
        }
      }
    };

    const updateOpacities = () => {
      const targets = new Map<string, number>();
      if (hovered) targets.set(`${hovered.x},${hovered.y}`, 1);
      trail.forEach((t, i) => {
        const key = `${t.x},${t.y}`;
        if (!targets.has(key)) targets.set(key, (trail.length - i) / (trail.length + 1));
      });
      for (const key of targets.keys()) if (!opacities.has(key)) opacities.set(key, 0);
      for (const [key, value] of opacities) {
        const next = value + ((targets.get(key) ?? 0) - value) * 0.15;
        if (next < 0.005) opacities.delete(key);
        else opacities.set(key, next);
      }
    };

    const step = () => {
      const s = Math.max(drift, 0);
      if (direction === "right" || direction === "diagonal") offset.x -= s;
      if (direction === "left") offset.x += s;
      if (direction === "up") offset.y += s;
      if (direction === "down" || direction === "diagonal") offset.y -= s;
      updateOpacities();
      draw();
      raf = requestAnimationFrame(step);
    };

    const pushTrail = () => {
      if (!hovered || hoverTrailAmount <= 0) return;
      trail.unshift({ ...hovered });
      trail = trail.slice(0, hoverTrailAmount);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return;
      const col = Math.floor((x - wrap(offset.x)) / squareSize);
      const row = Math.floor((y - wrap(offset.y)) / squareSize);
      if (!hovered || hovered.x !== col || hovered.y !== row) {
        pushTrail();
        hovered = { x: col, y: row };
      }
    };
    const onLeave = () => {
      pushTrail();
      hovered = null;
    };
    host.addEventListener("pointermove", onMove as EventListener);
    host.addEventListener("pointerleave", onLeave);

    let onScreen = false;
    const start = () => {
      if (onScreen && !document.hidden && raf === null) raf = requestAnimationFrame(step);
    };
    const stop = () => {
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = !!entry?.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointermove", onMove as EventListener);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [direction, speed, squareSize, borderColor, hoverFillColor, hoverTrailAmount]);

  return <canvas ref={canvasRef} className={`shapegrid ${className}`} aria-hidden="true" />;
}
