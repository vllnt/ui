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

describe("FileUpload keyboard semantics", () => {
  it("has one keyboard control, the native file input, inside a label dropzone", () => {
    const { container } = render(<FileUpload />);
    const input = screen.getByLabelText("Choose files", { selector: "input" });
    expect(input).not.toHaveAttribute("tabindex", "-1");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.querySelector("[tabindex='0']")).toBeNull();
    expect(input.closest("label")).not.toBeNull();
  });
});

const make = () => new File(["x"], "a.txt", { lastModified: 1 });

describe("FileUpload duplicate files", () => {
  it("lists the same file once and removes exactly one entry", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => null);
    const onFilesChange = vi.fn();
    const make = () =>
      new File(["x"], "a.txt", { lastModified: 1, type: "text/plain" });
    const other = new File(["yy"], "b.txt", { lastModified: 2 });
    render(<FileUpload multiple onFilesChange={onFilesChange} />);
    const input = screen.getByLabelText("Choose files", { selector: "input" });

    fireEvent.change(input, { target: { files: [make(), other] } });
    fireEvent.change(input, { target: { files: [make()] } });

    expect(screen.getAllByText("a.txt")).toHaveLength(1);
    expect(screen.getAllByText("b.txt")).toHaveLength(1);
    expect(onFilesChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: "a.txt" }),
      expect.objectContaining({ name: "b.txt" }),
    ]);

    fireEvent.click(screen.getByLabelText("Remove a.txt"));
    expect(screen.queryByText("a.txt")).not.toBeInTheDocument();
    expect(screen.getByText("b.txt")).toBeVisible();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it("does not warn about keys when a controlled list repeats a file", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => null);
    const file = new File(["x"], "dup.txt", { lastModified: 1 });
    render(<FileUpload files={[file, file]} />);
    expect(screen.getAllByText("dup.txt")).toHaveLength(2);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it("does not call onFilesChange when every incoming file is a duplicate", () => {
    const onFilesChange = vi.fn();
    render(<FileUpload multiple onFilesChange={onFilesChange} />);
    const input = screen.getByLabelText("Choose files", { selector: "input" });
    fireEvent.change(input, { target: { files: [make()] } });
    fireEvent.change(input, { target: { files: [make()] } });
    expect(onFilesChange).toHaveBeenCalledTimes(1);
  });
});
