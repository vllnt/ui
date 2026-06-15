"use client";

import * as React from "react";

import { Button, CodePlayground } from "@vllnt/ui";

export default function CodePlaygroundPreview() {
  return (
    <CodePlayground
      description="A simple React button"
      filename="Button.tsx"
      language="typescript"
      title="Button Component"
    >
      {`function Button({ children }) {
  return <button>{children}</button>
}`}
    </CodePlayground>
  );
}
