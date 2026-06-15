"use client";

import { FileUpload } from "@vllnt/ui";

export default function FileUploadPreview() {
  return (
    <div className="w-full max-w-md">
      <FileUpload
        files={[
          new File(["contract"], "contract.pdf", { type: "application/pdf" }),
        ]}
        helperText="PNG, JPG, or PDF up to 10MB."
      />
    </div>
  );
}
