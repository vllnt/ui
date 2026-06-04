"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vllnt/ui";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

import type { PlaygroundExample } from "@/lib/playground";

import { StorybookEmbed } from "../storybook-embed";

import { ComponentPlaygroundShell } from "./component-playground-shell";

type PreviewPlaygroundTabsProps = {
  componentName: string;
  example: PlaygroundExample;
  packageVersion: string;
  storyId: string;
};

export function PreviewPlaygroundTabs({
  componentName,
  example,
  packageVersion,
  storyId,
}: PreviewPlaygroundTabsProps): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState("preview");

  React.useEffect(() => {
    function selectHashTab(): void {
      if (window.location.hash === "#playground") {
        setActiveTab("playground");
      } else if (window.location.hash === "#preview") {
        setActiveTab("preview");
      }
    }

    selectHashTab();
    window.addEventListener("hashchange", selectHashTab);

    return () => {
      window.removeEventListener("hashchange", selectHashTab);
    };
  }, []);

  return (
    <div className="mb-8 scroll-mt-8" id="preview">
      <span aria-hidden="true" className="block scroll-mt-8" id="playground" />
      <Tabs className="my-0" onValueChange={setActiveTab} value={activeTab}>
        <div className="flex items-center justify-between gap-4 border-b">
          <TabsList className="border-b-0">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger
              aria-hidden="true"
              className="hidden md:inline-flex"
              tabIndex={-1}
              value="playground"
            >
              Playground
            </TabsTrigger>
          </TabsList>
          <Link
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:hidden"
            href={`/components/${componentName}/playground`}
          >
            Open in playground
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
        <TabsContent className="pt-4" value="preview">
          <div className="overflow-hidden rounded-lg border bg-card">
            <StorybookEmbed componentName={componentName} storyId={storyId} />
          </div>
        </TabsContent>
        <TabsContent
          aria-hidden="true"
          className="hidden pt-4 md:block"
          value="playground"
        >
          <div>
            <ComponentPlaygroundShell
              componentName={componentName}
              example={example}
              packageVersion={packageVersion}
              surface="inline"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
