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

  it("reserves the height from the ratio and fills it with the content box", () => {
    const { getByTestId } = render(
      <AspectRatio data-testid="ar" ratio={2} style={{ color: "red" }} />,
    );
    const content = getByTestId("ar");
    const wrapper = content.parentElement;
    expect(wrapper?.style.paddingBottom).toBe("50%");
    expect(wrapper?.style.position).toBe("relative");
    expect(wrapper?.style.width).toBe("100%");
    expect(content.style.position).toBe("absolute");
    expect(content.style.inset).toBe("0px");
    expect(content.style.color).toBe("red");
  });

  it("defaults to a square", () => {
    const { getByTestId } = render(<AspectRatio data-testid="ar" />);
    expect(getByTestId("ar").parentElement?.style.paddingBottom).toBe("100%");
  });
});
