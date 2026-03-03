"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type SequentialPostTitleProps = {
  title: string;
};

export default function SequentialPostTitle({ title }: SequentialPostTitleProps) {
  const chars = useMemo(() => Array.from(title), [title]);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const measureCharRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const [lines, setLines] = useState<string[] | null>(null);
  const [isActive, setIsActive] = useState(false);

  useLayoutEffect(() => {
    if (lines) return;
    if (!containerRef.current) return;
    if (measureCharRefs.current.length === 0) return;

    const buckets: Array<{ top: number; text: string }> = [];

    chars.forEach((char, index) => {
      const el = measureCharRefs.current[index];
      if (!el) return;
      const top = Math.round(el.offsetTop);
      const last = buckets[buckets.length - 1];

      if (!last || last.top !== top) {
        buckets.push({ top, text: char });
      } else {
        last.text += char;
      }
    });

    if (buckets.length > 0) {
      const raf = requestAnimationFrame(() => {
        setLines(buckets.map((bucket) => bucket.text));
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [chars, lines]);

  useEffect(() => {
    const handleResize = () => {
      setLines(null);
      setIsActive(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!lines) return;
    const raf = requestAnimationFrame(() => {
      setIsActive(true);
    });

    return () => cancelAnimationFrame(raf);
  }, [lines, title]);

  if (!lines) {
    return (
      <span className="post-title-sequential post-title-measuring" aria-hidden="true">
        <span ref={containerRef} className="post-title-measure">
          {chars.map((char, index) => (
            <span
              key={`${char}-${index}`}
              ref={(el) => {
                measureCharRefs.current[index] = el;
              }}
              className="post-title-measure-char"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`post-title-sequential${isActive ? " is-active" : ""}`}
      aria-hidden="true"
    >
      {lines.map((line, index) => (
        <span
          key={`${line}-${index}`}
          className="post-title-line"
          style={{ "--title-line-index": index } as CSSProperties}
        >
          <span className="post-title-base">{line}</span>
          <span className="post-title-overlay">{line}</span>
        </span>
      ))}
    </span>
  );
}
