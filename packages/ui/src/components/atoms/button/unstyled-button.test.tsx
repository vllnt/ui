import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { UnstyledButton } from "./unstyled-button";

describe("UnstyledButton", () => {
  it("renders only the caller's classes, joined without merging", () => {
    render(<UnstyledButton className="px-2 px-4">A</UnstyledButton>);
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute(
      "class",
      "px-2 px-4",
    );
  });

  it("renders no class attribute without a className", () => {
    render(<UnstyledButton>A</UnstyledButton>);
    expect(screen.getByRole("button")).not.toHaveAttribute("class");
  });

  it("keeps the native button: ref, attributes, type, disabled and clicks", () => {
    const onClick = vi.fn();
    const ref = { current: null };
    const { rerender } = render(
      <UnstyledButton
        aria-pressed="true"
        onClick={onClick}
        ref={ref}
        type="button"
      >
        A
      </UnstyledButton>,
    );
    const button = screen.getByRole("button", { name: "A" });
    expect(button).toBe(ref.current);
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(
      <UnstyledButton disabled onClick={onClick}>
        A
      </UnstyledButton>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders on the server", () => {
    expect(renderToStaticMarkup(<UnstyledButton>A</UnstyledButton>)).toBe(
      '<button type="button">A</button>',
    );
    expect(
      renderToStaticMarkup(<UnstyledButton type="submit">A</UnstyledButton>),
    ).toBe('<button type="submit">A</button>');
  });
});
