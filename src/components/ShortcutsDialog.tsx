import { Dialog, Flex, Button, Text } from "@radix-ui/themes";

export interface Shortcut {
  readonly keys: readonly string[];
  readonly label: string;
}

export const SHORTCUTS: readonly Shortcut[] = [
  { keys: ["K"], label: "Play / pause" },
  { keys: ["→"], label: "Step (when paused)" },
  { keys: ["C"], label: "Clear grid" },
  { keys: ["R"], label: "Randomize grid" },
  { keys: ["]"], label: "Speed up" },
  { keys: ["["], label: "Slow down" },
  { keys: ["Space", "+ drag"], label: "Pan canvas" },
  { keys: ["Scroll"], label: "Zoom toward cursor" },
];

export interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="28rem">
        <Dialog.Title>Keyboard shortcuts</Dialog.Title>
        <Dialog.Description size="2" color="gray">
          Everything you can do without the mouse.
        </Dialog.Description>

        <Flex direction="column" gap="2" mt="4" pl="0" asChild>
          <ul aria-label="Keyboard shortcuts">
            {SHORTCUTS.map(({ keys, label }) => (
              <Flex
                key={label}
                asChild
                align="center"
                justify="between"
                gap="3"
              >
                <li>
                  <Text as="span" size="2">
                    {label}
                  </Text>
                  <Flex gap="1" align="center">
                    {keys.map((k) => (
                      <Button key={k} disabled>
                        {k}
                      </Button>
                    ))}
                  </Flex>
                </li>
              </Flex>
            ))}
          </ul>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
