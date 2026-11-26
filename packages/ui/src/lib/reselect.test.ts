import { describe, expect, it, vi } from "vitest";

import { reselectProps } from "./reselect";

describe("reselectProps", () => {
  it("returns nothing to merge without a callback", () => {
    // eslint-disable-next-line unicorn/no-useless-undefined -- the callback is a required argument
    expect(reselectProps(undefined)).toEqual({});
    expect(reselectProps(undefined, { keyboard: true })).toEqual({});
  });

  it("reports a click", () => {
    const onReselect = vi.fn();
    const props = reselectProps(onReselect);
    expect(props).not.toHaveProperty("onKeyDown");
    (props.onClick as () => void)();
    expect(onReselect).toHaveBeenCalledOnce();
  });

  it("reports Enter and Space, and only those keys, when keyboard is set", () => {
    const onReselect = vi.fn();
    const { onKeyDown } = reselectProps(onReselect, { keyboard: true }) as {
      onKeyDown: (event: { key: string }) => void;
    };
    onKeyDown({ key: "Enter" });
    onKeyDown({ key: " " });
    onKeyDown({ key: "a" });
    onKeyDown({ key: "ArrowDown" });
    expect(onReselect).toHaveBeenCalledTimes(2);
  });
});
