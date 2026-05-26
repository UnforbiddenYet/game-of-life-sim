import type { HistoryFrame } from '../types/game';

export function historyCap(size: number): number {
  if (size <= 100) return 500;
  if (size <= 300) return 100;
  return 20;
}

export function pushBounded(
  stack: readonly HistoryFrame[],
  frame: HistoryFrame,
  size: number,
): readonly HistoryFrame[] {
  const cap = historyCap(size);
  if (stack.length >= cap) return [...stack.slice(stack.length - cap + 1), frame];
  return [...stack, frame];
}
