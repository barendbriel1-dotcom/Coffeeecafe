import { useEffect, useState } from "react";
import MatrixRain from "./MatrixRain";

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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ${
        phase === "fade" ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <MatrixRain />
      
      {phase !== "raining" && (
        <div className="font-display text-2xl md:text-4xl text-primary glow tracking-widest z-10 bg-background/60 p-4 rounded backdrop-blur-sm">
          {text}
        </div>
      )}
    </div>
  );
}
