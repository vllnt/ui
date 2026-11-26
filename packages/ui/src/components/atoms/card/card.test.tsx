import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

function slotsOf(container: HTMLElement): (string | undefined)[] {
  return [...container.querySelectorAll<HTMLElement>("[data-slot]")].map(
    (element) => element.dataset.slot,
  );
}

describe("Card", () => {
  it("renders a visible root that merges className and forwards ref", () => {
    const ref = { current: null };
    const { container } = render(
      <Card className="custom-class" ref={ref}>
        Test
      </Card>,
    );
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("names every part with data-slot, so a consumer can target it", () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>About</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Foot</CardFooter>
      </Card>,
    );
    expect(slotsOf(container)).toEqual([
      "card",
      "card-header",
      "card-title",
      "card-description",
      "card-content",
      "card-footer",
    ]);
  });
});
