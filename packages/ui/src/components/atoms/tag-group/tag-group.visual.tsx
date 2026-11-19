import { expect, test } from "@playwright/experimental-ct-react";

import { TagGroup, TagGroupItem } from "./tag-group";

test.describe("TagGroup Visual", () => {
  test("selectable", async ({ mount }) => {
    const component = await mount(
      <div className="w-80 p-6">
        <TagGroup
          defaultValue={["design"]}
          label="Topics"
          selectionMode="multiple"
        >
          <TagGroupItem value="design">Design</TagGroupItem>
          <TagGroupItem value="engineering">Engineering</TagGroupItem>
          <TagGroupItem value="product">Product</TagGroupItem>
        </TagGroup>
      </div>,
    );

    await expect(component).toHaveScreenshot("tag-group-selectable.png");
  });

  test("removable", async ({ mount }) => {
    const component = await mount(
      <div className="w-80 p-6">
        <TagGroup label="Applied filters">
          <TagGroupItem onRemove={() => undefined} value="open">
            Open
          </TagGroupItem>
          <TagGroupItem onRemove={() => undefined} value="mine">
            Assigned to me
          </TagGroupItem>
        </TagGroup>
      </div>,
    );

    await expect(component).toHaveScreenshot("tag-group-removable.png");
  });

  test("remove button hit area and focus ring", async ({ mount }) => {
    const component = await mount(
      <div className="w-80 p-6">
        <TagGroup label="Applied filters">
          <TagGroupItem onRemove={() => undefined} value="open">
            Open
          </TagGroupItem>
        </TagGroup>
      </div>,
    );
    const remove = component.getByRole("button", { name: "Remove open" });
    const box = await remove.boundingBox();

    expect(box?.width).toBeGreaterThanOrEqual(24);
    expect(box?.height).toBeGreaterThanOrEqual(24);
    await remove.focus();
    await expect(remove).toBeFocused();
    expect(
      await remove.evaluate((element) => getComputedStyle(element).boxShadow),
    ).not.toBe("none");
    await expect(component).toHaveScreenshot("tag-group-remove-focus.png");
  });

  test("mobile 390", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.setViewportSize({ width: 390, height: 844 });
    await mount(
      <div className="p-4">
        <TagGroup label="Applied filters">
          <TagGroupItem onRemove={() => undefined} value="open">
            Open
          </TagGroupItem>
          <TagGroupItem onRemove={() => undefined} value="mine">
            Assigned to me
          </TagGroupItem>
          <TagGroupItem onRemove={() => undefined} value="recent">
            Updated this week
          </TagGroupItem>
        </TagGroup>
      </div>,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("tag-group-mobile.png");
    expect(errors).toEqual([]);
  });
});
