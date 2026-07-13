import { StaticCode } from "@vllnt/ui";
import type React from "react";

import { PreviewPlaygroundTabs } from "@/components/playground/preview-playground-tabs";
import { StorybookEmbed } from "@/components/storybook-embed";
import type { PlaygroundExample } from "@/lib/playground";

/**
 * Everything a component's SEO MDX needs to render its interactive blocks,
 * resolved once on the page and closed over by the kit so the MDX author writes
 * `<Preview />`, `<Install />`, `<Code />`, `<Stories />` directly.
 */
export type ComponentMdxContext = {
  readonly componentCode: string;
  readonly componentName: string;
  readonly example: PlaygroundExample;
  readonly installCommand: string;
  readonly packageVersion: string;
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
 * `MDXContent`'s `components` map so the localized MDX embeds live, crawlable
 * previews and code without per-file wiring.
 */
export function buildComponentMdxKit(context: ComponentMdxContext): MdxKit {
  const {
    componentCode,
    componentName,
    example,
    installCommand,
    packageVersion,
    storyId,
  } = context;

  function Preview(): null | React.ReactElement {
    if (!storyId) return null;
    return (
      <div className="not-prose my-6 scroll-mt-8" id="preview">
        <PreviewPlaygroundTabs
          componentName={componentName}
          example={example}
          packageVersion={packageVersion}
          storyId={storyId}
        />
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
    if (!componentCode) return null;
    return (
      <div className="not-prose my-6 scroll-mt-8" id="code">
        <StaticCode code={componentCode} language="typescript" />
      </div>
    );
  }

  function Stories(): null | React.ReactElement {
    if (!storyId) return null;
    return (
      <div className="not-prose my-6 scroll-mt-8" id="storybook">
        <StorybookEmbed componentName={componentName} storyId={storyId} />
      </div>
    );
  }

  return { Code, Install, Preview, Stories };
}
