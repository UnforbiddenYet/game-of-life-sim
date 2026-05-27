import { Flex, IconButton } from "@radix-ui/themes";
import { Pause, Play, SkipForward, SkipBack, X } from "lucide-react";
import * as Actions from "../state/actions";
import { useEngine, useGameDispatch, useGameUi } from "../state/hooks";

export function PlaybackDock() {
  const { mode, canUndo } = useGameUi();
  const dispatch = useGameDispatch();
  const engine = useEngine();
  const playing = mode === "playing";

  return (
    <Flex
      className="playback-dock"
      align="center"
      justify="center"
      gap="3"
      px="3"
      py="2"
      aria-label="Playback controls"
    >
      <IconButton
        aria-label="Undo last step"
        variant="surface"
        color="gray"
        radius="full"
        size="3"
        disabled={playing || !canUndo}
        onClick={() => engine.undo()}
      >
        <SkipBack size={18} />
      </IconButton>

      <IconButton
        aria-label={playing ? "Pause simulation" : "Play simulation"}
        variant="solid"
        color="gray"
        radius="full"
        size="4"
        className="dock-play"
        onClick={() => dispatch(playing ? Actions.pause() : Actions.play())}
      >
        {playing ? <Pause size={20} /> : <Play size={20} />}
      </IconButton>

      <IconButton
        aria-label="Step simulation"
        variant="surface"
        color="gray"
        radius="full"
        size="3"
        disabled={playing}
        onClick={() => engine.step()}
      >
        <SkipForward size={18} />
      </IconButton>

      <span className="dock-divider" aria-hidden="true" />

      <IconButton
        aria-label="Clear grid"
        variant="solid"
        color="red"
        radius="full"
        size="3"
        onClick={() => engine.clear()}
      >
        <X size={18} />
      </IconButton>
    </Flex>
  );
}
