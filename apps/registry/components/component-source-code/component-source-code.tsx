import { StaticCode } from "@vllnt/ui";
import { getTranslations } from "next-intl/server";

import { ComponentSourceTabs } from "./component-source-tabs";

type ComponentSourceCodeProps = {
  readonly nativeCode?: string;
  readonly webCode: string;
};

export async function ComponentSourceCode({
  nativeCode,
  webCode,
}: ComponentSourceCodeProps) {
  if (!nativeCode) {
    return <StaticCode code={webCode} language="typescript" />;
  }

  const t = await getTranslations("pages.component");

  return (
    <ComponentSourceTabs
      native={<StaticCode code={nativeCode} language="typescript" />}
      nativeLabel={t("platformNative")}
      tabListLabel={t("sourcePlatformLabel")}
      web={<StaticCode code={webCode} language="typescript" />}
      webLabel={t("platformWeb")}
    />
  );
}
