import { fireEvent, render, screen } from "@testing-library/react-native";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Heading,
  Text,
} from "../index";

import { renderThemed } from "./test-utils";

it("renders an accessible button and handles presses", () => {
  const onPress = jest.fn();
  renderThemed(
    <Button accessibilityRole="none" onPress={onPress}>
      Save changes
    </Button>,
    "dark",
  );
  const button = screen.getByRole("button", { name: "Save changes" });
  fireEvent.press(button);

  expect(onPress).toHaveBeenCalledTimes(1);
  expect(button).toBeEnabled();
});

it("exposes disabled button state without invoking the action", () => {
  const onPress = jest.fn();
  render(
    <Button disabled onPress={onPress}>
      Delete item
    </Button>,
  );
  const button = screen.getByRole("button", { name: "Delete item" });
  fireEvent.press(button);

  expect(onPress).not.toHaveBeenCalled();
  expect(button).toBeDisabled();
});

it("keeps heading semantics independent from visual size", () => {
  renderThemed(
    <Heading level={2} size={1}>
      Account
    </Heading>,
  );
  const heading = screen.getByRole("header", { name: "Account" });
  expect(heading).toHaveProp("aria-level", 2);
  expect(heading).toHaveStyle({ fontSize: 48 });
});

it("renders text, badge, and compound card regions", () => {
  renderThemed(
    <Card testID="card">
      <CardHeader>
        <Badge variant="secondary">Experimental</Badge>
        <CardTitle accessibilityRole="none">Native renderer</CardTitle>
        <CardDescription>Shared tokens, separate primitives.</CardDescription>
      </CardHeader>
      <CardContent>
        <Text tone="muted">Runs in Expo.</Text>
      </CardContent>
      <CardFooter>
        <Text size="caption">Canary only</Text>
      </CardFooter>
    </Card>,
  );
  expect(screen.getByTestId("card")).toBeOnTheScreen();
  expect(
    screen.getByRole("header", { name: "Native renderer" }),
  ).toBeOnTheScreen();
  for (const text of ["Experimental", "Runs in Expo.", "Canary only"])
    expect(screen.getByText(text)).toBeOnTheScreen();
});
