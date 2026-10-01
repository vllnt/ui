import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { AnimatedText } from "./animated-text";

it.each(["  Leading words  ", "\t\n  "])(
  "preserves every whitespace character in word reveals: %p",
  (text) => {
    render(
      <AnimatedText
        cursor={false}
        splitBy="word"
        text={text}
        variant="reveal"
      />,
    );
    const segments = screen
      .UNSAFE_getAllByType(Text)
      .filter((node) => typeof node.props.children === "string");
    expect(segments.map((node) => String(node.props.children)).join("")).toBe(
      text,
    );
  },
);
