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
├── registry/               # Component source files
│   └── default/           # Default style variant
│       └── [component]/   # Component files
│           ├── [component].tsx
│           └── docs.mdx   # Optional documentation
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

Visit `http://localhost:3000` to view the registry interface.

### Build

```bash
pnpm build
```

This builds the Next.js app and generates registry JSON files to `public/r/` using `shadcn build`.

## Registry API

### Endpoints

- `GET /r/registry.json` - Main registry index (all components)
- `GET /r/[component-name].json` - Individual component registry entry

### Usage with shadcn CLI

```bash
# Install a component
pnpm dlx shadcn@latest add https://ui.vllnt.com/r/button.json

# Or use the component name directly
pnpm dlx shadcn@latest add https://ui.vllnt.com/r/button.json
```

## Adding Components

1. **Create component directory**:

   ```bash
   mkdir -p registry/default/[component-name]
   ```

2. **Add component file**:

   ```tsx
   // registry/default/[component-name]/[component-name].tsx
   export function ComponentName() {
     // Component implementation
   }
   ```

3. **Add optional documentation**:

   ```mdx
   // registry/default/[component-name]/docs.mdx

   # Component Name

   Component description...
   ```

4. **Update registry.json**:
   Add entry to `registry.json`:

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

5. **Rebuild registry**:
   ```bash
   pnpm registry:build
   ```

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
