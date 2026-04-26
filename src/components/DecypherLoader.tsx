import { useEffect, useState } from "react";
import MatrixRain from "./MatrixRain";
import DecypherText from "./DecypherText";

export default function DecypherLoader({ isReady, onComplete }: { isReady: boolean; onComplete: () => void }) {
  const targetText = "DECYPHERING CODE...";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"raining" | "decoding" | "fade">("raining");

  useEffect(() => {
    // If auth is resolved, give it at least a brief moment of rain before decoding
    if (isReady && phase === "raining") {
      const t = setTimeout(() => setPhase("decoding"), 800);
      return () => clearTimeout(t);
    }
  }, [isReady, phase]);

  useEffect(() => {
    if (phase !== "decoding") return;
    
    let iteration = 0;
    const interval = setInterval(() => {
      setText(targetText.split("").map((letter, index) => {
        if (index < iteration) return targetText[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(""));

      if (iteration >= targetText.length) {
        clearInterval(interval);
        setTimeout(() => setPhase("fade"), 800); // Wait 800ms on the final text before fading
      }
      iteration += 1 / 2; // Decoding speed
    }, 30);
    
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === "fade") {
      const t = setTimeout(() => {
        onComplete();
      }, 500); // 500ms fade transition
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        phase === "fade" ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <MatrixRain className="opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1),transparent_24%)]" />

      <div className="z-10 rounded-[1.8rem] border border-primary/20 bg-background/58 px-6 py-5 text-center shadow-[var(--shadow-strong)] backdrop-blur-sm">
        <div className="font-display text-2xl text-primary glow tracking-[0.24em] uppercase md:text-4xl">
          {phase === "raining" ? (
            <DecypherText />
          ) : (
            text
          )}
        </div>
        <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.32em] text-primary/45">
          Initializing access shell
        </div>
      </div>
    </div>
  );
}
