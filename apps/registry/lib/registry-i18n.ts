import type { Locale } from "@/i18n/routing";
import type { RegistryComponent } from "@/types/registry";

type DescribedRegistryItem = {
  readonly description?: string;
  readonly descriptions?: Partial<Record<string, string>>;
};

export function getLocalizedDescription(
  component: DescribedRegistryItem,
  locale: Locale,
): string {
  return (
    component.descriptions?.[locale] ??
    component.descriptions?.en ??
    component.description ??
    ""
  );
}

export function getDescriptionSourceLocale(
  component: RegistryComponent,
  locale: Locale,
): Locale {
  return component.descriptions?.[locale] ? locale : "en";
}
