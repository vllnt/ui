import { StaticCode } from "@vllnt/ui";
import type React from "react";

import { PlatformComparison } from "@/components/platform-comparison";
import type { RegistryComponent } from "@/types/registry";

import { StorybookLink } from "./storybook-link";

/**
 * Compatibility kit for the interactive blocks in existing component MDX.
 * Preview and source rendering live in the canonical surface above the MDX;
 * these blocks keep comparison, install, source, and Storybook links in place.
 */
export type ComponentMdxContext = {
  readonly component: RegistryComponent;
  readonly hasSources: boolean;
  readonly installCommand: string;
  readonly sourceLinkLabel: string;
  readonly storybookLabel: string;
  readonly storyId?: string;
};

type MdxKitBlock = () => null | React.ReactElement;

type MdxKit = {
  readonly Code: MdxKitBlock;
  readonly Install: MdxKitBlock;
  readonly Preview: MdxKitBlock;
  readonly Stories: MdxKitBlock;
};

/**
 * Build the MDX component kit bound to a single component's data. Passed to
 * `MDXContent` so localized content keeps its existing block vocabulary while
 * the page owns the single preview and source surface.
 */
export function buildComponentMdxKit(context: ComponentMdxContext): MdxKit {
  const {
    component,
    hasSources,
    installCommand,
    sourceLinkLabel,
    storybookLabel,
    storyId,
  } = context;

  function Preview(): React.ReactElement {
    return (
      <div className="not-prose">
        <PlatformComparison component={component} />
      </div>
    );
  }

  function Install(): React.ReactElement {
    return (
      <div className="not-prose my-6 scroll-mt-8" id="installation">
        <StaticCode code={installCommand} language="bash" />
      </div>
    );
  }

  function Code(): null | React.ReactElement {
    if (!hasSources) return null;
    return (
      <div className="not-prose my-6">
        <a
          className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="#code"
        >
          {sourceLinkLabel}
        </a>
      </div>
    );
  }

  function Stories(): null | React.ReactElement {
    if (!storyId) return null;
    return (
      <div className="not-prose my-6 scroll-mt-8" id="storybook">
        <StorybookLink label={storybookLabel} storyId={storyId} />
      </div>
    );
  }

  return { Code, Install, Preview, Stories };
}
