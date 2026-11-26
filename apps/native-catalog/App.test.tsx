import { fireEvent, render, screen } from "@testing-library/react-native";

import App from "./App";

describe("native catalog", () => {
  it("renders the source catalog and proves interaction", () => {
    render(<App />);

    expect(screen.getByText("VLLNT UI Native")).toBeOnTheScreen();
    expect(
      screen.getByText(/representative interaction sample/),
    ).toBeOnTheScreen();
    expect(
      screen.getByLabelText("Native manifest inventory"),
    ).toBeOnTheScreen();
    expect(screen.getByText("Type and layout")).toBeOnTheScreen();
    expect(screen.getByRole("header", { name: "Display" })).toBeOnTheScreen();
    expect(screen.getByRole("image", { name: "Verified" })).toBeOnTheScreen();
    expect(screen.getByText("Start")).toBeOnTheScreen();
    expect(screen.getByText("End")).toBeOnTheScreen();
    expect(screen.getByText("Renderer boundary")).toBeOnTheScreen();
    expect(screen.getByText("Interactive composites")).toBeOnTheScreen();
    expect(screen.getByText("1 of 2 modules reviewed")).toBeOnTheScreen();
    expect(screen.getByText("Interaction count: 0")).toBeOnTheScreen();

    fireEvent.press(
      screen.getByRole("checkbox", {
        name: "Complete Native accessibility",
      }),
    );
    fireEvent.press(screen.getByRole("button", { name: "Try interaction" }));

    expect(screen.getByText("Catalog review complete")).toBeOnTheScreen();
    expect(screen.getByText("Interaction count: 1")).toBeOnTheScreen();
  });

  it("switches the glass demo between the glass and solid material", () => {
    render(<App />);

    expect(screen.getByText("Static glass container")).toBeOnTheScreen();
    expect(screen.getByText("Material: Glass")).toBeOnTheScreen();

    fireEvent.press(screen.getByRole("button", { name: "Solid" }));
    expect(screen.getByText("Material: Solid")).toBeOnTheScreen();

    fireEvent.press(screen.getByRole("button", { name: "Glass" }));
    expect(screen.getByText("Material: Glass")).toBeOnTheScreen();
  });
});
