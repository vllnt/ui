import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AspectRatio } from "./aspect-ratio";

describe("AspectRatio", () => {
  it("renders children inside the ratio container", () => {
    const { getByText } = render(
      <AspectRatio ratio={16 / 9}>
        <span>media</span>
      </AspectRatio>,
    );

    expect(getByText("media")).toBeInTheDocument();
  });

  it("forwards arbitrary props to the root element", () => {
    const { container } = render(
      <AspectRatio data-testid="ar" ratio={1}>
        <span>x</span>
      </AspectRatio>,
    );

    expect(container.querySelector("[data-testid='ar']")).toBeInTheDocument();
  });
});
