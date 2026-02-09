# `@vllnt/eslint`

## Introduction

Eslint config is split into separate files

- `configs/base`: is the common rules for all environment, what make the workspace consistent. For now, we have 2 bases (`base.js` and `legacy.js`), but legacy will be removed after packages have been migrated.
- `configs/core`: are subset configs, one for Typescript, one for formatting, imports etc. They are composable set of rules.
- `configs/environments`: are the exported pieces, they are a combination of subset configs mounted on top of the base config and made for a specific environment.

## VSCode

Paste this in your `.vscode/settings.json`, it helps eslint to find the package's `tsconfig.json`

```json
"eslint.workingDirectories": [
  "./apps/api",
  "./apps/engine",
  "./apps/game-app",
  "./packages/common/constants",
  "./packages/common/database",
  "./packages/common/functions",
  "./packages/common/types",
  "./scripts/import",
  "./tests/e2e"
]
```

## Migration

The first migration step was splitting stuff by environments. It's basically the same config as before, but with React/Next.js settings moved away:

```js
module.exports = {
  root: true,
  extends: ['custom/legacy-nextjs'], // or `custom/legacy-nodejs`
};
```

Then we can jump on the brand new config, in warn only to don't break the build:

```js
module.exports = {
  root: true,
  extends: ['@vllnt/eslint/nextjs-warn-only'], // or `@vllnt/eslint/nodejs-warn-only`
};
```

The last migration step is loading the normal new config:

```js
module.exports = {
  root: true,
  extends: ['@vllnt/eslint/nextjs'], // or `@vllnt/eslint/nodejs`
};
```
