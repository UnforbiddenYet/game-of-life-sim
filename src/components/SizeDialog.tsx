import { Box, Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import { useState, type FormEvent } from 'react';
import { MAX_SIZE, MIN_SIZE } from '../core/grid';

export interface SizeDialogProps {
  open: boolean;
  currentSize: number;
  onOpenChange: (open: boolean) => void;
  onSubmit: (size: number) => void;
}

function validateSize(value: string): string | null {
  const size = Number(value);
  if (!Number.isFinite(size) || value.trim() === '') {
    return 'Enter a whole number.';
  }
  if (!Number.isInteger(size)) {
    return 'Grid size must be a whole number.';
  }
  if (size < MIN_SIZE || size > MAX_SIZE) {
    return `Grid size must be between ${MIN_SIZE} and ${MAX_SIZE}.`;
  }
  return null;
}

export function SizeDialog({
  open,
  currentSize,
  onOpenChange,
  onSubmit,
}: SizeDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {open ? (
        <SizeDialogContent
          key={currentSize}
          currentSize={currentSize}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog.Root>
  );
}

interface SizeDialogContentProps {
  currentSize: number;
  onSubmit: (size: number) => void;
}

function SizeDialogContent({ currentSize, onSubmit }: SizeDialogContentProps) {
  const [value, setValue] = useState(String(currentSize));
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateSize(value);
    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit(Number(value));
  };

  return (
    <Dialog.Content maxWidth="28rem" style={{ backdropFilter: 'blur(16px)' }}>
      <Dialog.Title>Start a new game</Dialog.Title>
      <Dialog.Description>
        Pick a square grid size between 3 and 1000.
      </Dialog.Description>

      <form noValidate onSubmit={submit}>
        <Flex direction="column" gap="4" mt="4">
          <Flex asChild direction="column" gap="2">
            <label>
              <Text as="span" size="2" weight="medium">
                Grid size
              </Text>
              <Box mt="2">
                <TextField.Root
                  aria-label="Grid size"
                  name="size"
                  type="number"
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  step="1"
                  value={value}
                  autoFocus
                  onChange={(event) => {
                    setValue(event.target.value);
                    if (error) {
                      setError(null);
                    }
                  }}
                />
              </Box>
            </label>
          </Flex>

          {error ? (
            <Text color="red" role="alert" size="2">
              {error}
            </Text>
          ) : null}

          <Flex justify="end" gap="3">
            <Dialog.Close>
              <Button type="button" variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit" variant="solid">
              Start new game
            </Button>
          </Flex>
        </Flex>
      </form>
    </Dialog.Content>
  );
}
