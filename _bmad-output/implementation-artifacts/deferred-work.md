# Deferred Work

Tracking items deliberately postponed during reviews. Each entry records where the deferral came from and why action was pushed out.

## Deferred from: code review of 1-1-turborepo-monorepo-scaffold (2026-04-14)

- **Shared package ships raw `.ts` as `main`/`types`** — works in-repo via bundlers and pnpm workspace symlink but a production `node dist/main` invocation that does not bundle `@confluent/shared` will fail at runtime (Node cannot parse TS). Revisit in Epic 10 when Docker multi-stage build and deployment strategy are defined.
- **TypeScript major drift (api `^5.7.3` vs web `~6.0.2`)** — already documented in story Dev Notes as a known quirk. Both workspaces typecheck cleanly today. Align versions when Vite template and NestJS toolchain converge on the same TS major.
- **`engines.node: ">=22"` permissive with `@types/node: ^24`** — a dev or CI runner on Node 22 LTS would get type definitions for Node 24-only APIs. Revisit with CI matrix decision (pin exact LTS or bump engines).
- **`turbo.json` `dev` missing `dependsOn: ["^build"]`** — not breaking today because `@confluent/shared` exports source directly. Preemptive; revisit if the shared package adds a build step or produces generated artifacts (e.g., OpenAPI types).
- **No `.nvmrc` / `.node-version`** — `engines.node` is advisory in pnpm without `engine-strict`. Consider adding a node-version file for consistent dev/CI environments.

## Deferred from: code review of 1-2-design-system-configuration (2026-04-14)

- **`verbatimModuleSyntax: true` + `import * as React`** — several shadcn components use `React.ComponentProps` types via a namespace import; works with React 19 JSX transform today. Revisit if `noUnusedLocals` tightens or a TS version change breaks emit.
- **`Input` component drops `ref` (no `forwardRef`)** — React 19 passes `ref` as a regular prop, and shadcn v4 relies on that pattern. Revisit if downstream consumers need ref forwarding or the lib upgrades.
- **Sub-pixel `radius-sm` (3.6px) and `rounded-4xl` on 20px Badge pill** — cosmetic rendering inconsistencies at non-retina DPRs. Design concern, not a code bug.
- **`Sheet` close button nests Base UI `Button` primitive via `render` prop** — Base UI merge semantics handle this today; revisit if hydration warnings appear.
- **`VITE_ALLOWED_HOSTS=","` edge case** — empty-after-split array causes Vite to block all hosts. Extremely unlikely misconfiguration; not hardening for now.
- **`"use client"` directives in label.tsx / separator.tsx** — harmless shadcn CLI output (this is a Vite app, directive is ignored); leaving to avoid diverging from upstream templates.
- **`hero.png` + `icons.svg` + `favicon.svg` scaffold leftovers** — scaffold-introduced assets; clean up once production favicon/icon set is designed.
- **Chart tokens near-indistinguishable** — design concern; revisit when chart components actually get built.
- **`index.html` missing trailing newline** — minor; will be normalized by prettier pass when convenient.

## Deferred from: code review of 1-3-route-skeleton-hardcoded-user-context (2026-04-14)

- **No `errorElement` / ErrorBoundary on any route** — a thrown render error (e.g. `useCurrentUser` misuse, future loaders) currently white-screens the app. Add route-level error UI when real loaders and protected routes land in Epics 2/6.
- **`useParams<{ token: string }>()` is a type lie** [apps/web/src/routes/share/index.tsx:4] — React Router types params as `string | undefined`. Tighten with a runtime guard when the real share view lands in Epic 4.
- **Sidebar user block has no truncation for long name/email** [apps/web/src/components/layout/AppShell.tsx:29-30] — harmless with the hardcoded user; apply `truncate` + `title` attributes when real users land in Epic 6.
- **`apps/web/package.json` devDependency ordering drift** — cosmetic churn from pnpm (`shadcn` moved down the list). Normalize with a `sort-package-json` pass or ignore.

## Deferred from: code review of 2-1-app-shell-sidebar-layout (2026-04-15)

- **Breadcrumbs render on `NotFoundRoute` paths under `/dashboard`** [apps/web/src/components/layout/Breadcrumbs.tsx:14-18] — a 404 inside the shell still gets a misleading trail (e.g. "Mes dossiers / typo"). Low-impact UX polish; revisit alongside the deferred `errorElement` work from story 1.3.
- **Surrogate-pair / emoji / combining-mark first character produces broken initial** [apps/web/src/components/layout/AppShell.tsx:62] — `name.charAt(0)` returns a UTF-16 code unit, not a grapheme. Hardcoded user is ASCII today; revisit alongside Epic 6 real-auth wiring when names become user-supplied.
- **`tableau-de-bord` NavLink lacks `end`, would stay highlighted on hypothetical deeper paths** [apps/web/src/components/layout/nav-items.ts:11] — only matters via the nested 404; no such routes exist today. Add `end: true` if/when child routes land under `/dashboard/tableau-de-bord`.
- **Unknown breadcrumb segments fall through to raw kebab-slug labels** [apps/web/src/components/layout/Breadcrumbs.tsx:10-12] — spec explicitly allows this for future dossier slugs. Revisit if non-slug-like segments appear.
