import { useEffect, useState, type RefObject } from 'react';

export interface Size {
  readonly width: number;
  readonly height: number;
}

/**
 * Tracks the content-box size of an element via ResizeObserver. Returns
 * `{ width: 0, height: 0 }` until the first measurement lands.
 */
export function useElementSize(ref: RefObject<HTMLElement | null>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}
