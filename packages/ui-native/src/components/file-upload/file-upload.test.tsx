import { act, fireEvent, render, screen } from "@testing-library/react-native";

import type { PickedFile } from "../../primitives/platform-services";

import { FileUpload } from "./file-upload";

it.each(["adapter", "disabled"])(
  "invalidates picker success and failure after %s changes without overlapping operations",
  async (change) => {
    let resolve: (files: readonly PickedFile[]) => void = () => {};
    let reject: (error: Error) => void = () => {};
    const pickFiles = jest.fn(
      () =>
        new Promise<readonly PickedFile[]>((yes, no) => {
          resolve = yes;
          reject = no;
        }),
    );
    const replacement = {
      pickFiles: jest.fn(async () => [{ name: "new", uri: "new" }]),
    };
    const onChange = jest.fn();
    const props = {
      filePicker: { pickFiles },
      files: { defaultValue: [], mode: "uncontrolled", onChange },
      labels: {
        choose: "Choose",
        empty: "Empty",
        failed: "Failed",
        remove: (name: string) => `Remove ${name}`,
        unavailable: "Unavailable",
      },
    } satisfies React.ComponentProps<typeof FileUpload>;
    render(<FileUpload {...props} />);
    fireEvent.press(screen.getByRole("button", { name: "Choose" }));
    const next = {
      ...props,
      disabled: change === "disabled",
      filePicker: change === "adapter" ? replacement : props.filePicker,
    };
    screen.rerender(<FileUpload {...next} />);
    expect(screen.getByRole("button", { name: "Choose" })).toBeDisabled();
    await act(async () => {
      resolve([{ name: "stale", uri: "stale" }]);
    });
    expect(onChange).not.toHaveBeenCalled();
    screen.rerender(<FileUpload {...props} />);
    fireEvent.press(screen.getByRole("button", { name: "Choose" }));
    screen.rerender(<FileUpload {...next} />);
    await act(async () => {
      reject(new Error("stale failure"));
    });
    expect(screen.queryByText("Failed")).toBeNull();
    screen.rerender(<FileUpload {...props} filePicker={replacement} />);
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Choose" }));
    });
    expect(replacement.pickFiles).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith([{ name: "new", uri: "new" }]);
  },
);
