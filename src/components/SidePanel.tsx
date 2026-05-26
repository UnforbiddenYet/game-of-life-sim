import { Box } from '@radix-ui/themes';

export function SidePanel() {
  return (
    <Box asChild className="side-panel" p="5">
      <aside aria-label="Game settings" />
    </Box>
  );
}
