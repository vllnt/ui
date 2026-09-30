import data from "@/lib/component-metadata.json";

/** One entry of the generated `component-metadata.json` (Storybook-derived). */
export type ComponentMeta = {
  readonly category: string;
  readonly defaultStoryId: string;
  readonly description: string;
  readonly name: string;
  readonly platforms: readonly ("native" | "web")[];
  readonly stories: readonly { readonly id: string; readonly name: string }[];
  readonly title: string;
};

/** Generated component metadata keyed by registry slug. */
export const componentMeta = data as Readonly<
  Record<string, ComponentMeta | undefined>
>;
