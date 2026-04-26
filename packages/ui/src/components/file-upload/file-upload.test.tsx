import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FileUpload } from "./file-upload";

describe("FileUpload", () => {
  it("renders helper text", () => {
    render(<FileUpload helperText="Upload supporting documents" />);

    expect(screen.getByText("Upload supporting documents")).toBeVisible();
  });

  it("calls onFilesChange when files are selected", () => {
    const onFilesChange = vi.fn();
    const file = new File(["resume"], "resume.pdf", {
      type: "application/pdf",
    });

    render(<FileUpload onFilesChange={onFilesChange} />);

    const input = screen.getByLabelText("Choose files", { selector: "input" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFilesChange).toHaveBeenCalledWith([file]);
  });

  it("renders selected file names", () => {
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    render(<FileUpload files={[file]} />);

    expect(screen.getByText("avatar.png")).toBeVisible();
  });
});
