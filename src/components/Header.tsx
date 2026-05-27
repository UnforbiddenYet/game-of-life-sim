import { Badge, Box, Button, Flex, Heading } from '@radix-ui/themes';
import { Download, Upload } from 'lucide-react';
import { useRef } from 'react';
import { useGameTick } from '../state/hooks';

export interface HeaderProps {
  onExport: () => void;
  onImport: (file: File) => void;
}

export function Header({ onExport, onImport }: HeaderProps) {
  const { generation, alive } = useGameTick();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Flex
      asChild
      align="center"
      justify="between"
      gap="4"
      px="5"
      py="4"
      wrap="wrap"
    >
      <header>
        <Flex align="center" gap="3">
          <Heading size="6" weight="bold">
            Conway's Game of Life
          </Heading>
          <Badge color="green" variant="soft" radius="full" size="2">
            <span className="header-dot" aria-hidden="true">
              ●
            </span>
            <span>
              Generation <strong>{generation}</strong>
            </span>
          </Badge>
          <Badge color="gray" variant="soft" radius="full" size="2">
            <span>
              Alive <strong>{alive}</strong>
            </span>
          </Badge>
        </Flex>

        <Flex align="center" gap="2">
          <Button
            type="button"
            aria-label="Export grid as JSON"
            variant="surface"
            color="gray"
            onClick={onExport}
          >
            <Download size={16} />
            <span>Export</span>
          </Button>
          <Button
            type="button"
            aria-label="Import grid from JSON"
            variant="surface"
            color="gray"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            <span>Import</span>
          </Button>
          <Box asChild>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              aria-label="Import grid from JSON file"
              className="visually-hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImport(file);
                e.target.value = '';
              }}
            />
          </Box>
        </Flex>
      </header>
    </Flex>
  );
}
