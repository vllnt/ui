import { createRef } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./input-otp";

function Code(properties: React.ComponentProps<typeof InputOTP>) {
  return (
    <InputOTP aria-label="One-time code" maxLength={4} {...properties}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  );
}

function type(input: HTMLElement, value: string) {
  fireEvent.input(input, { target: { value } });
}

const slotTexts = (container: HTMLElement) =>
  [...container.querySelectorAll('[data-slot="otp-input-slot"]')].map(
    (slot) => slot.textContent,
  );

it("InputOTP renders the input with length, merges both class names on the wrapper, and keeps group children and separator", () => {
  const { container } = render(
    <InputOTP className="extra" containerClassName="wrapper" maxLength={6}>
      <InputOTPGroup>
        <span>slot-a</span>
        <span>slot-b</span>
      </InputOTPGroup>
      <InputOTPSeparator />
    </InputOTP>,
  );
  const input = container.querySelector("input");
  expect(input).toHaveAttribute("maxlength", "6");
  const wrapper = input?.parentElement;
  expect(wrapper).toHaveClass("extra", "wrapper", "flex", "items-center");
  expect(screen.getByText("slot-a")).toBeInTheDocument();
  expect(screen.getByText("slot-b")).toBeInTheDocument();
  expect(screen.getByRole("separator", { hidden: true })).toBeInTheDocument();
});

describe("InputOTP accessibility", () => {
  it("exposes one labelled text field and hides the visual slots from assistive technology", () => {
    const { container } = render(<Code />);
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(
      screen.getByRole("textbox", { name: "One-time code" }),
    ).toBeInTheDocument();
    const visual = [
      ...container.querySelectorAll(
        '[data-slot="otp-input-group"], [data-slot="otp-input-slot"], [role="separator"]',
      ),
    ];
    expect(visual).toHaveLength(7);
    expect(
      visual.every((element) => element.closest('[aria-hidden="true"]')),
    ).toBe(true);
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  it("asks for one-time-code autofill and a numeric keyboard by default", () => {
    render(<Code />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("inputmode", "numeric");
  });

  it("lets a keyword pattern choose its own keyboard and inputMode override it", () => {
    const { rerender } = render(<Code pattern="letters" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("inputmode", "text");
    rerender(<Code inputMode="tel" pattern="letters" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("inputmode", "tel");
  });
});

describe("InputOTP value", () => {
  it("fills the slots while typing and reports every change and completion", () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    const { container } = render(
      <Code onChange={onChange} onComplete={onComplete} />,
    );
    const input = screen.getByRole("textbox");

    type(input, "12");
    expect(onChange).toHaveBeenLastCalledWith("12");
    expect(onComplete).not.toHaveBeenCalled();
    expect(slotTexts(container)).toEqual(["1", "2", "", ""]);

    type(input, "1234");
    expect(onChange).toHaveBeenLastCalledWith("1234");
    expect(onComplete).toHaveBeenCalledExactlyOnceWith("1234");
    expect(slotTexts(container)).toEqual(["1", "2", "3", "4"]);
  });

  it("shows a controlled value and leaves the slots alone until the parent updates it", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <Code onChange={onChange} value="12" />,
    );
    expect(slotTexts(container)).toEqual(["1", "2", "", ""]);

    type(screen.getByRole("textbox"), "123");
    expect(onChange).toHaveBeenLastCalledWith("123");
    expect(slotTexts(container)).toEqual(["1", "2", "", ""]);

    rerender(<Code onChange={onChange} value="123" />);
    expect(slotTexts(container)).toEqual(["1", "2", "3", ""]);
  });

  it("draws a blinking fake caret in the active empty slot and marks it active", () => {
    const { container } = render(<Code />);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    const [first] = container.querySelectorAll('[data-slot="otp-input-slot"]');
    expect(first).toHaveAttribute("data-active");
    expect(first).toHaveClass("ring-2");
    expect(first?.querySelector(".animate-caret-blink")).not.toBeNull();
  });

  it("renders nothing for a slot index beyond maxLength", () => {
    const { container } = render(
      <InputOTP aria-label="Code" maxLength={1}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    );
    expect(
      container.querySelectorAll('[data-slot="otp-input-slot"]'),
    ).toHaveLength(1);
  });
});

describe("InputOTP pattern", () => {
  it("accepts any character when no pattern is set, as input-otp did", () => {
    const { container } = render(<Code />);
    type(screen.getByRole("textbox"), "a1-B");
    expect(slotTexts(container)).toEqual(["a", "1", "-", "B"]);
  });

  it("maps a whole-value regular expression string onto each character", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Code onChange={onChange} pattern={String.raw`^\d+$`} />,
    );
    type(screen.getByRole("textbox"), "1a2");
    expect(onChange).not.toHaveBeenCalled();
    expect(slotTexts(container)).toEqual(["", "", "", ""]);
    type(screen.getByRole("textbox"), "12");
    expect(slotTexts(container)).toEqual(["1", "2", "", ""]);
  });

  it("passes keyword and RegExp patterns to ui-sdk unchanged", () => {
    const { container, rerender } = render(<Code pattern="letters" />);
    type(screen.getByRole("textbox"), "ab");
    expect(slotTexts(container)).toEqual(["a", "b", "", ""]);
    type(screen.getByRole("textbox"), "ab1");
    expect(slotTexts(container)).toEqual(["a", "b", "", ""]);

    rerender(<Code pattern={/[A-F\d]/i} />);
    type(screen.getByRole("textbox"), "fz");
    expect(slotTexts(container)).toEqual(["a", "b", "", ""]);
  });

  it("maps textAlign left and right onto ui-sdk's start and end", () => {
    const { rerender } = render(<Code textAlign="right" />);
    expect(screen.getByRole("textbox").style.textAlign).toBe("end");
    rerender(<Code textAlign="left" />);
    expect(screen.getByRole("textbox").style.textAlign).toBe("start");
  });
});

describe("InputOTP element behavior", () => {
  it("points ref at the input and clears it on unmount", () => {
    const reference = createRef<HTMLInputElement>();
    const { unmount } = render(<Code ref={reference} />);
    expect(reference.current).toBe(screen.getByRole("textbox"));
    unmount();
    expect(reference.current).toBeNull();
  });

  it("calls a callback ref with the input", () => {
    const reference = vi.fn();
    render(<Code ref={reference} />);
    expect(reference).toHaveBeenCalledWith(screen.getByRole("textbox"));
  });

  it("disables the input and dims the wrapper", () => {
    render(<Code disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
    expect(input.parentElement).toHaveClass("has-[:disabled]:opacity-50");
  });

  it("submits the code under its name", () => {
    render(
      <form aria-label="verify">
        <Code name="code" value="1234" />
      </form>,
    );
    const form = screen.getByRole<HTMLFormElement>("form");
    expect(new FormData(form).get("code")).toBe("1234");
  });
});
