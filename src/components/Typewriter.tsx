import { useEffect, useState } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  startDelay?: number;
  className?: string;
}

/**
 * Types out `text` one character at a time with a live blinking caret.
 * Uses an invisible copy of the full text to reserve space, so the
 * surrounding layout never shifts while typing. Respects reduced motion.
 */
const Typewriter = ({ text, speed = 52, startDelay = 300, className = '' }: TypewriterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setCount(text.length);
      return;
    }

    setCount(0);
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setCount(i);
      if (i < text.length) timeout = setTimeout(tick, speed);
    };
    const starter = setTimeout(tick, startDelay);
    return () => {
      clearTimeout(starter);
      clearTimeout(timeout);
    };
  }, [text, speed, startDelay]);

  return (
    <span className={`relative inline-block whitespace-pre-line ${className}`}>
      {/* reserves the final size to avoid layout shift */}
      <span className="invisible" aria-hidden="true">
        {text}
      </span>
      <span className="absolute inset-0" aria-hidden="true">
        {text.slice(0, count)}
        <span className="type-caret" />
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
};

export default Typewriter;
