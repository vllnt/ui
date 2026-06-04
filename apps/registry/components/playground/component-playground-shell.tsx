"use client";

import * as React from "react";

import dynamic from "next/dynamic";

import type { PlaygroundExample } from "@/lib/playground";

type ComponentPlaygroundShellProps = {
  componentName: string;
  example: PlaygroundExample;
  packageVersion: string;
  surface: "inline" | "route";
};

const SandpackPlayground = dynamic(
  () =>
    import("./sandpack-playground").then((module) => module.SandpackPlayground),
  {
    loading: () => (
      <div className="flex min-h-[460px] items-center justify-center rounded-lg border bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading playground...</p>
      </div>
    ),
    ssr: false,
  },
);

export function ComponentPlaygroundShell({
  componentName,
  example,
  packageVersion,
  surface,
}: ComponentPlaygroundShellProps): React.ReactElement {
  return (
    <SandpackPlayground
      componentName={componentName}
      example={example}
      packageVersion={packageVersion}
      surface={surface}
    />
  );
}
