import { describe, expect, it, vi } from "vitest";

import { createCommandRanker } from "./command-rank";

const SCORES: Record<string, number> = { a: 1, b: 3, c: 2, d: 0, e: 5, f: 4 };

function build() {
  const list = document.createElement("div");
  list.innerHTML = `
    <div cmdk-item="" id="a"></div>
    <div cmdk-item="" id="b"></div>
    <div cmdk-group="">
      <div cmdk-group-heading="">Heading</div>
      <div cmdk-item="" id="c"></div>
      <div cmdk-item="" id="d"></div>
      <div cmdk-item="" id="e"></div>
    </div>
    <div cmdk-group="">
      <div><div cmdk-item="" id="f"></div></div>
    </div>`;
  document.body.append(list);
  return list;
}

const ids = (parent: Element) =>
  [...parent.querySelectorAll("[cmdk-item]")].map((item) => item.id);

const score = (item: HTMLElement) => SCORES[item.id] ?? 0;

describe("createCommandRanker", () => {
  it("orders the items of each parent and leaves the groups where they are", () => {
    const list = build();
    createCommandRanker().arrange(list, score);

    expect(ids(list)).toEqual(["b", "a", "e", "c", "d", "f"]);
    expect(
      [...list.querySelectorAll("[cmdk-group]")].map((group) => ids(group)),
    ).toEqual([["e", "c", "d"], ["f"]]);
    expect(list.querySelector("[cmdk-group] > :first-child")?.textContent).toBe(
      "Heading",
    );
    list.remove();
  });

  it("moves the wrapper of an item with the item", () => {
    const list = document.createElement("div");
    list.innerHTML = `
      <div><div cmdk-item="" id="a"></div></div>
      <div><div cmdk-item="" id="b"></div></div>`;
    createCommandRanker().arrange(list, score);

    expect(ids(list)).toEqual(["b", "a"]);
  });

  it("writes nothing when the items are already in order", () => {
    const list = build();
    const ranker = createCommandRanker();
    ranker.arrange(list, score);
    const observer = new MutationObserver(vi.fn());
    observer.observe(list, { childList: true, subtree: true });
    ranker.arrange(list, score);

    expect(observer.takeRecords()).toHaveLength(0);
    observer.disconnect();
    list.remove();
  });

  it("restores the first order when every score is 0", () => {
    const list = build();
    const ranker = createCommandRanker();
    ranker.arrange(list, score);
    ranker.arrange(list, () => 0);

    expect(ids(list)).toEqual(["a", "b", "c", "d", "e", "f"]);
    list.remove();
  });

  it("breaks ties by the first order, not by the order of the last pass", () => {
    const list = build();
    const ranker = createCommandRanker();
    ranker.arrange(list, (item) => (item.id === "b" ? 2 : 1));
    expect(ids(list).slice(0, 2)).toEqual(["b", "a"]);
    ranker.arrange(list, () => 1);

    expect(ids(list).slice(0, 2)).toEqual(["a", "b"]);
    list.remove();
  });
});
