import type { CanvasTheme } from "../types/canvas";
import type { Shortcut } from "../types/ui";

export const DEFAULT_THEME: CanvasTheme = {
  background: "#0b0d10",
  grid: "#1f242b",
  alive: "#e8edf2",
};

export const SHORTCUTS: readonly Shortcut[] = [
  { keys: ["K"], label: "Play / pause" },
  { keys: ["→"], label: "Step (when paused)" },
  { keys: ["←"], label: "Undo last step" },
  { keys: ["C"], label: "Clear grid" },
  { keys: ["R"], label: "Randomize grid" },
  { keys: ["]"], label: "Speed up" },
  { keys: ["["], label: "Slow down" },
  { keys: ["Space", "+ drag"], label: "Pan canvas" },
  { keys: ["Scroll"], label: "Zoom toward cursor" },
];
