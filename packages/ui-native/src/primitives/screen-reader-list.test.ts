import { screenReaderListProps } from "./screen-reader-list";

describe("screenReaderListProps", () => {
  it("mounts every row at once and never detaches clipped rows", () => {
    expect(screenReaderListProps(40)).toEqual({
      initialNumToRender: 40,
      maxToRenderPerBatch: 40,
      removeClippedSubviews: false,
      windowSize: 40,
    });
  });

  it("keeps FlatList's default window for short lists", () => {
    expect(screenReaderListProps(3)).toMatchObject({
      initialNumToRender: 3,
      windowSize: 21,
    });
  });

  it("stays valid for an empty list", () => {
    expect(screenReaderListProps(0)).toMatchObject({
      initialNumToRender: 1,
      maxToRenderPerBatch: 1,
    });
  });
});
