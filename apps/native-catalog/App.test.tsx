import { fireEvent, render, screen } from "@testing-library/react-native";

import App from "./App";

describe("native catalog", () => {
  it("renders the pilot and proves interaction", () => {
    render(<App />);

    expect(screen.getByText("VLLNT UI Native")).toBeOnTheScreen();
    expect(screen.getByText("Separate native renderer")).toBeOnTheScreen();
    expect(screen.getByText("Button presses: 0")).toBeOnTheScreen();

    fireEvent.press(screen.getByRole("button", { name: "Try interaction" }));

    expect(screen.getByText("Button presses: 1")).toBeOnTheScreen();
  });
});
