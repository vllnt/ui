"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vllnt/ui";
import { useTranslations } from "next-intl";

import { StorybookEmbed } from "../storybook-embed";

type PreviewPlaygroundTabsProps = {
  code?: React.ReactNode;
  componentName: string;
  storyId: string;
};

export function PreviewPlaygroundTabs({
  code,
  componentName,
  storyId,
}: PreviewPlaygroundTabsProps): React.ReactElement {
  const t = useTranslations("shared");
  const [activeTab, setActiveTab] = React.useState("preview");

  React.useEffect(() => {
    function selectHashTab(): void {
      if (window.location.hash === "#code" && code) {
        setActiveTab("code");
      } else if (window.location.hash === "#preview" || !code) {
        setActiveTab("preview");
      }
    }

    selectHashTab();
    window.addEventListener("hashchange", selectHashTab);

    return () => {
      window.removeEventListener("hashchange", selectHashTab);
    };
  }, [code]);

  return (
    <div className="relative mb-8 scroll-mt-8" id="preview">
      {code ? <span className="absolute -top-8" id="code" /> : null}
      <Tabs className="my-0" onValueChange={setActiveTab} value={activeTab}>
        <div className="flex items-center justify-between gap-4 border-b">
          <TabsList className="border-b-0">
            <TabsTrigger value="preview">{t("preview")}</TabsTrigger>
            {code ? <TabsTrigger value="code">{t("code")}</TabsTrigger> : null}
          </TabsList>
        </div>
        <TabsContent className="pt-4" value="preview">
          <div className="overflow-hidden rounded-lg border bg-card">
            <StorybookEmbed componentName={componentName} storyId={storyId} />
          </div>
        </TabsContent>
        {code ? (
          <TabsContent className="pt-4" value="code">
            {code}
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
