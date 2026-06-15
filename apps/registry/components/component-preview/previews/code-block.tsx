"use client";

import { CodeBlock } from "@vllnt/ui";

export default function CodeBlockPreview() {
  return (
    <CodeBlock language="typescript">
      {`function greet(name: string) {
  return \`Hello, \${name}!\`
}`}
    </CodeBlock>
  );
}
