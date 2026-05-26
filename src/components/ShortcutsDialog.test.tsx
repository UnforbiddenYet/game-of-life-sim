import { Theme } from "@radix-ui/themes";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShortcutsDialog } from "./ShortcutsDialog";
import { SHORTCUTS } from "./consts";

afterEach(() => {
  cleanup();
});

describe("ShortcutsDialog", () => {
  it("lists every documented shortcut when open", () => {
    render(
      <Theme>
        <ShortcutsDialog open onOpenChange={vi.fn()} />
      </Theme>,
    );
    const list = screen.getByRole("list", { name: /keyboard shortcuts/i });
    for (const { label } of SHORTCUTS) {
      expect(list).toHaveTextContent(label);
    }
  });

  it("renders nothing visible when closed", () => {
    render(
      <Theme>
        <ShortcutsDialog open={false} onOpenChange={vi.fn()} />
      </Theme>,
    );
    expect(
      screen.queryByRole("list", { name: /keyboard shortcuts/i }),
    ).toBeNull();
  });
});
