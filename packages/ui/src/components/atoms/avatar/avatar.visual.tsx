import { expect, test } from "@playwright/experimental-ct-react";
import { Bot } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const portrait = `data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='#94a3b8'/><circle cx='32' cy='26' r='12' fill='#f1f5f9'/><path d='M10 64c3-16 14-22 22-22s19 6 22 22z' fill='#f1f5f9'/></svg>",
)}`;

const sizeBoxes = [
  ["xs", 24],
  ["sm", 32],
  ["md", 40],
  ["lg", 48],
  ["xl", 64],
] as const;

test.describe("Avatar Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Avatar />);
    await expect(page).toHaveScreenshot("avatar-default.png");
  });

  test("sizes", async ({ mount, page }) => {
    const component = await mount(
      <div className="flex items-end gap-4 p-4">
        {sizeBoxes.map(([size]) => (
          <Avatar data-testid={`avatar-${size}`} key={size} size={size}>
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
        ))}
      </div>,
    );
    for (const [size, box] of sizeBoxes) {
      const avatar = page.getByTestId(`avatar-${size}`);
      await expect(avatar).toHaveCSS("width", `${box}px`);
      await expect(avatar).toHaveCSS("height", `${box}px`);
      await expect(avatar).toContainText("AL");
    }
    await expect(component).toHaveScreenshot("avatar-sizes.png");
  });

  test("shapes", async ({ mount, page }) => {
    const component = await mount(
      <div className="flex items-center gap-4 p-4">
        <Avatar data-testid="avatar-circle" shape="circle" size="lg">
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar data-testid="avatar-square" shape="square" size="lg">
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
      </div>,
    );
    const radius = (testId: string) =>
      page
        .getByTestId(testId)
        .evaluate((element) =>
          Number.parseFloat(getComputedStyle(element).borderTopLeftRadius),
        );
    expect(await radius("avatar-circle")).toBeGreaterThanOrEqual(24);
    expect(await radius("avatar-square")).toBeLessThan(12);
    await expect(component).toHaveScreenshot("avatar-shapes.png");
  });

  test("presence", async ({ mount, page }) => {
    const component = await mount(
      <div className="flex items-center gap-6 p-4">
        <div className="flex items-center gap-2">
          <Avatar data-testid="avatar-online" presence="online" size="lg">
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <span className="text-sm">Online</span>
        </div>
        <div className="flex items-center gap-2">
          <Avatar data-testid="avatar-away" presence="away" size="lg">
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <span className="text-sm">Away</span>
        </div>
        <div className="flex items-center gap-2">
          <Avatar data-testid="avatar-busy" presence="busy" size="lg">
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <span className="text-sm">Busy</span>
        </div>
      </div>,
    );
    for (const presence of ["online", "away", "busy"]) {
      const avatar = page.getByTestId(`avatar-${presence}`);
      const marker = avatar.locator("[data-presence]");
      await expect(marker).toBeVisible();
      const avatarBox = await avatar.boundingBox();
      const markerBox = await marker.boundingBox();
      expect(avatarBox).not.toBeNull();
      expect(markerBox).not.toBeNull();
      if (avatarBox && markerBox) {
        expect(markerBox.x + markerBox.width).toBeCloseTo(
          avatarBox.x + avatarBox.width,
          0,
        );
        expect(markerBox.y + markerBox.height).toBeCloseTo(
          avatarBox.y + avatarBox.height,
          0,
        );
      }
      const outerEdgeIsHit = await marker.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const radius = box.width / 2;
        const offset = (radius - 1) * Math.SQRT1_2;
        const hit = document.elementFromPoint(
          box.x + radius + offset,
          box.y + radius + offset,
        );
        return hit !== null && element.contains(hit);
      });
      expect(outerEdgeIsHit).toBe(true);
    }
    await expect(page.getByTestId("avatar-busy").locator("[aria-hidden]")).toBeVisible();
    await expect(component).toHaveScreenshot("avatar-presence.png");
  });

  test("presence sizes and square", async ({ mount }) => {
    const component = await mount(
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-end gap-4">
          {sizeBoxes.map(([size]) => (
            <Avatar key={size} presence="busy" size={size}>
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="flex items-end gap-4">
          {sizeBoxes.map(([size]) => (
            <Avatar key={size} presence="away" size={size}>
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Avatar presence="online" shape="square" size="lg">
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
          <Avatar presence="away" shape="square" size="lg">
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
          <Avatar presence="busy" shape="square" size="lg">
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
        </div>
      </div>,
    );
    await expect(component).toHaveScreenshot("avatar-presence-sizes.png");
  });

  test("kinds", async ({ mount, page }) => {
    const component = await mount(
      <div className="flex items-center gap-4 p-4">
        <Avatar size="lg">
          <AvatarImage alt="Ada Lovelace" src={portrait} />
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar shape="square" size="lg">
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>
            <Bot aria-label="Agent" className="size-1/2" role="img" />
          </AvatarFallback>
        </Avatar>
      </div>,
    );
    await expect(page.getByRole("img", { name: "Ada Lovelace" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Agent" })).toBeVisible();
    await expect(component).toHaveScreenshot("avatar-kinds.png");
  });

  test("mobile 390", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.setViewportSize({ width: 390, height: 844 });
    await mount(
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-end gap-3">
          {sizeBoxes.map(([size]) => (
            <Avatar key={size} size={size}>
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar presence="online" size="lg">
            <AvatarImage alt="Ada Lovelace" src={portrait} />
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <Avatar presence="away" shape="square" size="lg">
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
          <Avatar presence="busy" size="lg">
            <AvatarFallback>
              <Bot aria-label="Agent" className="size-1/2" role="img" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("avatar-mobile.png");
    expect(errors).toEqual([]);
  });
});
