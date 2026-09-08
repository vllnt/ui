import { fireEvent, render, screen } from "@testing-library/react-native";
import { ScrollView, Text } from "react-native";

import { Carousel } from "./carousel";

it("restores the controlled slide after a rejected swipe", () => {
  const scrollTo = jest.spyOn(ScrollView.prototype, "scrollTo");
  const onSelectedIdChange = jest.fn();
  render(
    <Carousel
      items={[
        { content: <Text>A slide</Text>, id: "a", label: "A" },
        { content: <Text>B slide</Text>, id: "b", label: "B" },
      ]}
      labels={{
        next: "Next",
        position: (index, total) => `${index}/${total}`,
        previous: "Previous",
        region: "Slides",
      }}
      onSelectedIdChange={onSelectedIdChange}
      selectedId="a"
    />,
  );
  fireEvent(screen.getByLabelText("Slides"), "layout", {
    nativeEvent: { layout: { height: 100, width: 200, x: 0, y: 0 } },
  });
  scrollTo.mockClear();
  fireEvent(screen.UNSAFE_getByType(ScrollView), "momentumScrollEnd", {
    nativeEvent: { contentOffset: { x: 200, y: 0 } },
  });
  expect(onSelectedIdChange).toHaveBeenCalledWith("b");
  expect(scrollTo).toHaveBeenLastCalledWith({ animated: false, x: 0, y: 0 });
  expect(screen.getByLabelText("A")).toHaveProp(
    "accessibilityElementsHidden",
    false,
  );
  scrollTo.mockRestore();
});
