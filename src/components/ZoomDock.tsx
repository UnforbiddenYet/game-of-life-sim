import { Flex, IconButton } from "@radix-ui/themes";
import { Maximize, ZoomIn, ZoomOut } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { fitCamera, zoomCamera } from "../core/camera";
import { useGameUi } from "../state/hooks";
import type { Camera, Viewport } from "../types/camera";

const ZOOM_STEP = 0.2;

interface ZoomDockProps {
  viewport: Viewport;
  setCamera: Dispatch<SetStateAction<Camera>>;
}

export function ZoomDock({ viewport, setCamera }: ZoomDockProps) {
  const { size } = useGameUi();
  const center = { x: viewport.width / 2, y: viewport.height / 2 };
  return (
    <Flex
      className="zoom-dock"
      direction="column"
      align="center"
      gap="3"
      px="2"
      py="3"
      aria-label="Zoom controls"
    >
      <IconButton
        aria-label="Zoom in"
        variant="surface"
        color="gray"
        radius="full"
        size="3"
        onClick={() => setCamera((c) => zoomCamera(c, center, -ZOOM_STEP))}
      >
        <ZoomIn size={18} />
      </IconButton>
      <IconButton
        aria-label="Zoom out"
        variant="surface"
        color="gray"
        radius="full"
        size="3"
        onClick={() => setCamera((c) => zoomCamera(c, center, ZOOM_STEP))}
      >
        <ZoomOut size={18} />
      </IconButton>
      <span className="dock-divider-h" aria-hidden="true" />
      <IconButton
        aria-label="Reset zoom"
        variant="surface"
        color="gray"
        radius="full"
        size="3"
        onClick={() => setCamera(fitCamera(size, viewport))}
      >
        <Maximize size={18} />
      </IconButton>
    </Flex>
  );
}
