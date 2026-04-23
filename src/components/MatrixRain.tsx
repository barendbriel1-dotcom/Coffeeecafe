import { useEffect, useRef } from "react";

export default function MatrixRain({
  className = "",
  interactive = false,
}: {
  className?: string;
  interactive?: boolean;
}) {
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
    const mouse = { x: -9999, y: -9999, active: false };

    const chars = "01";

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = Array(columns).fill(1).map(() => Math.random() * -50);
    };
    window.addEventListener("resize", handleResize);

    const handlePointerMove = (event: PointerEvent) => {
      if (!interactive) return;
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
    };

    const handlePointerLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    if (interactive) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerleave", handlePointerLeave);
    }

    let raf = 0;
    let last = 0;
    const fps = 24;
    const interval = 1000 / fps;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < interval) return;
      last = now;

      ctx.fillStyle = "rgba(0, 0, 0, 0.09)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < columns; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const baseY = drops[i] * fontSize;
        let drawX = x;
        let drawY = baseY;

        if (interactive && mouse.active) {
          const dx = drawX - mouse.x;
          const dy = drawY - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const radius = 120;

          if (distance < radius) {
            const breakStrength = (radius - distance) / radius;
            drawX += (Math.random() - 0.5) * 18 * breakStrength;
            drawY -= Math.random() * 30 * breakStrength;
            if (Math.random() < 0.3) {
              drops[i] = Math.max(0, drops[i] - breakStrength * 3);
            }
          }
        }

        ctx.fillStyle = "#CCFFCC";
        ctx.shadowColor = "#00FF41";
        ctx.shadowBlur = 8;
        ctx.fillText(text, drawX, drawY);

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#00B82D";
        ctx.fillText(text, drawX, drawY - fontSize);

        if (baseY > height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }

      if (interactive && mouse.active) {
        for (let index = 0; index < 18; index += 1) {
          const scatterChar = chars[Math.floor(Math.random() * chars.length)];
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 70;
          const scatterX = mouse.x + Math.cos(angle) * radius;
          const scatterY = mouse.y + Math.sin(angle) * radius;
          ctx.fillStyle = "rgba(0, 255, 65, 0.18)";
          ctx.fillText(scatterChar, scatterX, scatterY);
        }
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerleave", handlePointerLeave);
      }
    };
  }, [interactive]);

  return (
    <canvas
      ref={ref}
      className={`fixed inset-0 -z-10 bg-background ${className}`}
      aria-hidden="true"
    />
  );
}
