import { FileUpload } from "./file-upload";

/**
 * Builds the `File` in the browser: Playwright CT cannot pass a `File` prop
 * from the test runner to the page.
 */
export function FileUploadWithFilePreview() {
  const demoFile = new File(["contract"], "contract.pdf", {
    type: "application/pdf",
  });

  return (
    <div className="w-[28rem] p-6">
      <FileUpload files={[demoFile]} />
    </div>
  );
}
