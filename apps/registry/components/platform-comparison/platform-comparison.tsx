import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vllnt/ui";
import { getTranslations } from "next-intl/server";

import type { RegistryComponent } from "@/types/registry";

type PlatformComparisonProps = {
  readonly component: RegistryComponent;
};

function formatDependencies(dependencies: readonly string[]): string {
  return dependencies.length > 0 ? dependencies.join(", ") : "—";
}

export async function PlatformComparison({
  component,
}: PlatformComparisonProps) {
  const t = await getTranslations("pages.component");
  const native = component.native;
  const webDependencies = component.dependencies ?? [];
  const nativeDependencies = native ? [native.package, "react-native"] : [];
  const webCapabilities = t("webCapabilities");
  const nativeCapabilities = native
    ? t(
        native.compatibility === "portable-options"
          ? "nativeCapabilitiesPortable"
          : "nativeCapabilitiesAdapted",
      )
    : t("notAvailable");

  return (
    <section className="mb-8 scroll-mt-8" id="platform-comparison">
      <h2 className="mb-4 text-2xl font-semibold">{t("platformComparison")}</h2>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("platform")}</TableHead>
              <TableHead>{t("dependencies")}</TableHead>
              <TableHead>{t("capabilities")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">{t("platformWeb")}</TableCell>
              <TableCell className="font-mono text-xs">
                {formatDependencies(webDependencies)}
              </TableCell>
              <TableCell>{webCapabilities}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                {t("platformNative")}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {formatDependencies(nativeDependencies)}
              </TableCell>
              <TableCell>{nativeCapabilities}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
