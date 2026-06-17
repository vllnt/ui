import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TextField } from "./text-field";

describe("TextField", () => {
  describe("rendering", () => {
    it("links the label to the input", () => {
      const { getByLabelText } = render(<TextField label="Email" />);

      expect(getByLabelText("Email")).toBeInTheDocument();
    });

    it("renders a description", () => {
      const { getByText } = render(
        <TextField description="We never share it." label="Email" />,
      );

      expect(getByText("We never share it.")).toBeInTheDocument();
    });

    it("applies custom className to the input", () => {
      const { getByRole } = render(<TextField className="custom-class" />);

      expect(getByRole("textbox")).toHaveClass("custom-class");
    });
  });

  describe("error state", () => {
    it("marks the input invalid and shows the error", () => {
      const { getByRole } = render(<TextField error="Required" label="Name" />);

      expect(getByRole("alert")).toHaveTextContent("Required");
      expect(getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    });

    it("does not render an alert without an error", () => {
      const { queryByRole } = render(<TextField label="Name" />);

      expect(queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
