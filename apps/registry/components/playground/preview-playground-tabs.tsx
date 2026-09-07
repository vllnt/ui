"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vllnt/ui";
import { useTranslations } from "next-intl";

import type { PlaygroundExample } from "@/lib/playground";

import { StorybookEmbed } from "../storybook-embed";

import { PlaygroundCodePanel } from "./playground-code-panel";

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
  const t = useTranslations("shared");
  const [activeTab, setActiveTab] = React.useState("preview");

  React.useEffect(() => {
    function selectHashTab(): void {
      if (window.location.hash === "#code") {
        setActiveTab("code");
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
      <Tabs className="my-0" onValueChange={setActiveTab} value={activeTab}>
        <div className="flex items-center justify-between gap-4 border-b">
          <TabsList className="border-b-0">
            <TabsTrigger value="preview">{t("preview")}</TabsTrigger>
            <TabsTrigger value="code">{t("code")}</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent className="pt-4" value="preview">
          <div className="overflow-hidden rounded-lg border bg-card">
            <StorybookEmbed componentName={componentName} storyId={storyId} />
          </div>
        </TabsContent>
        <TabsContent className="pt-4" value="code">
          <PlaygroundCodePanel
            componentName={componentName}
            example={example}
            packageVersion={packageVersion}
            surface="inline"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
