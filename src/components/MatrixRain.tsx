import { useEffect, useRef } from "react";

/** Full-screen Matrix-style binary rain canvas (pure black + neon green). */
export default function MatrixRain({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const fontSize = 16;
    let columns = Math.floor(width / fontSize);
    let drops: number[] = Array(columns).fill(1).map(() => Math.random() * -50);

    const chars = "01";

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = Array(columns).fill(1).map(() => Math.random() * -50);
    };
    window.addEventListener("resize", handleResize);

    let raf = 0;
    let last = 0;
    const fps = 24;
    const interval = 1000 / fps;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < interval) return;
      last = now;

      // fade trail
      ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "Share Tech Mono", monospace`;

      for (let i = 0; i < columns; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // bright leading char
        ctx.fillStyle = "#CCFFCC";
        ctx.shadowColor = "#00FF41";
        ctx.shadowBlur = 8;
        ctx.fillText(text, x, y);

        // dim trail char above
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#00B82D";
        ctx.fillText(text, x, y - fontSize);

        if (y > height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className={`fixed inset-0 -z-10 bg-background ${className}`}
      aria-hidden="true"
    />
  );
}
