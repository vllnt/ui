import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TimePicker } from "./time-picker";

describe("TimePicker", () => {
  describe("rendering", () => {
    it("renders the placeholder by default", () => {
      const { getByRole } = render(<TimePicker placeholder="Choose a time" />);

      expect(getByRole("button")).toHaveTextContent("Choose a time");
    });

    it("renders the selected value", () => {
      const { getByRole } = render(<TimePicker value="09:30" />);

      expect(getByRole("button")).toHaveTextContent("09:30");
    });

    it("renders the default value", () => {
      const { getByRole } = render(<TimePicker defaultValue="14:00" />);

      expect(getByRole("button")).toHaveTextContent("14:00");
    });
  });
});
