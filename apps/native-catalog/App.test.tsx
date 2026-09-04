import { fireEvent, render, screen } from "@testing-library/react-native";

import App from "./App";

describe("native catalog", () => {
  it("renders the source catalog and proves interaction", () => {
    render(<App />);

    expect(screen.getByText("VLLNT UI Native")).toBeOnTheScreen();
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
});
