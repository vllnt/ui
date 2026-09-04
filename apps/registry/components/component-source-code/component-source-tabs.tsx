"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vllnt/ui";
import type { ReactNode } from "react";

type ComponentSourceTabsProps = {
  readonly native: ReactNode;
  readonly nativeLabel: string;
  readonly tabListLabel: string;
  readonly web: ReactNode;
  readonly webLabel: string;
};

export function ComponentSourceTabs({
  native,
  nativeLabel,
  tabListLabel,
  web,
  webLabel,
}: ComponentSourceTabsProps) {
  return (
    <Tabs className="my-0" defaultValue="web">
      <div className="border-b">
        <TabsList aria-label={tabListLabel} className="border-b-0">
          <TabsTrigger value="web">{webLabel}</TabsTrigger>
          <TabsTrigger value="native">{nativeLabel}</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent className="pt-4" value="web">
        {web}
      </TabsContent>
      <TabsContent className="pt-4" value="native">
        {native}
      </TabsContent>
    </Tabs>
  );
}
