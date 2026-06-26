import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PhoneInput } from "./phone-input";

describe("PhoneInput", () => {
  describe("rendering", () => {
    it("renders a tel input", () => {
      const { getByRole } = render(<PhoneInput placeholder="555 000 1234" />);

      expect(getByRole("textbox")).toHaveAttribute("type", "tel");
    });

    it("renders a country selector", () => {
      const { getByLabelText } = render(<PhoneInput />);

      expect(getByLabelText("Country dialing code")).toBeInTheDocument();
    });

    it("defaults to the requested country", () => {
      const { getByLabelText } = render(<PhoneInput defaultCountry="GB" />);

      expect(getByLabelText("Country dialing code")).toHaveValue("GB");
    });
  });

  describe("country selection", () => {
    it("calls onCountryChange when the country changes", () => {
      const onCountryChange = vi.fn();
      const { getByLabelText } = render(
        <PhoneInput onCountryChange={onCountryChange} />,
      );

      fireEvent.change(getByLabelText("Country dialing code"), {
        target: { value: "FR" },
      });

      expect(onCountryChange).toHaveBeenCalledWith("FR");
    });
  });

  describe("number entry", () => {
    it("calls onChange when the number changes", () => {
      const onChange = vi.fn();
      const { getByRole } = render(<PhoneInput onChange={onChange} />);

      fireEvent.change(getByRole("textbox"), {
        target: { value: "5551234" },
      });

      expect(onChange).toHaveBeenCalled();
    });
  });
});
