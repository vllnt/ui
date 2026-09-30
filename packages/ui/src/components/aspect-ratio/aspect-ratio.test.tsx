import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AspectRatio } from "./aspect-ratio";

describe("AspectRatio", () => {
  it("renders children and forwards arbitrary props to the root", () => {
    const { container, getByText } = render(
      <AspectRatio data-testid="ar" ratio={16 / 9}>
        <span>media</span>
      </AspectRatio>,
    );
    expect(getByText("media")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='ar']")).toBeInTheDocument();
  });
});
