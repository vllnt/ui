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

/**
 * Fixtures that open a native modal on mount, each with text that only its
 * open modal shows. The catalog keeps exactly these behind a Show button.
 */
const modalFixtureText: Readonly<Record<string, string>> = {
  "alert-dialog": "Delete workspace?",
  command: "Open settings",
  "completion-dialog": "Complete lesson",
  "context-menu": "Row actions",
  dialog: "Dialog body",
  drawer: "Drawer body",
  "dropdown-menu": "File actions",
  "keyboard-shortcuts-help": "Keyboard shortcuts",
  menubar: "New file",
  "model-selector": "Choose model",
  popover: "Details body",
  "search-dialog": "Search docs",
  "share-dialog": "Share now",
  sheet: "Sheet body",
  slideshow: "Introduction content",
  tooltip: "Use your work email.",
};
const modalFixtureNames = Object.keys(modalFixtureText);

function entryQueries(name: string) {
  return within(screen.getByTestId(entryTestId(name)));
}

function hasOpenModal(name: string) {
  return entryQueries(name)
    .UNSAFE_queryAllByType(Modal)
    .some((modal) => modal.props.visible === true);
}

function namesWithOpenModal() {
  return nativeComponentNames.filter(hasOpenModal);
}

function namesWithShowButton() {
  return nativeComponentNames.filter(
    (name) =>
      entryQueries(name).queryAllByRole("button", { name: `Show ${name}` })
        .length > 0,
  );
}

/** What one modal fixture shows now: an open modal and its own text. */
function modalState(name: string) {
  return {
    modal: hasOpenModal(name),
    name,
    text: entryQueries(name).queryByText(modalFixtureText[name] ?? "") !== null,
  };
}

function openAllComponents() {
  render(<App />);
  fireEvent.press(screen.getByRole("button", { name: "All components" }));
}

describe("native catalog all components", () => {
  it("has a fixture for every registry component", () => {
    const missing = nativeComponentNames.filter(
      (name) => !(name in accessibilityFixtures),
    );

    expect(missing).toEqual([]);
  });

  it(
    "renders every registry component with no modal open on mount",
    () => {
      openAllComponents();

      expect(screen.getAllByTestId(/^component-/)).toHaveLength(
        nativeComponentNames.length,
      );
      nativeComponentNames.forEach((name) => {
        expect(entryQueries(name).getAllByText(name).length).toBeGreaterThan(0);
      });
      expect(namesWithOpenModal()).toEqual([]);
    },
    RENDER_TIMEOUT,
  );

  it(
    "mounts each modal example from its own Show button",
    () => {
      openAllComponents();

      expect(namesWithShowButton()).toEqual(
        nativeComponentNames.filter((name) => name in modalFixtureText),
      );
      modalFixtureNames.forEach((name) => {
        expect(modalState(name)).toEqual({ modal: false, name, text: false });

        fireEvent.press(
          entryQueries(name).getByRole("button", { name: `Show ${name}` }),
        );
        expect(modalState(name)).toEqual({ modal: true, name, text: true });

        fireEvent.press(
          entryQueries(name).getByRole("button", { name: `Hide ${name}` }),
        );
        expect(modalState(name)).toEqual({ modal: false, name, text: false });
      });
    },
    RENDER_TIMEOUT,
  );
});
