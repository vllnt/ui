import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Grid } from "./grid";

describe("Grid", () => {
  describe("rendering", () => {
    it("renders a grid container with defaults", () => {
      const { container } = render(<Grid>content</Grid>);

      expect(container.firstChild).toHaveClass("grid", "grid-cols-1", "gap-4");
    });

    it("maps cols and gap to Tailwind classes", () => {
      const { container } = render(
        <Grid cols={3} gap={6}>
          content
        </Grid>,
      );

      expect(container.firstChild).toHaveClass("grid-cols-3", "gap-6");
    });

    it("emits responsive breakpoint classes", () => {
      const { container } = render(
        <Grid cols={1} lgCols={4} mdCols={2} smCols={2}>
          content
        </Grid>,
      );

      expect(container.firstChild).toHaveClass(
        "grid-cols-1",
        "sm:grid-cols-2",
        "md:grid-cols-2",
        "lg:grid-cols-4",
      );
    });

    it("applies custom className", () => {
      const { container } = render(<Grid className="custom-class">x</Grid>);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
