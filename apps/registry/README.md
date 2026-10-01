# VLLNT UI Registry

A Next.js application serving a shadcn/ui-compatible component registry. Provides both a web interface for browsing components and JSON registry endpoints for the shadcn CLI.

## Overview

The UI Registry serves as a centralized component library that:

- Hosts React components compatible with shadcn/ui patterns
- Provides JSON registry endpoints for shadcn CLI installation
- Offers a web interface for browsing and viewing component documentation
- Generates static registry JSON files during build

## Architecture

- **Next.js App Router**: Serves web pages and API routes
- **MDX Support**: Component documentation written in MDX
- **Registry API**: Dynamic routes serving component metadata and source code
- **Static Generation**: Build step generates JSON files to `public/r/`

## Project Structure

```
apps/ui-registry/
├── app/                    # Next.js app directory
│   ├── components/         # Component showcase pages
│   ├── docs/               # Documentation pages
│   ├── r/                  # Registry API routes
│   │   ├── [name]/         # Individual component registry JSON
│   │   └── registry.json/  # Main registry index
│   └── page.tsx            # Homepage
├── registry/
│   └── default/           # Generated shadcn shims (gitignored, except the
│       └── [component]/   #   hand-maintained area/bar/line-chart shims)
│           └── [component].tsx
├── registry.json          # Main registry manifest
├── public/r/              # Generated static registry files
└── src/                   # Legacy component exports
```

## Development

### Setup

```bash
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

`predev` runs `registry:sync-shims` first, which writes the component shims under `registry/default/` from `packages/ui/src` (they are not committed).

Visit `http://localhost:3000` to view the registry interface.

### Build

```bash
pnpm build
```

This runs `registry:build` (generates the `registry/default/` shims from `packages/ui/src`, then the registry JSON files in `public/r/` via `shadcn build`) before building the Next.js app.

## Registry API

### Endpoints

- `GET /r/registry.json` - Main registry index (all components)
- `GET /r/[component-name].json` - Individual component registry entry

### Usage with shadcn CLI

```bash
# Install directly by URL — works today, no config
pnpm dlx shadcn@latest add https://ui.vllnt.com/r/button.json
```

Namespaced install (once `@vllnt-ui` is listed in the [shadcn registry index](https://ui.shadcn.com/r/registries.json)) — add the registry to your app's `components.json`:

```json
{
  "registries": {
    "@vllnt-ui": "https://ui.vllnt.com/r/{name}.json"
  }
}
```

Then install by namespace:

```bash
pnpm dlx shadcn@latest add @vllnt-ui/button
```

## Adding Components

Component source lives in `packages/ui`, not here. The files under `registry/default/` are generated — do not create or edit them by hand (except the chart shims noted above).

1. **Add the component** at `packages/ui/src/components/[level]/[component-name]/[component-name].tsx` — `[level]` is its Atomic Design level (`atoms`, `molecules`, `organisms`, `templates`; see [docs/agents/COMPONENTS.md](../../docs/agents/COMPONENTS.md#atomic-design-levels)) — and export it from the package. The registry scripts find the folder by name through `lib/component-directory.ts`.

2. **Add a registry entry** to `registry.json`:

   ```json
   {
     "name": "component-name",
     "type": "registry:component",
     "title": "Component Name",
     "description": "Component description",
     "files": [
       {
         "path": "registry/default/component-name/component-name.tsx",
         "type": "registry:component"
       }
     ],
     "registryDependencies": [],
     "dependencies": ["required-package"]
   }
   ```

3. **Add the docs page** at `content/components/[component-name]/[locale].mdx` for every locale (`pnpm components:generate-mdx` scaffolds them; `components:verify-mdx` enforces them at build time).

4. **Rebuild the registry**:

   ```bash
   pnpm registry:build
   ```

   This writes the shim at the `files[].path` above (gitignored) and restamps `registry.json` and `lib/component-metadata.json`. Commit those two files; CI's `registry:check` fails if they drift from source.

## Available Components

- Badge
- Breadcrumb
- Button
- Card
- Code Block
- Code Copy
- Command
- Dialog
- Dropdown Menu
- Input
- Toast
- Theme Provider/Toggle
- Lang Provider
- Shared Header/Footer
- Homepage Sections

## Registry Format

The registry follows the shadcn/ui registry schema:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "vllnt",
  "homepage": "https://ui.vllnt.com",
  "items": [
    {
      "name": "component-name",
      "type": "registry:component",
      "title": "Component Title",
      "description": "Component description",
      "files": [
        {
          "path": "registry/default/component-name/component-name.tsx",
          "type": "registry:component"
        }
      ],
      "registryDependencies": [],
      "dependencies": ["package-name"]
    }
  ]
}
```

## Deployment

The app uses Next.js standalone output mode. Deploy to any platform supporting Next.js:

- Vercel (recommended)
- AWS Lambda / CloudFront
- Docker containers
- Any Node.js host

## Configuration

- **MDX**: Enabled via `@next/mdx` for component documentation
- **Transpilation**: `@vllnt/ui` package is transpiled automatically
- **CSS Chunking**: Strict mode enabled for optimal performance

## Related Packages

- `@vllnt/ui` - Component library package (workspace dependency)
- `shadcn` - Registry build tool (canary)
