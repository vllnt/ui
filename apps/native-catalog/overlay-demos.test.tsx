import { fireEvent, render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@vllnt/ui-native";

import { OverlayDemos } from "./overlay-demos";

function renderDemos() {
  return render(
    <ThemeProvider colorScheme="light">
      <OverlayDemos />
    </ThemeProvider>,
  );
}

function press(name: string) {
  fireEvent.press(screen.getByRole("button", { name }));
}

describe("overlay props demos", () => {
  it("lists every demo with its trigger closed", () => {
    renderDemos();

    [
      "Open snap drawer",
      "Open side drawer",
      "Show inline dialog",
      "Open popover",
      "Open menu",
    ].forEach((name) => {
      expect(screen.getByRole("button", { name })).toBeOnTheScreen();
    });
    expect(screen.queryByText("Active snap point: 0.4")).toBeNull();
    expect(screen.queryByText("Inline dialog")).toBeNull();
    expect(screen.getByText("List is closed")).toBeOnTheScreen();
  });

  it("opens the snap drawer on its smallest point", () => {
    renderDemos();

    press("Open snap drawer");

    expect(screen.getByText("Active snap point: 0.4")).toBeOnTheScreen();
    expect(screen.getByLabelText("Drawer height")).toBeOnTheScreen();
  });

  it("opens the side drawer and keeps its close button", () => {
    renderDemos();

    press("Open side drawer");

    expect(
      screen.getByText("Drag is off; use the close button."),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("button", { name: "Close side drawer" }));
    expect(screen.queryByText("Drag is off; use the close button.")).toBeNull();
  });

  it("toggles the non-modal dialog in place and closes it", () => {
    renderDemos();

    press("Show inline dialog");

    expect(
      screen.getByText("The page behind stays interactive."),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Hide inline dialog" }),
    ).toBeOnTheScreen();
    fireEvent.press(
      screen.getByRole("button", { name: "Close inline dialog" }),
    );
    expect(screen.queryByText("The page behind stays interactive.")).toBeNull();
  });

  it("opens the anchored popover and closes it", () => {
    renderDemos();

    press("Open popover");

    expect(screen.getByText("Opens under the trigger.")).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("button", { name: "Close popover" }));
    expect(screen.queryByText("Opens under the trigger.")).toBeNull();
  });

  it("toggles the menu checkbox and radio through the screen state", () => {
    renderDemos();
    expect(screen.getByText("Grid on, layout list")).toBeOnTheScreen();

    press("Open menu");
    fireEvent.press(screen.getByRole("checkbox", { name: "Show grid" }));
    expect(screen.getByText("Grid off, layout list")).toBeOnTheScreen();

    press("Open menu");
    fireEvent.press(screen.getByRole("radio", { name: "Board" }));
    expect(screen.getByText("Grid off, layout board")).toBeOnTheScreen();
  });

  it("opens the menu sub-menu in place", () => {
    renderDemos();
    press("Open menu");

    const share = screen.getByRole("menuitem", { name: /Share/ });
    expect(share).toBeCollapsed();
    fireEvent.press(share);

    expect(
      screen.getByRole("menuitem", { name: /Copy link/ }),
    ).toBeOnTheScreen();
    expect(screen.getByRole("menuitem", { name: /Share/ })).toBeExpanded();
  });

  it("speaks the select as required and reports its list state", () => {
    renderDemos();

    const trigger = screen.getByRole("button", { name: "Choose status" });
    expect(trigger.props.accessibilityHint).toBe("Required");
    fireEvent.press(trigger);

    expect(screen.getByText("List is open")).toBeOnTheScreen();
  });
});
