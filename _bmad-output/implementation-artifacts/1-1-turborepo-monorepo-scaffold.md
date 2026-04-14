# Story 1.1: Turborepo Monorepo Scaffold

Status: review

## Story

As a developer,
I want a working Turborepo monorepo with apps/api, apps/web, and packages/shared,
so that frontend and backend can be developed in a unified codebase with shared TypeScript types from day one.

## Acceptance Criteria

1. **Given** the repository is cloned and `pnpm install` is run at the root, **When** the install completes, **Then** all three workspaces (`apps/api`, `apps/web`, `packages/shared`) install without errors and `node_modules` are correctly linked via pnpm workspaces.
2. **Given** the monorepo is installed, **When** `pnpm turbo run dev` is executed at root, **Then** `apps/web` starts on port 5173 (Vite) and `apps/api` starts on port 3000 (NestJS) with no startup errors.
3. **Given** `packages/shared/src/index.ts` exports a TypeScript type, **When** that type is imported in both `apps/web` and `apps/api`, **Then** TypeScript resolves the import without errors in both workspaces.
4. **Given** the monorepo root, **When** `pnpm turbo run build` is executed, **Then** both `apps/web` (Vite build) and `apps/api` (NestJS tsc) complete successfully with zero TypeScript errors.
5. **Given** the monorepo, **When** `pnpm turbo run lint` is executed, **Then** ESLint and Prettier report zero errors across all workspaces.
6. **Given** the project root, **When** a developer inspects `turbo.json`, **Then** pipeline tasks are defined for `dev`, `build`, `lint`, and `typecheck` with correct dependencies declared.

## Tasks / Subtasks

- [x] Task 1: Initialize Turborepo monorepo (AC: 1, 6)
  - [x] Root `package.json` with `"packageManager": "pnpm@10.33.0"` and `engines.node >= 22`
  - [x] `pnpm-workspace.yaml` listing `apps/*` and `packages/*`
  - [x] `.gitignore` excluding `node_modules`, `.turbo`, `dist`, `.env`, `*.local`

- [x] Task 2: Scaffold NestJS API app (AC: 2)
  - [x] `npx @nestjs/cli new api --strict --skip-git --package-manager pnpm` in `apps/`
  - [x] Renamed package to `@confluent/api`
  - [x] Added `dev` and `typecheck` scripts to `apps/api/package.json`
  - [x] Removed default `app.controller.spec.ts` and `app.service.ts`
  - [x] Simplified `app.controller.ts` (no service dependency)
  - [x] Set `nest-cli.json` `deleteOutDir: false` (avoids `nest start --watch` race)

- [x] Task 3: Scaffold React + Vite frontend app (AC: 2)
  - [x] `pnpm create vite@latest web --template react-ts` → React 19 + Vite 8
  - [x] Renamed package to `@confluent/web`
  - [x] Added `server.port: 5173` to `vite.config.ts`
  - [x] Added `typecheck` script + set `dev` script to use port 5173

- [x] Task 4: Create packages/shared (AC: 3)
  - [x] `packages/shared/package.json` with `main: "./src/index.ts"` and `exports` field
  - [x] `packages/shared/src/index.ts` exporting `UserRole` type
  - [x] `packages/shared/tsconfig.json` extending root
  - [x] `@confluent/shared: "workspace:*"` dependency in both apps
  - [x] Symlink verified at `apps/api/node_modules/@confluent/shared` after `pnpm install`

- [x] Task 5: Configure turbo.json pipeline (AC: 6)
  - [x] Tasks: `build` (with `dependsOn: ["^build"]`, outputs `dist/**`), `dev` (persistent, no cache), `lint`, `typecheck`

- [x] Task 6: Configure TypeScript across workspaces (AC: 3, 4)
  - [x] Root `tsconfig.json` with `strict: true`, `esModuleInterop`, `skipLibCheck`, `forceConsistentCasingInFileNames`
  - [x] API `tsconfig.json` with explicit `rootDir: ./src` + `include: ["src"]` + `exclude: ["test", "dist"]` (forces correct `dist/main.js` output location)
  - [x] Web `tsconfig.app.json` retains bundler moduleResolution — shared package resolves via pnpm symlink, no `paths` needed
  - [x] Verified `UserRole` type import in `apps/api/src/app.module.ts` and `apps/web/src/main.tsx`

- [x] Task 7: Configure ESLint + Prettier at monorepo root (AC: 5)
  - [x] `.eslintrc.cjs` at root with TypeScript parser + prettier compat
  - [x] `.prettierrc` (single quotes, no semi, 2-space indent, 100 char width, trailing commas)
  - [x] `lint` + `typecheck` scripts in each workspace

- [x] Task 8: Verify full build pipeline (AC: 4)
  - [x] `pnpm turbo run typecheck` → 2 successful, 0 errors
  - [x] `pnpm turbo run build` → 2 successful, 0 errors
  - [x] `pnpm turbo run lint` → 2 successful, 0 errors 0 warnings
  - [x] `pnpm turbo run dev` → web ready on 5173, NestJS started on 3000

