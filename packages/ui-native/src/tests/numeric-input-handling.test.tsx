import { fireEvent, render, screen } from "@testing-library/react-native";

import { InputOTP } from "../components/atoms/input-otp/input-otp";
import { Slider } from "../components/atoms/slider/slider";
import { PresenceStack } from "../components/molecules/presence-stack/presence-stack";

const NAN = Number.NaN;
const POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
const NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;

const now = () =>
  screen.getByRole("adjustable", { name: "Volume" }).props.accessibilityValue
    .now as number;

describe("Slider numeric props", () => {
  it.each([
    ["value", { value: NAN }],
    ["min", { min: NAN, value: 40 }],
    ["max", { max: NAN, value: 40 }],
    ["step", { step: NAN, value: 40 }],
    ["step", { step: POSITIVE_INFINITY, value: 40 }],
    ["step", { step: -2, value: 40 }],
    ["min and max", { max: NAN, min: NAN, value: NAN }],
  ])("keeps NaN out of the rendered %s", (_name, props) => {
    const { toJSON } = render(
      <Slider accessibilityLabel="Volume" {...props} />,
    );

    expect(JSON.stringify(toJSON())).not.toMatch(/NaN|Infinity/);
  });

  it("falls back to the 0-100 range and a step of one", () => {
    render(
      <Slider
        accessibilityLabel="Volume"
        max={NAN}
        min={NAN}
        step={NAN}
        value={42.4}
      />,
    );

    expect(screen.getByRole("adjustable", { name: "Volume" })).toHaveProp(
      "accessibilityValue",
      { max: 100, min: 0, now: 42, text: "42" },
    );
  });

  it("uses the lower bound for a NaN value and clamps infinities", () => {
    const { rerender } = render(
      <Slider accessibilityLabel="Volume" max={10} min={2} value={NAN} />,
    );

    expect(now()).toBe(2);
    rerender(
      <Slider
        accessibilityLabel="Volume"
        max={10}
        min={2}
        value={POSITIVE_INFINITY}
      />,
    );
    expect(now()).toBe(10);
    rerender(
      <Slider
        accessibilityLabel="Volume"
        max={10}
        min={2}
        value={NEGATIVE_INFINITY}
      />,
    );
    expect(now()).toBe(2);
  });

  it("steps by one when the step is invalid", () => {
    const onValueChange = jest.fn();
    render(
      <Slider
        accessibilityLabel="Volume"
        defaultValue={5}
        onValueChange={onValueChange}
        step={NAN}
      />,
    );
    fireEvent(
      screen.getByRole("adjustable", { name: "Volume" }),
      "accessibilityAction",
      { nativeEvent: { actionName: "increment" } },
    );

    expect(onValueChange).toHaveBeenCalledWith(6);
  });
});

describe("InputOTP length", () => {
  const otp = (length: number) => (
    <InputOTP
      accessibilityLabel="Code"
      length={length}
      valueState={{ defaultValue: "", mode: "uncontrolled" }}
    />
  );

  it.each([NAN, POSITIVE_INFINITY, 0, -3])(
    "accepts a six digit code when length is %s",
    (length) => {
      render(otp(length));
      const input = screen.getByLabelText("Code");
      fireEvent.changeText(input, "1234567");

      expect(input).toHaveProp("maxLength", 6);
      expect(input.props.value).toBe("123456");
      expect(input.props.accessibilityHint).toBe("6/6");
    },
  );

  it("uses the whole part of a fractional length", () => {
    render(otp(4.9));
    const input = screen.getByLabelText("Code");
    fireEvent.changeText(input, "123456");

    expect(input).toHaveProp("maxLength", 4);
    expect(input.props.value).toBe("1234");
  });
});

describe("PresenceStack max", () => {
  const users = [
    { id: "ada", initial: "A", name: "Ada" },
    { id: "lin", initial: "L", name: "Lin" },
  ];

  it("shows every user when max is NaN", () => {
    render(<PresenceStack max={NAN} users={users} />);

    expect(screen.getByLabelText(/Ada, active; Lin, active/)).toBeOnTheScreen();
    expect(screen.queryByLabelText(/more/)).toBeNull();
  });

  it.each([-1, NEGATIVE_INFINITY])("shows no users when max is %s", (max) => {
    render(<PresenceStack max={max} users={users} />);

    expect(screen.getByLabelText(/2 more/)).toBeOnTheScreen();
  });
});
