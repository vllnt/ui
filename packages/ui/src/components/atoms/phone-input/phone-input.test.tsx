import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PhoneInput } from "./phone-input";

describe("PhoneInput", () => {
  it("renders a tel input and a country selector", () => {
    const { getByLabelText, getByRole } = render(
      <PhoneInput placeholder="555 000 1234" />,
    );
    expect(getByRole("textbox")).toHaveAttribute("type", "tel");
    expect(getByLabelText("Country dialing code")).toBeInTheDocument();
  });

  it("defaults to the requested country", () => {
    const { getByLabelText } = render(<PhoneInput defaultCountry="GB" />);
    expect(getByLabelText("Country dialing code")).toHaveValue("GB");
  });

  it("calls onCountryChange and onChange as the user edits", () => {
    const onCountryChange = vi.fn();
    const onChange = vi.fn();
    const { getByLabelText, getByRole } = render(
      <PhoneInput onChange={onChange} onCountryChange={onCountryChange} />,
    );
    fireEvent.change(getByLabelText("Country dialing code"), {
      target: { value: "FR" },
    });
    expect(onCountryChange).toHaveBeenCalledWith("FR");
    fireEvent.change(getByRole("textbox"), { target: { value: "5551234" } });
    expect(onChange).toHaveBeenCalled();
  });
});
