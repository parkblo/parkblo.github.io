"use client";

import { useState, useEffect } from "react";

export default function Header() {
  const [text, setText] = useState("");
  const fullText = "hello world! I'm parkblo.";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="pt-1 pb-4 md:pt-8 md:pb-12 flex items-start gap-4">
      <h1 className="text-xl font-bold tracking-tight text-accent italic">
        parkblo
      </h1>

      <div className="relative mt-1 ml-2">
        {/* Pixel Art Bubble */}
        <div className="bg-white text-background px-4 py-2 relative text-xs font-bold whitespace-nowrap pixel-border">
          {text}
          <span className="inline-block w-1.5 h-3 bg-background ml-1 animate-pulse align-middle" />

          {/* Bubble Tail (Pixel squares) */}
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 flex flex-col items-end">
            <div className="w-1.5 h-1.5 bg-white" />
            <div className="w-1.5 h-1.5 bg-white mr-1.5" />
          </div>
        </div>
      </div>
    </header>
  );
}
