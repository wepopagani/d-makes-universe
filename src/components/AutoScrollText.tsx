import { useLayoutEffect, useRef, useState } from "react";

type AutoScrollTextProps = {
  text: string;
  className?: string;
};

const AutoScrollText = ({ text, className = "" }: AutoScrollTextProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowPx, setOverflowPx] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current;
      const el = textRef.current;
      if (!wrap || !el) return;
      setOverflowPx(Math.max(0, el.scrollWidth - wrap.clientWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [text]);

  const duration = Math.max(4, overflowPx / 28);

  return (
    <div ref={wrapRef} className="min-w-0 overflow-hidden" title={text}>
      <span
        ref={textRef}
        className={`inline-block max-w-none whitespace-nowrap ${className}`}
        style={
          overflowPx > 0
            ? {
                ["--scroll-x" as string]: `${overflowPx}px`,
                animation: `auto-scroll-name ${duration}s ease-in-out infinite alternate`,
              }
            : undefined
        }
      >
        {text}
      </span>
    </div>
  );
};

export default AutoScrollText;
