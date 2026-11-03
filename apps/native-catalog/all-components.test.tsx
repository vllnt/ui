import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react-native";
import { Modal } from "react-native";

import { accessibilityFixtures } from "../../packages/ui-native/src/tests/accessibility-fixtures";

import { entryTestId } from "./all-components";
import App from "./App";
import { nativeComponentNames } from "./catalog-metadata";

const RENDER_TIMEOUT = 120_000;

function entryQueries(name: string) {
  return within(screen.getByTestId(entryTestId(name)));
}

function namesWithOpenModal() {
  return nativeComponentNames.filter((name) =>
    entryQueries(name)
      .UNSAFE_queryAllByType(Modal)
      .some((modal) => modal.props.visible === true),
  );
}

describe("native catalog all components", () => {
  it("has a fixture for every registry component", () => {
    const missing = nativeComponentNames.filter(
      (name) => !(name in accessibilityFixtures),
    );

    expect(missing).toEqual([]);
  });

  it(
    "renders every registry component and mounts modal examples on demand",
    () => {
      render(<App />);
      fireEvent.press(screen.getByRole("button", { name: "All components" }));

      expect(screen.getAllByTestId(/^component-/)).toHaveLength(
        nativeComponentNames.length,
      );
      nativeComponentNames.forEach((name) => {
        expect(entryQueries(name).getAllByText(name).length).toBeGreaterThan(0);
      });
      expect(namesWithOpenModal()).toEqual([]);

      nativeComponentNames.forEach((name) => {
        entryQueries(name)
          .queryAllByRole("button", { name: `Show ${name}` })
          .forEach((toggle) => {
            fireEvent.press(toggle);
          });
      });

      expect(namesWithOpenModal().length).toBeGreaterThan(0);
    },
    RENDER_TIMEOUT,
  );
});
