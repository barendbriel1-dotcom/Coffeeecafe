import { cn } from "@/lib/utils";

interface DecypherTextProps {
  text?: string;
  className?: string;
}

export default function DecypherText({ text = "DECYPHERING CODE", className }: DecypherTextProps) {
  return (
    <div className={cn("loader-wrapper matrix-loader-text", className)} aria-label={text}>
      {text.split("").map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          className={cn("loader-letter", letter === " " && "w-[0.45em]")}
          style={{ animationDelay: `${0.1 + index * 0.105}s` }}
          aria-hidden="true"
        >
          {letter === " " ? "\u00a0" : letter}
        </span>
      ))}
      <span className="cursor-blink" aria-hidden="true"></span>
      <div className="loader" aria-hidden="true" />
    </div>
  );
}