## Dev Notes

### Key Implementation Decisions

**Scaffolding into existing directory:** `npx create-turbo@latest` was not used because `/home/coder/confluent` already existed with BMAD planning artifacts. Scaffolded `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.json` manually — NestJS and Vite apps generated into `apps/` via their CLIs.

**Cross-workspace resolution without `paths`:** Initial attempt used `tsconfig.paths` pointing to `../../packages/shared/src/index.ts` in both apps. This caused TSC to widen `rootDir` to the monorepo root, producing `dist/apps/api/src/main.js` instead of `dist/main.js`, which broke `nest start --watch`. Fix: remove `paths`, rely on pnpm workspace symlink at `apps/api/node_modules/@confluent/shared`, and pin `rootDir: ./src` in api's tsconfig. Web uses `moduleResolution: bundler` which resolves via the symlink natively.

**`deleteOutDir: false` in `nest-cli.json`:** Default `true` caused a race with `nest start --watch` — the watcher deleted `dist/` on startup, then `node dist/main.js` ran before the initial compile finished. Setting `false` keeps previous builds in place so the watcher always has something to run.

**`exports: { ".": "./src/index.ts" }` on shared package:** Shared is consumed directly from source (no build step). Node's module resolution via pnpm symlink works for both NestJS (nodenext + resolvePackageJsonExports) and Vite (bundler mode).

### Versions Installed
- turbo: 2.9.6
- pnpm: 10.33.0
- Node.js: 24.14.1
- NestJS: 11.1.19
- React: 19.2.4
- Vite: 8.0.8
- TypeScript: 5.x (api), 6.0.x (web — Vite template default)

### Known Quirks
- `@confluent/web` TS 6 preview is different from `@confluent/api` TS 5. Both typecheck cleanly today but future stories may need to align them.
- Pnpm reports 3 deprecated subdependencies (`glob@10.5.0`, `glob@7.2.3`, `inflight@1.0.6`) — transitive from NestJS deps, harmless, will clear on NestJS upgrades.
- Pnpm asks to `approve-builds` for `@nestjs/core` and `unrs-resolver` native build scripts — safe to skip in dev; approve before first production build.

### References

- Architecture: monorepo scaffold decision [Source: architecture.md#Starter Template Evaluation]
- Architecture: project directory structure [Source: architecture.md#Complete Project Directory Structure]
- Architecture: turbo.json pipeline tasks [Source: architecture.md#turbo.json]
- Epics: Story 1.1 acceptance criteria [Source: epics.md#Story 1.1]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `pnpm install` output: `+35 packages added, 3.0s`
- `pnpm turbo run typecheck`: 2 successful, 1.795s
- `pnpm turbo run build`: 2 successful, web 155ms, api OK
- `pnpm turbo run lint`: 2 successful, 0 errors
- `pnpm turbo run dev`: Vite ready on 5173, NestJS application successfully started on 3000

### Completion Notes List

1. Monorepo root files (`package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.json`, `.gitignore`, `.eslintrc.cjs`, `.prettierrc`) created.
2. NestJS 11 scaffolded to `apps/api`, renamed to `@confluent/api`, simplified (no default AppService); `deleteOutDir` disabled.
3. React 19 + Vite 8 scaffolded to `apps/web` with `react-ts` template, renamed to `@confluent/web`, dev port pinned to 5173.
4. `packages/shared` created from scratch with a single exported `UserRole` type.
5. Cross-workspace type import validated at compile time via `UserRole` usage in both apps.
6. All four turbo pipeline tasks (typecheck, build, lint, dev) pass end-to-end.

### File List

**Created (monorepo root):**
- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.json`
- `.gitignore`
- `.eslintrc.cjs`
- `.prettierrc`

**Created (packages/shared):**
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/src/index.ts`

**Scaffolded + modified (apps/api):**
- `apps/api/` (full NestJS scaffold)
- `apps/api/package.json` — renamed to `@confluent/api`, added `dev` and `typecheck` scripts, added `@confluent/shared` dep
- `apps/api/tsconfig.json` — added `rootDir: ./src`, `include`, `exclude`
- `apps/api/nest-cli.json` — `deleteOutDir: false`
- `apps/api/src/app.module.ts` — simplified; added `UserRole` type import for cross-workspace validation
- `apps/api/src/app.controller.ts` — simplified (no service dep)
- `apps/api/src/main.ts` — `void bootstrap()` to satisfy `no-floating-promises`
- `apps/api/src/app.service.ts` — **deleted**
- `apps/api/src/app.controller.spec.ts` — **deleted**

**Scaffolded + modified (apps/web):**
- `apps/web/` (full React 19 + Vite 8 scaffold)
- `apps/web/package.json` — renamed to `@confluent/web`, added `typecheck` script, pinned dev port 5173, added `@confluent/shared` dep
- `apps/web/vite.config.ts` — added `server.port: 5173`
- `apps/web/tsconfig.app.json` — no path changes (relies on pnpm symlink)
- `apps/web/src/main.tsx` — added `UserRole` type import for cross-workspace validation
