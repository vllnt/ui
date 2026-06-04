import type { RegistryComponent, UsageExample } from "@/types/registry";

export type PlaygroundExample = {
  code: string;
  description: string;
  title: string;
};

const FALLBACK_CODE = `import { Button } from "@vllnt/ui";

export function Demo() {
  return (
    <div className="space-y-3 rounded-lg border bg-card p-6 text-card-foreground">
      <h2 className="text-lg font-semibold">Start from the registry</h2>
      <p className="text-sm text-muted-foreground">
        Edit this sandbox with any VLLNT UI component import, then install the
        component from its registry JSON when you are ready to move it into your app.
      </p>
      <Button>Try VLLNT UI</Button>
    </div>
  );
}
`;

function normalizeExample(example: UsageExample): PlaygroundExample {
  return {
    code: example.code,
    description:
      example.description ??
      "Edit the component example and inspect the rendered result.",
    title: example.title,
  };
}

export function getPlaygroundExample(
  component: RegistryComponent,
): PlaygroundExample {
  const [firstExample] = component.examples ?? [];

  if (firstExample?.code) {
    return normalizeExample(firstExample);
  }

  return {
    code: FALLBACK_CODE,
    description:
      "This component does not have a curated inline example yet. Start from the default VLLNT UI sandbox and swap in the component you want to test.",
    title: "Default sandbox",
  };
}

export function getRegistryPackageVersion(version: string | undefined): string {
  if (!version) {
    throw new Error(
      "getRegistryPackageVersion: version is undefined. Registry component is missing a package version.",
    );
  }
  return `^${version}`;
}
