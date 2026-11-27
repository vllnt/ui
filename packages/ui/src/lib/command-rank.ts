const ITEM = "[cmdk-item]";
const GROUP = "[cmdk-group]";

type Score = (item: HTMLElement) => number;

/** The best score of the items inside each node, for the nodes of one parent. */
type Units = Map<Element, number>;

type Ranker = {
  /**
   * Puts the items of each group, and the items outside any group, in score
   * order, best first. Groups keep their place. Equal scores keep the order
   * the items had when the ranker first saw them, so a score of `0` for every
   * item restores that order.
   */
  arrange: (list: HTMLElement, score: Score) => void;
};

const unitOf = (node: Element, parent: Element): Element =>
  node.parentElement && node.parentElement !== parent
    ? unitOf(node.parentElement, parent)
    : node;

function unitsByParent(list: HTMLElement, score: Score): Map<Element, Units> {
  const parents = new Map<Element, Units>();
  list.querySelectorAll<HTMLElement>(ITEM).forEach((item) => {
    const parent = item.closest(GROUP) ?? list;
    const units = parents.get(parent) ?? new Map<Element, number>();
    const unit = unitOf(item, parent);
    units.set(unit, Math.max(units.get(unit) ?? 0, score(item)));
    parents.set(parent, units);
  });
  return parents;
}

function place(parent: Element, wanted: Element[]): void {
  const members = new Set(wanted);
  const waiting = [...parent.children].filter((child) => members.has(child));
  if (wanted.every((node, index) => node === waiting[index])) {
    return;
  }
  wanted.forEach((node) => {
    if (node !== waiting[0]) {
      waiting[0]?.before(node);
    }
    waiting.splice(waiting.indexOf(node), 1);
  });
}

/**
 * Keeps a cmdk-style list in score order by moving its items, as cmdk does,
 * since callers compose the items and ui-sdk leaves their order alone. Items
 * swap places inside their own parent, and a list in order stays untouched.
 */
export function createCommandRanker(): Ranker {
  let seen: Element[] = [];
  return {
    arrange(list, score) {
      const parents = unitsByParent(list, score);
      const known = new Set(seen);
      seen = [
        ...seen.filter((node) => node.isConnected),
        ...[...parents.values()]
          .flatMap((units) => [...units.keys()])
          .filter((node) => !known.has(node)),
      ];
      const authored = new Map(seen.map((node, index) => [node, index]));
      parents.forEach((units, parent) => {
        place(
          parent,
          [...units.keys()].sort(
            (a, b) =>
              (units.get(b) ?? 0) - (units.get(a) ?? 0) ||
              (authored.get(a) ?? 0) - (authored.get(b) ?? 0),
          ),
        );
      });
    },
  };
}
