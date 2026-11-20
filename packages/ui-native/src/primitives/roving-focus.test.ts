import { rovingTarget } from "./roving-focus";

const all = [true, true, true];

it("moves forward and back with the arrow keys of either axis when unrestricted", () => {
  expect(
    rovingTarget({ current: 0, enabled: all, key: "ArrowRight", loop: false }),
  ).toBe(1);
  expect(
    rovingTarget({ current: 0, enabled: all, key: "ArrowDown", loop: false }),
  ).toBe(1);
  expect(
    rovingTarget({ current: 2, enabled: all, key: "ArrowLeft", loop: false }),
  ).toBe(1);
  expect(
    rovingTarget({ current: 2, enabled: all, key: "ArrowUp", loop: false }),
  ).toBe(1);
});

it("only follows the keys of the given orientation", () => {
  const horizontal = {
    enabled: all,
    loop: false,
    orientation: "horizontal",
  } as const;
  const vertical = {
    enabled: all,
    loop: false,
    orientation: "vertical",
  } as const;
  expect(rovingTarget({ ...horizontal, current: 0, key: "ArrowRight" })).toBe(
    1,
  );
  expect(
    rovingTarget({ ...horizontal, current: 0, key: "ArrowDown" }),
  ).toBeUndefined();
  expect(rovingTarget({ ...vertical, current: 0, key: "ArrowDown" })).toBe(1);
  expect(
    rovingTarget({ ...vertical, current: 0, key: "ArrowRight" }),
  ).toBeUndefined();
});

it("wraps at the ends only when looping", () => {
  expect(
    rovingTarget({ current: 2, enabled: all, key: "ArrowRight", loop: true }),
  ).toBe(0);
  expect(
    rovingTarget({ current: 0, enabled: all, key: "ArrowLeft", loop: true }),
  ).toBe(2);
  expect(
    rovingTarget({ current: 2, enabled: all, key: "ArrowRight", loop: false }),
  ).toBeUndefined();
  expect(
    rovingTarget({ current: 0, enabled: all, key: "ArrowLeft", loop: false }),
  ).toBeUndefined();
});

it("skips disabled items, also across the wrap", () => {
  const enabled = [true, false, true, false];
  expect(
    rovingTarget({ current: 0, enabled, key: "ArrowRight", loop: false }),
  ).toBe(2);
  expect(
    rovingTarget({ current: 2, enabled, key: "ArrowRight", loop: false }),
  ).toBeUndefined();
  expect(
    rovingTarget({ current: 2, enabled, key: "ArrowRight", loop: true }),
  ).toBe(0);
});

it("jumps to the first and last enabled item with Home and End", () => {
  const enabled = [false, true, true, false];
  expect(rovingTarget({ current: 2, enabled, key: "Home", loop: false })).toBe(
    1,
  );
  expect(rovingTarget({ current: 1, enabled, key: "End", loop: false })).toBe(
    2,
  );
  expect(
    rovingTarget({ current: 1, enabled, key: "Home", loop: false }),
  ).toBeUndefined();
});

it("ignores other keys and a lone enabled item", () => {
  expect(
    rovingTarget({ current: 0, enabled: all, key: "a", loop: true }),
  ).toBeUndefined();
  expect(
    rovingTarget({
      current: 0,
      enabled: [true, false],
      key: "ArrowRight",
      loop: true,
    }),
  ).toBeUndefined();
  expect(
    rovingTarget({
      current: 0,
      enabled: [false, false],
      key: "End",
      loop: true,
    }),
  ).toBeUndefined();
});
