import { type ReactNode, useState } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AutoReload, type AutoReloadSavePayload } from "./auto-reload";

function ControlledAutoReload({
  onSave,
}: {
  onSave: (payload: AutoReloadSavePayload) => void;
}): ReactNode {
  const [reloadAmountCents, setReloadAmountCents] = useState(2000);
  const [thresholdCents, setThresholdCents] = useState(1000);
  return (
    <AutoReload
      defaultEnabled
      onReloadAmountChange={setReloadAmountCents}
      onSave={onSave}
      onThresholdChange={setThresholdCents}
      reloadAmountCents={reloadAmountCents}
      thresholdCents={thresholdCents}
    />
  );
}

const saveButton = () => screen.getByRole("button", { name: "Save settings" });

describe("AutoReload", () => {
  it("renders the heading and helper text, hides the form, and flips uncontrolled state when toggled", () => {
    const onToggle = vi.fn();
    render(<AutoReload onToggle={onToggle} />);
    expect(screen.getByText("Auto-reload")).toBeInTheDocument();
    expect(
      screen.getByText(/Automatically reload credits/),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/Threshold/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save settings" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalledWith(true);
    expect(screen.getByLabelText(/Threshold/)).toBeInTheDocument();
  });

  it("renders the form when enabled", () => {
    render(<AutoReload defaultEnabled />);
    expect(screen.getByLabelText(/Threshold/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reload amount/)).toBeInTheDocument();
    expect(saveButton()).toBeInTheDocument();
  });

  it("renders the disabled banner when disabled is set", () => {
    render(<AutoReload disabled disabledMessage="Subscribe first." />);
    expect(screen.getByText("Subscribe first.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save settings" }),
    ).not.toBeInTheDocument();
  });

  it("renders the saving label when isSaving is true", () => {
    render(<AutoReload defaultEnabled isSaving />);
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  });

  it("controlled mode flows through onToggle without flipping internal state", () => {
    const onToggle = vi.fn();
    render(<AutoReload enabled={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalledWith(true);
    expect(screen.queryByLabelText(/Threshold/)).not.toBeInTheDocument();
  });

  it("invokes onSave with the current values in cents", () => {
    const onSave = vi.fn();
    render(
      <AutoReload
        defaultEnabled
        defaultReloadAmountCents={2500}
        defaultThresholdCents={1500}
        onSave={onSave}
      />,
    );
    fireEvent.click(saveButton());
    expect(onSave).toHaveBeenCalledWith({
      reloadAmountCents: 2500,
      thresholdCents: 1500,
    });
  });

  it("reflects user input in the next save payload", () => {
    const onSave = vi.fn();
    render(<AutoReload defaultEnabled onSave={onSave} />);
    fireEvent.change(screen.getByLabelText(/Threshold/), {
      target: { value: "5.50" },
    });
    fireEvent.change(screen.getByLabelText(/Reload amount/), {
      target: { value: "30" },
    });
    fireEvent.click(saveButton());
    expect(onSave).toHaveBeenCalledWith({
      reloadAmountCents: 3000,
      thresholdCents: 550,
    });
  });

  it("applies controlled-prop edits via onReloadAmountChange to the save payload", () => {
    const onSave = vi.fn();
    render(<ControlledAutoReload onSave={onSave} />);
    fireEvent.change(screen.getByLabelText(/Reload amount/), {
      target: { value: "30.00" },
    });
    fireEvent.click(saveButton());
    expect(onSave).toHaveBeenCalledWith({
      reloadAmountCents: 3000,
      thresholdCents: 1000,
    });
  });

  it.each([
    { props: { currencySymbol: "₿" }, symbol: /₿/ },
    { props: { currency: "EUR", locale: "en-IE" }, symbol: /€/ },
  ])("renders the currency symbol $symbol", ({ props, symbol }) => {
    render(<AutoReload defaultEnabled {...props} />);
    expect(screen.getAllByText(symbol).length).toBeGreaterThan(0);
  });
});
