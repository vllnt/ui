import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DateRangePicker } from "./date-range-picker";

describe("DateRangePicker", () => {
  it("renders the placeholder by default", () => {
    render(<DateRangePicker placeholder="Choose dates" />);
    expect(screen.getByRole("button")).toHaveTextContent("Choose dates");
  });

  it("renders a formatted range when a value is set", () => {
    render(
      <DateRangePicker
        value={{ from: new Date(2026, 5, 1), to: new Date(2026, 5, 5) }}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Jun 1, 2026");
    expect(screen.getByRole("button")).toHaveTextContent("Jun 5, 2026");
  });

  it("renders only the start date when the range is incomplete", () => {
    render(
      <DateRangePicker value={{ from: new Date(2026, 5, 1), to: undefined }} />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Jun 1, 2026");
  });

  it("opens a named dialog with focus on the range start", async () => {
    render(
      <DateRangePicker
        defaultValue={{
          from: new Date(2026, 3, 10),
          to: new Date(2026, 3, 14),
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(
      screen.getByRole("dialog", { name: "Choose date range" }),
    ).toBeInTheDocument();
    // ui-sdk moves focus a frame after a press opens the popover.
    await waitFor(() => {
      expect(document.activeElement?.closest("[role=grid]")).not.toBeNull();
    });
    expect(document.activeElement).toHaveTextContent("10");
  });

  it("shows two months by default and the requested number otherwise", async () => {
    const { unmount } = render(
      <DateRangePicker defaultValue={{ from: new Date(2026, 3, 10) }} />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findAllByRole("grid")).toHaveLength(2);
    unmount();

    render(
      <DateRangePicker
        defaultValue={{ from: new Date(2026, 3, 10) }}
        numberOfMonths={1}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findAllByRole("grid")).toHaveLength(1);
  });

  it("reports an open range, then the full range, and shows it on the button", async () => {
    const onValueChange = vi.fn();
    render(
      <DateRangePicker
        defaultValue={{ from: new Date(2026, 3, 1) }}
        numberOfMonths={1}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(
      await screen.findByRole("gridcell", { name: /^10, Friday, April 10/ }),
    );
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 3, 10),
    });
    fireEvent.click(
      screen.getByRole("gridcell", { name: /^14, Tuesday, April 14/ }),
    );
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 3, 10),
      to: new Date(2026, 3, 14),
    });
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Apr 10, 2026/ }),
      ).toHaveTextContent("Apr 10, 2026 – Apr 14, 2026");
    });
  });
});
