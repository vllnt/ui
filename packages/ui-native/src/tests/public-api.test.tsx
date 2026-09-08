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
  ThemeProvider,
} from "../index";

describe("native pilot components", () => {
  it("renders an accessible button and handles presses", () => {
    const onPress = jest.fn();
    render(
      <ThemeProvider colorScheme="dark">
        <Button accessibilityRole="none" onPress={onPress}>
          Save changes
        </Button>
      </ThemeProvider>,
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
    render(
      <ThemeProvider colorScheme="light">
        <Heading level={2} size={1}>
          Account
        </Heading>
      </ThemeProvider>,
    );

    const heading = screen.getByRole("header", { name: "Account" });
    expect(heading).toHaveProp("aria-level", 2);
    expect(heading).toHaveStyle({ fontSize: 48 });
  });

  it("renders text, badge, and compound card regions", () => {
    render(
      <ThemeProvider colorScheme="light">
        <Card testID="card">
          <CardHeader>
            <Badge variant="secondary">Experimental</Badge>
            <CardTitle accessibilityRole="none">Native renderer</CardTitle>
            <CardDescription>
              Shared tokens, separate primitives.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text tone="muted">Runs in Expo.</Text>
          </CardContent>
          <CardFooter>
            <Text size="caption">Canary only</Text>
          </CardFooter>
        </Card>
      </ThemeProvider>,
    );

    expect(screen.getByTestId("card")).toBeOnTheScreen();
    expect(screen.getByText("Experimental")).toBeOnTheScreen();
    expect(
      screen.getByRole("header", { name: "Native renderer" }),
    ).toBeOnTheScreen();
    expect(screen.getByText("Runs in Expo.")).toBeOnTheScreen();
    expect(screen.getByText("Canary only")).toBeOnTheScreen();
  });
});
