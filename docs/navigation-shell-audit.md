# Navigation Shell Audit

Date: 2026-06-20

## Summary

The workspace currently has several independent dashboard navigation shells. WordGeni has the closest visual baseline, but its navigation renderer mixes product config, auth actions, progress/user cards, feature flags, route metadata, and mobile behavior in one app-specific component. The implementation should add a router-neutral shell to `packages/ecosystem-assistant-ui` first, then migrate apps with thin adapters and per-app configs.

This audit is limited to shell rendering, navigation config, responsive behavior, accessibility, and layout. Backend behavior, auth behavior, database code, API behavior, payment behavior, and app business logic are out of scope.

## Components Found

### Shared Package

- `packages/ecosystem-assistant-ui/src/index.tsx`
  - Currently exports ecosystem assistant bubble UI and prompt packs.
  - No reusable navigation shell or navigation config types exist.

### WordGeni

- `apps/WordGeni/apps/web/src/components/layout/app-shell.tsx`
- `apps/WordGeni/apps/web/src/components/layout/app-sidebar.tsx`
- `apps/WordGeni/apps/web/src/components/layout/app-sidebar-nav.tsx`
- `apps/WordGeni/apps/web/src/components/layout/mobile-nav-drawer.tsx`
- `apps/WordGeni/apps/web/src/components/layout/dashboard-brand-header.tsx`
- `apps/WordGeni/apps/web/src/components/layout/mobile-bottom-nav.tsx`
- `apps/WordGeni/apps/web/src/store/uiStore.ts`

Findings:
- `app-sidebar-nav.tsx` owns hardcoded `ALL_NAV_GROUPS`, active matching, feature-flag filtering, admin visibility, user progress, AI/current route cards, CTA, quick action, notifications, account footer, and logout.
- Desktop collapse and mobile drawer behavior exist and should be preserved through the shared shell.
- The component is visually closest to the requested baseline but too WordGeni-specific to share directly.

### XFlow

- `apps/XFlow/src/components/layout/DashboardShell.tsx`
- `apps/XFlow/src/components/layout/AppSidebar.tsx`
- `apps/XFlow/src/components/layout/SidebarNav.tsx`
- `apps/XFlow/src/components/layout/MobileNav.tsx`
- `apps/XFlow/src/components/layout/AppHeader.tsx`
- `apps/XFlow/src/lib/navigation/main-nav.ts`
- `apps/XFlow/src/lib/navigation/app-nav.ts`

Findings:
- Navigation config is relatively well separated in `main-nav.ts` and `app-nav.ts`.
- `SidebarNav.tsx` owns rendering, group collapse storage, active child rendering, disabled state, and badges.
- `MobileNav.tsx` has local drawer state and backdrop close, but does not fully cover body scroll lock, focus return, and route-change close.
- Desktop has grouped collapse but not full icon-only shell collapse.

### RatAiFy

- `apps/RatAiFy/client/src/components/app-sidebar.tsx`
- `apps/RatAiFy/client/src/components/admin/AdminSidebar.tsx`
- `apps/RatAiFy/client/src/components/admin/AdminLayout.tsx`
- `apps/RatAiFy/client/src/components/protected-layout.tsx`
- `apps/RatAiFy/client/src/components/protected-trust-shell-frame.tsx`
- `apps/RatAiFy/client/src/features/trustDashboard/components/RataifyTrustShell.tsx`
- `apps/RatAiFy/client/src/lib/app-navigation.ts`

Findings:
- `app-sidebar.tsx` has hardcoded user navigation arrays plus billing, site selector, demo buttons, platform-admin card, and account footer.
- `AdminSidebar.tsx` has a separate hardcoded admin nav, separate collapse state, and separate visual system.
- `RataifyTrustShell.tsx` is another shell surface with its own mobile state.
- Role visibility logic exists in `app-navigation.ts` and should be reused by config adapters.
- Existing route-sync tests parse sidebar paths, so config extraction must keep route verification updated.

### Crevux

- `apps/CreVux/artifacts/image-gen/src/components/AppShell.tsx`
- `apps/CreVux/artifacts/image-gen/src/App.tsx`
- `apps/CreVux/artifacts/image-gen/src/pages/AdminDashboardPage.tsx`
- `apps/CreVux/artifacts/image-gen/src/features/create-home/components/CreateSidebar.tsx`
- `apps/CreVux/artifacts/image-gen/src/components/dashboard/CrevuxUniversalMobileMenu.tsx`
- `apps/CreVux/artifacts/image-gen/src/lib/crevuxAppPaths.ts`
- `apps/CreVux/artifacts/image-gen/src/lib/studioAppPaths.ts`
- `apps/CreVux/artifacts/image-gen/src/lib/proSettings.ts`

Findings:
- The active web source appears to be `apps/CreVux/artifacts/image-gen`.
- `AppShell.tsx` is primarily an auth/content wrapper with SiteWiki and Copilot providers; it is not a product navigation shell.
- Admin navigation is embedded in `AdminDashboardPage.tsx`.
- Create/studio rail logic is embedded in `CreateSidebar.tsx` and should remain an app-specific tool rail unless it becomes primary app navigation.
- `CrevuxUniversalMobileMenu.tsx` is a separate mobile navigation surface and should be replaced or adapted after the product-level config exists.

### Verixet

- `apps/Verixet/src/components/dashboard/AppShell.tsx`
- `apps/Verixet/src/components/dashboard/DashboardShellNav.tsx`
- `apps/Verixet/src/app/dashboard/(main)/layout.tsx`
- `apps/Verixet/src/components/dashboard/xflow-app-command/AppContextSidebar.tsx`
- `apps/Verixet/src/lib/dashboard/dashboard-top-nav.ts`

Findings:
- `DashboardShellNav.tsx` has hardcoded `SIDEBAR_GROUPS`, active matching quirks, workspace-admin filtering, platform-operator additions, and prefetch behavior.
- `AppShell.tsx` implements its own mobile drawer with backdrop but does not fully implement the requested shared accessibility/focus behavior.
- `AppContextSidebar.tsx` is contextual subnavigation and should remain app-specific unless a later task generalizes contextual subnavs.

### AudAiX

- `apps/AudAix/dashboard/src/layout/AppShell.tsx`
- `apps/AudAix/dashboard/src/layout/AudAixStudioShell.tsx`
- `apps/AudAix/dashboard/src/components/navigation/AudAixStudioSidebar.tsx`
- `apps/AudAix/dashboard/src/components/navigation/SitewideNav.tsx`

Findings:
- `SitewideNav.tsx` handles marketing and signed-in top navigation with its own mobile drawer.
- `AudAixStudioSidebar.tsx` has hardcoded studio groups, nested module sections, and route/query active matching.
- `AudAixStudioShell.tsx` should keep workspace data loading and pass metadata into the shared shell as slots/config.

### JournOwl And 1ofaKindPiece

- No first-class app source tree was found for either app.
- References exist only in XFlow/provider contracts, seed data, docs, and cross-app tests.
- They are not directly migratable in this workspace.
- Do not invent routes. Add only future/provider-app config stubs in XFlow if needed.

## Duplicated Shells

- WordGeni dashboard shell and mobile drawer.
- XFlow dashboard sidebar, mobile drawer, and header.
- RatAiFy user sidebar, admin sidebar, and trust shell.
- Crevux app wrapper, admin sidebar, create/studio rail, and mobile menu.
- Verixet dashboard shell and dashboard nav.
- AudAiX sitewide nav and studio sidebar.

## Route And Config Risks

- WordGeni external community link and feature-flagged items need explicit external/visibility config.
- XFlow active matching has special cases for `/tools`, `/developer`, Verixet, and app detail routes.
- RatAiFy route-sync tests currently inspect `app-sidebar.tsx`; config extraction must update tests or keep parseable route declarations.
- Crevux route constants should be used instead of hardcoded paths.
- Verixet `/dashboard/xflow` active matching intentionally covers related integration routes.
- AudAiX active matching depends on both path and query parameters for sections and tool tabs.
- JournOwl and 1ofaKindPiece route inventories are absent.

## Migration Approach

1. Add shared router-neutral shell primitives and config types to `packages/ecosystem-assistant-ui`.
2. Add per-app adapters that translate existing configs into `NavigationShellConfig`.
3. Migrate WordGeni first because it is the visual baseline and already has most required behaviors.
4. Migrate XFlow next because route config is already centralized and it can host future/provider stubs.
5. Migrate RatAiFy after updating route-sync tests to read the new config source.
6. Migrate Crevux product-level app routes while preserving studio/admin gates and leaving popout routes outside the shell.
7. Migrate Verixet and AudAiX by converting hardcoded arrays into config while keeping command bars and contextual subnavs as slots.

## Files Likely To Change

- `packages/ecosystem-assistant-ui/src/index.tsx`
- `packages/ecosystem-assistant-ui/src/navigation-shell.tsx`
- `packages/ecosystem-assistant-ui/test/navigation-shell.test.mjs`
- `packages/ecosystem-assistant-ui/package.json`
- WordGeni layout/nav files under `apps/WordGeni/apps/web/src/components/layout`
- XFlow layout/nav files under `apps/XFlow/src/components/layout` and `apps/XFlow/src/lib/navigation`
- RatAiFy sidebar/config files under `apps/RatAiFy/client/src`
- Crevux app shell/nav config files under `apps/CreVux/artifacts/image-gen/src`
- Verixet dashboard shell/nav files under `apps/Verixet/src/components/dashboard`
- AudAiX dashboard shell/nav files under `apps/AudAix/dashboard/src`

## Risks Before Implementation

- Full migration touches multiple apps with different routers: Next, Wouter, and React Router.
- Shared package is currently `tsc`-only, so styles must be injected or exported as raw CSS.
- Some apps already have route verification scripts that assume nav arrays live in specific files.
- Several existing shell components mix layout with account, billing, workspace, and product-specific UI; these must become slots rather than shared package responsibilities.
- The repository has an empty `.git` directory in this workspace snapshot, so git status/commit operations may not work until the repository metadata is repaired.

## Package Resolution Audit

### WordGeni

- Imports root shared package: yes for TypeScript, via `apps/WordGeni/apps/web/tsconfig.json` path `../../../../packages/ecosystem-assistant-ui/dist/index`.
- Uses vendored copy: yes at dependency level, because `apps/WordGeni/apps/web/package.json` declares `@xflow-ecosystem/ecosystem-assistant-ui` as `file:../../packages/ecosystem-assistant-ui`, which resolves inside `apps/WordGeni/packages`.
- Alias/path override found: TypeScript path override points to root built shared package. Existing imports already use the package name.
- Safest fix for first migration: build the root shared package and rely on the existing WordGeni TypeScript path for source/type resolution. Do not change dependency wiring in this pass because that could disturb the app-local workspace.
- Migration readiness: ready with root package build present; package-manager dependency sync remains a follow-up risk for install/build environments that ignore the TS path alias.

### XFlow

- Imports root shared package: no direct app imports found.
- Uses vendored copy: no target-specific `ecosystem-assistant-ui` dependency was found in `apps/XFlow` during this pass.
- Alias/path override found: none for this package.
- Safest fix: if XFlow is migrated later, add an explicit dependency/path alias to the root shared package or a deliberate app-local package reference before importing shared shell components.
- Migration readiness: needs package resolution setup before migration.

### Crevux

- Imports root shared package: no. `apps/CreVux/artifacts/image-gen` aliases to `../../packages/ecosystem-assistant-ui/dist/index`, which is the Crevux-local package copy.
- Uses vendored copy: yes, `apps/CreVux/packages/ecosystem-assistant-ui`.
- Alias/path override found: both `tsconfig.json` and `vite.config.ts` point to the Crevux-local package dist.
- Safest fix: sync the shared shell exports into the Crevux-local package copy or deliberately switch the Vite/TS aliases to the root package in a dedicated Crevux migration pass.
- Migration readiness: needs sync.

### RatAiFy

- Imports root shared package: no. Paths point to `./packages/ecosystem-assistant-ui`.
- Uses vendored copy: yes, `apps/RatAiFy/packages/ecosystem-assistant-ui`.
- Alias/path override found: `tsconfig.json` points to local package source; `vite.config.ts` points to local package dist.
- Safest fix: sync local package copy first because RatAiFy tests and Vite config are built around app-local packages.
- Migration readiness: needs sync.

### Verixet

- Imports root shared package: no. `apps/Verixet/tsconfig.json` points to `./packages/ecosystem-assistant-ui/dist/index`.
- Uses vendored copy: yes, `apps/Verixet/packages/ecosystem-assistant-ui`.
- Alias/path override found: TypeScript path override to Verixet-local package dist.
- Safest fix: sync Verixet-local package copy first or update the app's package path in a dedicated migration pass.
- Migration readiness: needs sync.

### AudAiX Dashboard

- Imports root shared package: no. Dashboard aliases point to `../packages/ecosystem-assistant-ui`, which is `apps/AudAix/packages/ecosystem-assistant-ui`.
- Uses vendored copy: yes, `apps/AudAix/packages/ecosystem-assistant-ui`.
- Alias/path override found: `tsconfig.json`, `tsconfig.test.json`, and `vite.config.ts` point to the AudAiX-local package dist.
- Safest fix: sync AudAiX-local package copy first because Vite and test TS configs both target it.
- Migration readiness: needs sync.

### First Migration Decision

WordGeni is selected for the first app migration because its active app source already has a TypeScript path to the root built shared package, and no package-resolution changes are needed for source/type checks. This pass does not modify package resolution for other apps.

## XFlow Package Resolution Cleanup

- Imports root shared package: yes after this pass. `apps/XFlow/tsconfig.json` maps `@xflow-ecosystem/ecosystem-assistant-ui` to `../../packages/ecosystem-assistant-ui/dist/index`, and `apps/XFlow/vitest.config.mts` maps tests to the root package dist file.
- Uses vendored copy: no. XFlow has vendored packages for `ecosystem-assistant`, `ecosystem-showcase`, and `supabase`, but no app-local `ecosystem-assistant-ui` copy.
- Dependency change: `apps/XFlow/package.json` now declares `@xflow-ecosystem/ecosystem-assistant-ui` as `file:../../packages/ecosystem-assistant-ui`.
- Lockfile note: `npm --prefix apps/XFlow install --ignore-scripts` failed in npm/arborist with `Cannot read properties of undefined (reading 'spec')` before saving metadata. `apps/XFlow/package-lock.json` and `apps/XFlow/pnpm-lock.yaml` were manually aligned with the root shared UI file dependency, and TypeScript import safety was verified through the explicit root dist aliases.
- Safest fix: keep XFlow pointed at the root package dist through TypeScript/Vitest aliases and package dependency metadata. Do not create a vendored package copy.
- Files changed for package resolution: `apps/XFlow/package.json`, `apps/XFlow/package-lock.json`, `apps/XFlow/pnpm-lock.yaml`, `apps/XFlow/tsconfig.json`, `apps/XFlow/vitest.config.mts`.
- Migration readiness: ready. `npm --prefix packages/ecosystem-assistant-ui run typecheck`, `npm --prefix packages/ecosystem-assistant-ui test`, and `npm --prefix apps/XFlow run typecheck` passed after the package-resolution change.

## XFlow Shared Shell Migration

- Adapter added: `apps/XFlow/src/components/layout/xflow-navigation-shell-config.tsx` converts `getMainNavGroups()` output into shared `NavSectionConfig` and `NavItemConfig` values.
- Shared components used: `NavigationShellStyles`, `SidebarNav`, `MobileNavDrawer`, and `CollapseToggle`.
- Shared package extension: `NavItemConfig.isActive` allows apps to preserve custom route matching, including XFlow's `/tools` exclusion for Chronicle and AI Context Engine. `NavItemConfig.dataAttributes` preserves `data-nav-id` and `data-tour-target` attributes used by onboarding/tour behavior.
- Desktop migration: `apps/XFlow/src/components/layout/AppSidebar.tsx` keeps the existing brand block and `WorkspaceSwitcher`, then renders navigation through the shared `SidebarNav`. Desktop icon-only collapse persists to `xflow.navShell.xflow.collapsed`.
- Mobile migration: `apps/XFlow/src/components/layout/MobileNav.tsx` now renders through shared `MobileNavDrawer`, while keeping the workspace switcher and ecosystem-version link as app-specific drawer content.
- Preserved behavior: admin nav access remains driven by `AdminNavAccessLevel`; app thumbnails are preserved in shared config icons; existing main nav route definitions remain in `src/lib/navigation/main-nav.ts`; provider stubs for JournOwl and 1ofaKindPiece remain metadata-only and are not exposed as routes.

## Post-Migration QA Checklist

### WordGeni

- [ ] Desktop expanded sidebar renders all visible configured sections.
- [ ] Desktop collapsed sidebar hides labels and keeps icon targets usable.
- [ ] Collapse preference persists after reload.
- [ ] Mobile hamburger/menu opens drawer.
- [ ] Route change closes drawer.
- [ ] Escape closes drawer.
- [ ] Backdrop closes drawer.
- [ ] Focus returns to hamburger/menu trigger.
- [ ] Active route highlighting works, including hash/query variants.
- [ ] Role/admin visibility works.
- [ ] External community link opens as an external link.
- [ ] Disabled items do not navigate.
- [ ] Account/logout remains reachable.
- [ ] No horizontal scroll.
- [ ] No content hidden under sidebar.
- [ ] No console errors.
- [ ] Progress card still renders.
- [ ] Genie quick action still works.
- [ ] Route metadata card still updates.
- [ ] Feature-flag items still hide/show correctly.

### XFlow

- [ ] Desktop expanded sidebar renders all visible configured sections.
- [ ] Desktop collapsed sidebar hides labels and keeps icon targets usable.
- [ ] Collapse preference persists after reload.
- [ ] Mobile hamburger opens drawer.
- [ ] Route change closes drawer.
- [ ] Escape closes drawer.
- [ ] Backdrop closes drawer.
- [ ] Focus returns to hamburger.
- [ ] Active route highlighting works.
- [ ] Role/admin visibility works.
- [ ] External links work if configured later.
- [ ] Disabled items do not navigate.
- [ ] Account/logout remains reachable.
- [ ] No horizontal scroll.
- [ ] No content hidden under sidebar.
- [ ] No console errors.
- [ ] Workspace switcher still works.
- [ ] App thumbnails still render.
- [ ] RightAiRail still behaves.
- [ ] MFA gate still blocks when expected.
- [ ] Onboarding still behaves.
- [ ] `/tools` active-route quirks still work.

## Manual Browser QA Script

### WordGeni

Scope: validate the migrated shared shell only. Do not change backend, auth, API, database, payment, or business logic while running this script.

1. Start WordGeni with the existing local app command and sign in with a normal workspace user.
2. Open the dashboard on desktop width, then confirm the sidebar is expanded by default and the progress card, route metadata card, Genie quick action card, CTA/account footer, and logout remain visible and usable.
3. Use the desktop collapse control, reload, and confirm the collapsed icon-only state persists through `xflow.navShell.wordgeni.collapsed`.
4. Expand the sidebar again, reload, and confirm labels return.
5. Visit representative routes from each visible section, including routes with query strings or hashes if available, and confirm active state follows the correct item without double-highlighting.
6. Open the external community link and confirm it uses external-link behavior without closing over an internal route.
7. Toggle available feature flags or use a role with reduced access if available, then confirm hidden/disabled items stay non-navigable and visible items still match the old behavior.
8. Switch to tablet/mobile width, open the mobile menu from the dashboard controls, and confirm the drawer receives focus, body scroll is locked, and nav targets are at least 44px high.
9. Close the mobile drawer by Escape, backdrop click, close button, and route navigation. Confirm focus returns to the menu trigger after each close path.
10. Confirm the mobile bottom nav still opens the drawer and does not hide content, produce horizontal scroll, or leave console errors.

### XFlow

Scope: validate the migrated shared shell only. Keep MFA, onboarding, workspace, and assistant rails as app-owned behavior.

1. Start XFlow with the existing local dashboard command and sign in with a normal workspace user.
2. Open the dashboard on desktop width and confirm the sidebar is expanded by default, the workspace switcher renders, app thumbnails render, and `RightAiRail` still behaves as before.
3. Use the desktop collapse control, reload, and confirm the collapsed icon-only state persists through `xflow.navShell.xflow.collapsed`.
4. Expand the sidebar again, reload, and confirm labels return.
5. Navigate through Overview, Tools, Chronicle, AI Context Engine, developer, connected-app, and app-detail routes. Confirm active matching preserves the existing `/tools` route quirks.
6. Sign in or simulate admin access where locally supported and confirm admin-only items appear only for allowed roles.
7. Confirm provider/future entries for JournOwl and 1ofaKindPiece remain metadata-only and do not create invented routes.
8. Switch to tablet/mobile width, open the hamburger drawer, and confirm the drawer receives focus, body scroll is locked, and nav targets are at least 44px high.
9. Close the mobile drawer by Escape, backdrop click, close button, and route navigation. Confirm focus returns to the hamburger trigger after each close path.
10. Confirm MFA gate and onboarding states still block or route as expected, and no content is hidden under the sidebar/header, no horizontal scroll appears, and no nav console errors are emitted.

## RatAiFy Readiness Audit

Package resolution:
- RatAiFy currently resolves `@xflow-ecosystem/ecosystem-assistant-ui` to the app-local package at `apps/RatAiFy/packages/ecosystem-assistant-ui`, not the root shared package.
- `apps/RatAiFy/package.json` declares `@xflow-ecosystem/ecosystem-assistant-ui` as `file:./packages/ecosystem-assistant-ui`.
- `apps/RatAiFy/tsconfig.json` maps the package to `./packages/ecosystem-assistant-ui/src/index`.
- `apps/RatAiFy/vite.config.ts` maps the package to `packages/ecosystem-assistant-ui/dist/index.js`.
- The app-local package is assistant-bubble-only today and does not export `AppShell`, `SidebarNav`, `MobileNavDrawer`, `NavigationShellStyles`, or the shared navigation config types.
- Migration risk level: high until package resolution is deliberately fixed, because importing shared shell symbols in RatAiFy would fail against the current app-local package.

Shell surfaces found:
- `apps/RatAiFy/client/src/components/protected-layout.tsx` is the authenticated layout entry and now routes authenticated pages through the trust shell.
- `apps/RatAiFy/client/src/components/protected-trust-shell-frame.tsx` owns selected-site state, scan state, scan confirmation/progress dialogs, and passes props into the trust shell.
- `apps/RatAiFy/client/src/features/trustDashboard/components/RataifyTrustShell.tsx` is the active authenticated product shell with sidebar, mobile drawer, top bar, selected-site selector, plan card, operator card, scan CTA, and user footer.
- `apps/RatAiFy/client/src/components/app-sidebar.tsx` remains an older sidebar surface with hardcoded arrays, selected-site selector, demo buttons, billing card, operator card, user menu, and route-sync test coverage.
- `apps/RatAiFy/client/src/components/admin/AdminSidebar.tsx` is a separate superadmin sidebar with its own groups and local collapse state.
- `apps/RatAiFy/client/src/components/admin/AdminLayout.tsx` mounts the admin sidebar and should be handled as a separate admin migration pass.

Navigation arrays and role visibility:
- `apps/RatAiFy/client/src/lib/trust-shell-navigation.ts` contains `TRUST_SHELL_NAV_GROUPS`, `filterTrustShellNavGroups`, `trustShellNavRoutePaths`, and `isTrustShellNavItemActive`.
- `apps/RatAiFy/client/src/components/app-sidebar.tsx` contains older inline `navigationItems`, `scanWorkflowItems`, and `otherItems` arrays.
- `apps/RatAiFy/client/src/components/admin/AdminSidebar.tsx` contains inline `navGroups`.
- `apps/RatAiFy/client/src/lib/app-navigation.ts` contains the existing role visibility contract through `canSeeAppNavPath`, `canAccessAdvancedSurface`, `normalUserNavPaths`, and `advancedSurfacePaths`.

Recommended migration order:
1. Fix package resolution first in a package-resolution-only pass. Either sync `apps/RatAiFy/packages/ecosystem-assistant-ui` with the root shared shell exports or switch all RatAiFy dependency, TypeScript, Vite, and test aliases to the root package. The safer local-first path is syncing the app-local package because RatAiFy build scripts already run `npm --prefix packages/ecosystem-assistant-ui run build`.
2. Migrate the active authenticated trust shell next: `protected-layout.tsx`, `protected-trust-shell-frame.tsx`, `RataifyTrustShell.tsx`, and `trust-shell-navigation.ts`.
3. Keep selected-site state, scan dialogs, billing queries, platform-admin card, demo mode banner/buttons, and top-bar scan CTA app-owned slots.
4. Migrate or retire the older `app-sidebar.tsx` only after confirming whether any current route still mounts it. Preserve parseable route declarations or update the route-sync tests in the same pass.
5. Migrate `AdminSidebar.tsx` separately after user/trust shell migration, because its route set, collapse behavior, and superadmin context are distinct.

Files likely to change in the RatAiFy pass:
- `apps/RatAiFy/packages/ecosystem-assistant-ui/src/index.tsx`
- `apps/RatAiFy/packages/ecosystem-assistant-ui/src/navigation-shell.tsx`
- `apps/RatAiFy/packages/ecosystem-assistant-ui/package.json`
- `apps/RatAiFy/client/src/lib/navigation/rataify-navigation-shell-config.tsx`
- `apps/RatAiFy/client/src/lib/trust-shell-navigation.ts`
- `apps/RatAiFy/client/src/features/trustDashboard/components/RataifyTrustShell.tsx`
- `apps/RatAiFy/client/src/components/protected-layout.tsx`
- `apps/RatAiFy/client/src/components/protected-trust-shell-frame.tsx`
- `apps/RatAiFy/client/src/components/app-sidebar.tsx`
- `apps/RatAiFy/client/src/components/admin/AdminSidebar.tsx`
- `apps/RatAiFy/tests/sidebar-routes-sync.node.test.ts`
- `apps/RatAiFy/scripts/verify-sidebar-routes.ts`
- `apps/RatAiFy/tests/navigation-access.node.test.ts`
- `apps/RatAiFy/tests/trust-shell-navigation.node.test.ts`
- `apps/RatAiFy/tests/interactions/navigation.spec.ts`

Tests available for RatAiFy migration:
- `npm --prefix apps/RatAiFy run build:packages`
- `npm --prefix apps/RatAiFy run typecheck`
- `npm --prefix apps/RatAiFy run verify:sidebar`
- `npm --prefix apps/RatAiFy run test:smoke:auth`
- `npm --prefix apps/RatAiFy run build`
- Targeted safe tests: `tsx --test tests/sidebar-routes-sync.node.test.ts tests/navigation-access.node.test.ts tests/trust-shell-navigation.node.test.ts tests/protected-layout-selected-site.node.test.ts tests/trust-dashboard-rendering.node.test.ts`
- Broader suite: `npm --prefix apps/RatAiFy run test:ops`

Current blockers:
- Shared navigation shell exports are not available through RatAiFy's current local package resolution.
- Route-sync tests currently inspect legacy/sidebar sources and must be updated with the config extraction.
- The active trust shell and older app sidebar both contain nav declarations; the migration must avoid producing two competing route authorities.
- Mobile drawer behavior in `RataifyTrustShell.tsx` does not yet include the full shared focus return/body-scroll-lock contract.
- Selected-site selector, scan CTA, billing card, demo buttons, platform-admin card, and scan dialogs must remain app slots and not move into the shared package.

## RatAiFy Migration Plan

1. Package resolution cleanup:
   - Preferred first step: copy or port the root `packages/ecosystem-assistant-ui` shared shell exports into `apps/RatAiFy/packages/ecosystem-assistant-ui`, then run `npm --prefix apps/RatAiFy run build:packages`.
   - Alternative: switch `apps/RatAiFy/package.json`, `tsconfig.json`, `vite.config.ts`, and test aliases to the root `../../packages/ecosystem-assistant-ui` package in a dedicated pass, then regenerate package metadata only after npm install behavior is verified.
2. Adapter location:
   - Add `apps/RatAiFy/client/src/lib/navigation/rataify-navigation-shell-config.tsx`.
   - Convert `TRUST_SHELL_NAV_GROUPS` into shared `NavSectionConfig[]`, preserving disabled setup items, external community link, badges, active matching, and role filtering through `canSeeAppNavPath`.
3. Shared components:
   - Use `NavigationShellStyles`, `SidebarNav`, `MobileNavDrawer`, and `CollapseToggle` where desktop collapse is introduced.
   - Use `renderLink`/`onNavigate` with Wouter and keep the shared package router-neutral.
4. App-owned slots:
   - Keep selected-site selector in `drawerIntro` or a workspace slot.
   - Keep billing usage, platform-admin card, demo buttons, user footer/logout, and scan CTA as app-owned sidebar/footer/top-bar slots.
   - Keep scan confirmation/progress dialogs in `ProtectedTrustShellFrame`.
5. Admin shell:
   - After the authenticated trust shell is stable, convert `AdminSidebar.tsx` groups into a separate admin config and render through the shared sidebar with superadmin visibility preserved.
6. Verification sequence:
   - Run shared package checks.
   - Run `npm --prefix apps/RatAiFy run build:packages`.
   - Run `npm --prefix apps/RatAiFy run typecheck`.
   - Run `npm --prefix apps/RatAiFy run verify:sidebar`.
   - Run targeted nav tests, then `test:smoke:auth` where local demo/auth prerequisites are available.
   - Run `npm --prefix apps/RatAiFy run build` before considering the migration ready.

## RatAiFy Package Resolution Decision

Current resolution before this pass:
- `apps/RatAiFy/package.json` pointed `@xflow-ecosystem/ecosystem-assistant-ui` to `file:./packages/ecosystem-assistant-ui`.
- `apps/RatAiFy/tsconfig.json` pointed the package to `./packages/ecosystem-assistant-ui/src/index`.
- `apps/RatAiFy/vite.config.ts` pointed the package to `packages/ecosystem-assistant-ui/dist/index.js`.
- `apps/RatAiFy/package-lock.json` linked `node_modules/@xflow-ecosystem/ecosystem-assistant-ui` to `packages/ecosystem-assistant-ui`.
- The RatAiFy-local package is still assistant-bubble-only, so it cannot supply shared navigation shell exports.

Decision:
- RatAiFy now consumes the root shared package directly for `@xflow-ecosystem/ecosystem-assistant-ui`.
- `apps/RatAiFy/package.json` now uses `file:../../packages/ecosystem-assistant-ui`.
- `apps/RatAiFy/tsconfig.json` now resolves TypeScript imports to `../../packages/ecosystem-assistant-ui/src/index`.
- `apps/RatAiFy/vite.config.ts` now resolves runtime/build imports to `../../packages/ecosystem-assistant-ui/dist/index.js`.
- `apps/RatAiFy/package-lock.json` was aligned to the root package link shape.

Why this is safest:
- It avoids copying or forking the shared shell into RatAiFy app code.
- It keeps the shared shell implementation in one package, matching the WordGeni and XFlow direction.
- It makes RatAiFy import-safe for `NavigationShellStyles`, `SidebarNav`, and `MobileNavDrawer` without modifying backend, auth, database, API, payment, or business logic.

Install caveat:
- `npm --prefix apps/RatAiFy install --ignore-scripts --package-lock-only` failed with npm/arborist `Cannot read properties of undefined (reading 'spec')`. The lockfile was updated manually to match the root file dependency pattern already used by XFlow.
- `apps/RatAiFy/packages/ecosystem-assistant-ui` remains on disk and `build:packages` still builds it, but RatAiFy app imports now resolve to the root package through TypeScript and Vite. Removing the local package/build step should be a separate package-cleanup task.

## RatAiFy Shared Shell Migration Result

Files migrated or added:
- `apps/RatAiFy/client/src/components/layout/rataify-navigation-shell-config.tsx`
- `apps/RatAiFy/client/src/features/trustDashboard/components/RataifyTrustShell.tsx`
- `apps/RatAiFy/package.json`
- `apps/RatAiFy/package-lock.json`
- `apps/RatAiFy/tsconfig.json`
- `apps/RatAiFy/vite.config.ts`
- `apps/RatAiFy/tests/rataify-navigation-shell-config.node.test.ts`

Shared components used:
- `NavigationShellStyles`
- `SidebarNav`
- `MobileNavDrawer`

Behavior preserved:
- The active authenticated shell remains `ProtectedLayout` -> `ProtectedTrustShellFrame` -> `RataifyTrustShell`.
- Existing route groups remain sourced from `TRUST_SHELL_NAV_GROUPS` and filtered through `filterTrustShellNavGroups` / `canSeeAppNavPath`.
- Active matching remains delegated to `isTrustShellNavItemActive`.
- Issues and Sites badges are preserved.
- Disabled setup items remain disabled and carry setup semantics.
- External Community link remains external.
- Superadmin Control plane item remains superadmin-only.
- Selected-site selector, scan CTA, scan dialogs, billing card, demo mode handling, platform-admin card, and user footer remain RatAiFy-owned UI.
- Admin sidebar was not migrated in this pass; it remains a separate app-specific superadmin surface for a later admin-shell pass.

Known issues:
- Desktop collapse was not introduced for RatAiFy in this pass because the existing trust shell did not have desktop collapse. The manual QA collapse persistence item is not applicable until that behavior is deliberately added.
- `test:smoke:auth` timed out after five minutes in this workspace, so browser/auth smoke coverage still needs a local runtime session.
- The RatAiFy-local `packages/ecosystem-assistant-ui` package remains present and is still built by `build:packages`; it is no longer the app import target after the alias/dependency change.

Tests run:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck` - passed.
- `npm --prefix packages/ecosystem-assistant-ui test` - passed.
- `npm --prefix apps/RatAiFy run build:packages` - passed.
- `npm --prefix apps/RatAiFy run typecheck` - passed.
- `npm --prefix apps/RatAiFy run verify:sidebar` - passed.
- `npx --prefix apps/RatAiFy tsx --test tests/rataify-navigation-shell-config.node.test.ts tests/trust-shell-navigation.node.test.ts tests/navigation-access.node.test.ts tests/sidebar-routes-sync.node.test.ts` - passed.
- `npm --prefix apps/RatAiFy run build` - passed.
- `npm --prefix apps/RatAiFy run test:smoke:auth` - timed out after five minutes.

## RatAiFy Manual QA Checklist

- [ ] Desktop expanded sidebar renders all visible configured sections.
- [ ] Desktop collapsed sidebar: not applicable until RatAiFy desktop collapse is intentionally added.
- [ ] Collapse preference persists: not applicable until RatAiFy desktop collapse is intentionally added.
- [ ] Mobile hamburger opens drawer.
- [ ] Route change closes drawer.
- [ ] Escape closes drawer.
- [ ] Backdrop closes drawer.
- [ ] Focus returns to hamburger.
- [ ] Active route highlighting works.
- [ ] Selected-site selector still works.
- [ ] Billing card still renders.
- [ ] Demo buttons still work where demo mode is active.
- [ ] Platform-admin card still respects role visibility.
- [ ] Admin sidebar visibility works.
- [ ] Account/logout remains reachable where available.
- [ ] No horizontal scroll.
- [ ] No hidden content under sidebar.
- [ ] No console errors.

## RatAiFy Stabilization Pass

Scope:
- RatAiFy only. No Crevux, Verixet, AudAiX, WordGeni, XFlow, backend, auth, database, API, payment, or business-logic changes were part of this pass.

Findings:
- No shared-shell regression requiring WordGeni or XFlow changes was found.
- RatAiFy still imports the root shared package through `file:../../packages/ecosystem-assistant-ui`, the TypeScript source alias, and the Vite dist alias.
- The active authenticated shell remains `ProtectedLayout` -> `ProtectedTrustShellFrame` -> `RataifyTrustShell`.
- RatAiFy-specific UI remains app-owned: selected-site selector, billing card, platform-admin card, demo banner/handling, scan CTA/dialogs, and user footer were not moved into the shared package.
- Desktop collapse remains intentionally not wired because RatAiFy's pre-migration trust shell did not support desktop collapse.
- The admin sidebar remains app-specific and was not migrated.

Stabilization test coverage added:
- Adapter preserves badges for Issues and Sites.
- Adapter preserves disabled setup semantics.
- Adapter preserves external Community link semantics.
- Adapter preserves existing active-route quirks for `/`, `/dashboard`, `/subscribe`, `/checkout`, `/billing/*`, `/settings`, and `/settings/*`.
- Normal user, workspace admin, and superadmin role visibility are covered through the existing RatAiFy role filter.
- Mobile and desktop configs use the same navigation sections.
- Selected-site, billing, platform-admin, scan CTA, and demo UI are asserted to remain outside the shared package.

Npm/arborist investigation:
- Node: `v22.18.0`.
- npm: `10.9.3`.
- RatAiFy lockfile: version 3.
- XFlow lockfile: version 3.
- All RatAiFy file dependency targets resolve to package.json files.
- All XFlow file dependency targets resolve to package.json files.
- `npm --prefix apps/RatAiFy install --ignore-scripts --package-lock-only --loglevel verbose` fails in npm/arborist at `@npmcli/arborist/lib/arborist/reify.js:updateNodes` with `Cannot read properties of undefined (reading 'spec')`.
- `npm --prefix apps/XFlow install --ignore-scripts --package-lock-only --loglevel verbose` fails at the same arborist location with the same error.
- Likely cause: an npm 10.9.3 arborist bug or incompatibility triggered by this repo's nested app-local and cross-repo `file:` dependency/link pattern, rather than a missing package target.
- Build impact: does not block `build:packages`, `typecheck`, `verify:sidebar`, targeted nav tests, or production builds.
- Safest cleanup plan: handle in a later dependency-maintenance pass by testing npm version changes and a consistent monorepo/file-dependency policy across XFlow and RatAiFy, then regenerate lockfiles once the package manager path is stable.

RatAiFy stabilization manual QA:
- [ ] Desktop expanded sidebar renders all visible configured sections.
- [ ] Desktop collapsed sidebar: not applicable until RatAiFy desktop collapse is intentionally added.
- [ ] Collapse preference persists: not applicable until RatAiFy desktop collapse is intentionally added.
- [ ] Mobile hamburger opens drawer.
- [ ] Route change closes drawer.
- [ ] Escape closes drawer.
- [ ] Backdrop closes drawer.
- [ ] Focus returns to hamburger.
- [ ] Active route highlighting works for Overview, Dashboard, Billing, Settings, and advanced routes.
- [ ] Disabled setup items do not navigate.
- [ ] External Community link opens correctly.
- [ ] Selected-site selector still works.
- [ ] Billing card still renders for non-platform admins.
- [ ] Demo buttons/handling still work where demo mode is active.
- [ ] Platform-admin card respects role visibility.
- [ ] Scan CTA/dialogs still work.
- [ ] Account/logout remains reachable where available.
- [ ] Admin sidebar still works as before even though it was not migrated.
- [ ] No horizontal scroll.
- [ ] No hidden content under sidebar.
- [ ] No console errors.

## Crevux Package Resolution And Migration Readiness Pass

Scope:
- Crevux active app only: `apps/CreVux/artifacts/image-gen`.
- Shared package change only where needed for Crevux route matching.
- No Verixet, AudAiX, WordGeni, XFlow, RatAiFy, backend, auth, database, API, payment, or business-logic changes were part of this pass.

Package resolution before this pass:
- `apps/CreVux/artifacts/image-gen/package.json` pointed `@xflow-ecosystem/ecosystem-assistant-ui` to `file:../../packages/ecosystem-assistant-ui`, which resolves to `apps/CreVux/packages/ecosystem-assistant-ui`.
- `apps/CreVux/artifacts/image-gen/tsconfig.json` pointed the package to `../../packages/ecosystem-assistant-ui/dist/index`, also the Crevux-local package.
- `apps/CreVux/artifacts/image-gen/vite.config.ts` pointed the package to `../../packages/ecosystem-assistant-ui/dist/index.js`, also the Crevux-local package.
- The Crevux-local package is assistant-bubble-only and does not export the shared navigation shell.

Decision:
- Crevux now consumes the root shared package directly for `@xflow-ecosystem/ecosystem-assistant-ui`.
- `apps/CreVux/artifacts/image-gen/package.json` now uses `file:../../../../packages/ecosystem-assistant-ui`.
- `apps/CreVux/artifacts/image-gen/tsconfig.json` now resolves TypeScript imports to `../../../../packages/ecosystem-assistant-ui/dist/index`.
- `apps/CreVux/artifacts/image-gen/vite.config.ts` now resolves runtime/build imports to `../../../../packages/ecosystem-assistant-ui/dist/index.js`.
- `apps/CreVux/artifacts/image-gen/vitest.config.ts` now resolves tests to `../../../../packages/ecosystem-assistant-ui/src/index.tsx`.
- `apps/CreVux/pnpm-lock.yaml` was aligned to the root package file dependency. A pnpm lock refresh briefly changed unrelated Vitest snapshot entries; those were trimmed so the lockfile diff stays limited to the shared UI dependency path.

Shared package adjustment:
- `isNavigationItemActive` now passes the raw `currentPath` into app-provided `NavItemConfig.isActive` matchers.
- Default shared matching still normalizes path/query/hash for built-in exact/prefix/child matching.
- This is required for Crevux because routes such as `/app/create?view=animate` and `/app/create?view=storyboards` share the same pathname but represent different primary nav items.

Readiness adapter added:
- `apps/CreVux/artifacts/image-gen/src/components/layout/crevux-navigation-shell-config.tsx` converts existing Crevux route/nav constants into shared `NavigationShellConfig` and `NavSectionConfig` values.
- Existing source of truth remains `src/lib/crevuxAppNavigation.ts`, `src/lib/crevuxAppPaths.ts`, `src/lib/studioAppPaths.ts`, and `src/lib/proSettings.ts`.
- Existing app routes included: dashboard, create subviews, studio, WordGeni, API, builders, exports, upgrade, pro settings, account security, internal studio, internal ops, and admin dashboard.
- Detached media popout route `/app/popout` is intentionally excluded.
- Internal studio route remains behind `canAccessInternalStudio`.
- Internal ops and admin dashboard routes remain behind `canAccessAdminDashboard`.

Migration decision:
- The live Crevux shell was not wired to shared renderers in this pass.
- Reason: active product navigation is distributed across `AppShell.tsx`, `CrevuxAppHeader.tsx`, `CrevuxUniversalMobileMenu.tsx`, the dashboard mobile dock, and studio/create tool rails. `CrevuxAppHeader.tsx` also owns credits, density controls, billing/account menus, admin links, Site Wiki, mode switching, and studio mobile controls.
- A renderer migration should now use the new adapter, but should be a separate UI pass that replaces or composes the existing header/mobile surfaces without duplicating controls or hiding studio tool rails.
- `AdminDashboardPage.tsx` internal sidebar and `CreateSidebar.tsx` studio tool rail remain app-specific surfaces for now.

Tests run:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck` - passed.
- `npm --prefix packages/ecosystem-assistant-ui test` - passed, 8 shared navigation tests.
- `pnpm -C apps/CreVux/artifacts/image-gen exec vitest run --config vitest.config.ts src/components/layout/crevux-navigation-shell-config.test.tsx` - passed, 3 adapter tests.
- `pnpm -C apps/CreVux/artifacts/image-gen run test:unit` - passed, 29 files / 92 tests.
- `pnpm -C apps/CreVux/artifacts/image-gen run typecheck` - passed.
- `pnpm -C apps/CreVux/artifacts/image-gen run build` - passed, including `verify-react-query-singleton-bundle`.

Warnings observed:
- `pnpm -C apps/CreVux install --lockfile-only --ignore-scripts --filter image-gen` reported existing peer dependency warnings under `artifacts/api-server` for TensorFlow packages and `esbuild-plugin-pino`. These warnings were not introduced by the navigation changes.
- Vitest prints the existing warning that both esbuild and oxc options are set and oxc options are used.

Crevux migration QA checklist for the next UI wiring pass:
- [ ] Shared sidebar renders only authenticated app/studio routes.
- [ ] Detached media popout remains outside the shell.
- [ ] Public marketing/auth routes remain outside the shell.
- [ ] `/app/create?view=*` active states distinguish Create, Video, Storyboards, Projects, Gallery, History, and 3D Mesh.
- [ ] Internal Studio appears only for internal-studio roles.
- [ ] Ops and Admin Dashboard appear only for admin-dashboard roles.
- [ ] Credits, density controls, billing portal, account menu, logout, Site Wiki, and mode switch remain reachable.
- [ ] Create/studio tool rails remain app-owned and are not hidden by the primary nav.
- [ ] Mobile drawer close paths, focus return, and body-scroll lock come from the shared shell.
- [ ] No duplicate mobile menu/dock controls after replacing `CrevuxUniversalMobileMenu`.
- [ ] No horizontal scroll, hidden content, or nav console errors.

## Crevux UI Wiring Pass

Scope:
- Crevux active app only: `apps/CreVux/artifacts/image-gen`.
- Shared package checks were run, but no new shared package code changes were needed in this pass.
- No Verixet, AudAiX, WordGeni, XFlow, RatAiFy, backend, auth, database, API, payment, or business-logic changes were part of this pass.

Live shell composition findings:
- `src/components/AppShell.tsx` remains an auth/content/provider wrapper with SiteWiki, display preferences, skip link, overflow safety, and optional Copilot. It is not the safest first nav insertion point.
- `src/components/dashboard/CrevuxAppHeader.tsx` renders the active desktop dashboard primary nav, studio desktop nav/dropdowns, compact mobile menu trigger, dashboard mobile dock, credits, density controls, Site Wiki, billing/pro controls, account menu, logout, admin links, and mode switching.
- `src/components/dashboard/CrevuxUniversalMobileMenu.tsx` renders the current mobile dropdown menu and should remain untouched until a separate mobile drawer pass.
- `src/features/create-home/components/CreateSidebar.tsx` and studio responsive/tool components remain app-specific tool rails, not primary product navigation.
- `src/pages/AdminDashboardPage.tsx` owns an admin/internal sidebar surface and remains app-specific.

Live wiring decision:
- Wired only the dashboard desktop primary nav inside `CrevuxAppHeader.tsx`.
- The insertion point is the existing `renderDesktopPrimaryNav()` dashboard branch, which already renders authenticated desktop primary links.
- The studio desktop branch remains on existing dropdown/pill rendering because it has storyboard dropdown behavior and studio-specific controls.
- The mobile menu and dashboard mobile dock remain unchanged.
- Risk level: low-to-moderate. The change is isolated to dashboard desktop primary nav rendering, but it adapts the vertical shared `SidebarNav` styles into a horizontal header slot with scoped CSS.

Files changed for UI wiring:
- `apps/CreVux/artifacts/image-gen/src/components/dashboard/CrevuxAppHeader.tsx`
- `apps/CreVux/artifacts/image-gen/src/components/dashboard/CrevuxAppHeader.shared-nav.test.ts`
- `apps/CreVux/artifacts/image-gen/src/components/layout/crevux-navigation-shell-config.tsx`
- `apps/CreVux/artifacts/image-gen/src/components/layout/crevux-navigation-shell-config.test.tsx`

Shared components used:
- `NavigationShellStyles`
- `SidebarNav`

Routes included in the wired dashboard desktop primary nav:
- `/app`
- `/app/create?view=projects`
- `/app/create?view=gallery`
- `/app/create?view=assets`
- `/app/create#source-enhance`
- `/app/exports`
- `/app/create?view=history`

Routes excluded from this wired desktop-primary surface:
- Detached media popout `/app/popout`.
- Public marketing/auth routes.
- Studio dropdown-only routes and internal/admin routes, which remain available through existing studio/account/admin surfaces and route gates.
- Account/security, pro settings, API, builders, billing, credits, and logout controls remain in the existing account/action menus rather than the dashboard primary nav.

Behavior preserved:
- Existing AppShell layout.
- Existing CrevuxAppHeader action area.
- Credits ledger/control.
- Billing/pro controls.
- Account menu and logout.
- Density controls.
- Site Wiki entry.
- Studio command bars and storyboard dropdown behavior.
- Create/studio tool rails.
- Admin/internal route gates.
- Dashboard mobile dock.
- Universal mobile dropdown menu.
- Detached media popout remains outside AppShell and outside shared nav.

Mobile drawer decision:
- Mobile was not wired in this pass.
- Reason: `CrevuxUniversalMobileMenu` also owns density controls, Site Wiki, billing, account/logout, admin links, current studio controls, internal/public mode switching, and notification badge behavior. Replacing it safely requires a separate pass that preserves those slots while avoiding duplication with the mobile dock and studio mobile controls.

Tests run:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck` - passed.
- `npm --prefix packages/ecosystem-assistant-ui test` - passed, 8 shared navigation tests.
- `pnpm -C apps/CreVux/artifacts/image-gen exec vitest run --config vitest.config.ts src/components/layout/crevux-navigation-shell-config.test.tsx src/components/dashboard/CrevuxAppHeader.shared-nav.test.ts` - passed, 7 focused tests.
- `pnpm -C apps/CreVux/artifacts/image-gen run test:unit` - passed, 30 files / 96 tests.
- `pnpm -C apps/CreVux/artifacts/image-gen run typecheck` - passed.
- `pnpm -C apps/CreVux/artifacts/image-gen run build` - passed, including `verify-react-query-singleton-bundle`.

Warnings observed:
- Vitest continues to print the existing warning that both esbuild and oxc options are set and oxc options are used.
- The build completed successfully and reported normal plugin timing diagnostics.

Crevux manual QA checklist:
- [ ] Desktop dashboard primary nav renders once, not duplicated.
- [ ] Desktop dashboard active route highlights correctly.
- [ ] Query/hash routes highlight correctly for Projects, Gallery, Assets, Enhance, Exports, and Workflows.
- [ ] `/app` dashboard nav works.
- [ ] API/builders nav remains reachable through the existing account/action menus.
- [ ] Account/security nav remains reachable where already exposed.
- [ ] Pro settings nav remains reachable.
- [ ] Admin nav only appears where existing gates allow.
- [ ] Detached media popouts remain outside shell navigation.
- [ ] Credits still render.
- [ ] Billing/pro controls still render.
- [ ] Account menu still works.
- [ ] Density controls still work.
- [ ] Studio desktop nav/dropdowns still work.
- [ ] Studio tool rails still work.
- [ ] Mobile dock still works.
- [ ] Mobile menu still works unchanged.
- [ ] No horizontal scroll.
- [ ] No content hidden under sidebar/header.
- [ ] No console errors.

Next Crevux step:
- Crevux is ready for a stabilization/manual-QA pass for the dashboard desktop primary nav.
- Mobile drawer migration should remain a separate wiring pass after slot mapping for density, billing, account, Site Wiki, current studio controls, internal/public mode switching, and notification behavior.

## Crevux Desktop Nav Stabilization

Scope:
- Crevux dashboard desktop primary nav only.
- No mobile drawer migration, AppShell rewrite, studio tool rail rewrite, backend/auth/database/API/payment/business-logic changes, or new routes were part of this pass.
- No WordGeni, XFlow, RatAiFy, Verixet, or AudAiX files were changed.

Regressions found:
- Desktop-primary active matching for create subviews was too exact for query-string routes. `/app/create?view=projects` matched, but routes with additional query parameters could miss the active state.
- The Enhance hash route needed explicit hash-aware matching so it does not depend on broad string-prefix behavior.

Regressions fixed:
- `createCrevuxDesktopPrimaryNavigationShellConfig()` now uses URL parsing for dashboard desktop primary create-view items.
- Projects, Gallery, Assets, and Workflows now match by `view` query parameter even when additional query/hash data is present.
- Enhance now matches by pathname plus `#source-enhance`.
- Existing `/app` and `/app/exports` matching remains unchanged.

Files changed in this stabilization pass:
- `apps/CreVux/artifacts/image-gen/src/components/layout/crevux-navigation-shell-config.tsx`
- `apps/CreVux/artifacts/image-gen/src/components/layout/crevux-navigation-shell-config.test.tsx`
- `apps/CreVux/artifacts/image-gen/src/components/dashboard/CrevuxAppHeader.shared-nav.test.ts`
- `docs/navigation-shell-audit.md`

Tests added or expanded:
- Verified dashboard desktop nav has exactly one shared nav marker in `CrevuxAppHeader.tsx`.
- Verified the wired desktop-primary route list is exactly `/app`, `/app/create?view=projects`, `/app/create?view=gallery`, `/app/create?view=assets`, `/app/create#source-enhance`, `/app/exports`, and `/app/create?view=history`.
- Verified detached popout, admin, internal, pro, account-security, API, and builder routes remain outside this desktop-primary nav.
- Verified query/hash active matching for Projects, Gallery, Assets, Enhance, Exports, and Workflows, including additional query/hash data.
- Verified studio, mobile menu, mobile dock, account, credits, billing, API, builders, and pro settings code paths remain local to the existing header/menu surfaces.

Exact routes verified:
- `/app`
- `/app/create?view=projects`
- `/app/create?view=projects&board=7`
- `/app/create?view=gallery`
- `/app/create?view=assets`
- `/app/create?view=assets#reuse`
- `/app/create#source-enhance`
- `/app/exports`
- `/app/create?view=history`
- `/app/create?view=history&job=queued`

Surfaces deliberately left untouched:
- `AppShell.tsx`
- `CrevuxUniversalMobileMenu.tsx`
- Dashboard mobile dock
- Studio desktop dropdown nav
- Studio mobile controls
- Create/studio tool rails
- Account menu and logout
- Credits ledger/control
- Billing/pro controls
- Density controls
- Site Wiki control
- Admin/internal gates
- Detached media popout route

Tests run:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck` - passed.
- `npm --prefix packages/ecosystem-assistant-ui test` - passed, 8 shared navigation tests.
- `pnpm -C apps/CreVux/artifacts/image-gen exec vitest run --config vitest.config.ts src/components/dashboard/CrevuxAppHeader.shared-nav.test.ts src/components/layout/crevux-navigation-shell-config.test.tsx` - passed, 10 focused tests.
- `pnpm -C apps/CreVux/artifacts/image-gen run test:unit` - passed, 30 files / 99 tests.
- `pnpm -C apps/CreVux/artifacts/image-gen run typecheck` - passed.
- `pnpm -C apps/CreVux/artifacts/image-gen run build` - passed, including `verify-react-query-singleton-bundle`.

Warnings observed:
- Vitest continues to print the existing warning that both esbuild and oxc options are set and oxc options are used.
- Build completed successfully and reported plugin timing diagnostics.

Manual QA checklist:
- [ ] Dashboard desktop nav renders once.
- [ ] Dashboard desktop nav spacing looks correct.
- [ ] Active route highlights correctly for `/app`.
- [ ] Active route highlights correctly for Projects, Gallery, and Assets views.
- [ ] Active route highlights correctly for Enhance hash route.
- [ ] Active route highlights correctly for Exports.
- [ ] Active route highlights correctly for Workflows/History.
- [ ] Route clicks preserve query/hash destinations.
- [ ] Credits still render.
- [ ] Billing/pro controls still render.
- [ ] Account menu still works.
- [ ] Density controls still work.
- [ ] Admin gates are unchanged.
- [ ] Studio nav still behaves like before.
- [ ] Mobile menu and dock are unchanged.
- [ ] No horizontal scroll.
- [ ] No content hidden under header/nav.
- [ ] No console errors.

Next Crevux step:
- Crevux desktop dashboard nav is stable enough for manual QA.
- After manual QA, the next implementation step should be a separate mobile drawer readiness pass, not a continuation of this desktop stabilization pass.

## Crevux Mobile Drawer Readiness

Scope:
- Audit/readiness only for Crevux mobile navigation.
- No mobile drawer wiring, AppShell rewrite, backend/auth/database/API/payment/business-logic changes, or new routes were part of this pass.
- No WordGeni, XFlow, RatAiFy, Verixet, or AudAiX files were changed.

Current mobile components found:
- `apps/CreVux/artifacts/image-gen/src/components/dashboard/CrevuxUniversalMobileMenu.tsx` renders the current compact/mobile menu as a Radix dropdown.
- `apps/CreVux/artifacts/image-gen/src/components/dashboard/CrevuxAppHeader.tsx` opens `CrevuxUniversalMobileMenu` from compact dashboard/studio header states through `renderCompactActionsMenu()`.
- `CrevuxAppHeader.tsx` also renders `renderVideoStudioMobileMenu()` for video-studio mobile shortcuts.
- `CrevuxAppHeader.tsx` renders the dashboard mobile dock through `renderDashboardMobileDock()` and `CREVUX_MOBILE_DOCK_NAV_KEYS`.
- `apps/CreVux/artifacts/image-gen/src/components/studio/responsive/MobileStepHeader.tsx` also mounts `CrevuxUniversalMobileMenu`.
- `apps/CreVux/artifacts/image-gen/src/components/video-studio/shell/VideoStudioMobileBottomBar.tsx` and `VideoStudioMobileDockDrawer.tsx` provide separate video-studio mobile controls.
- `apps/CreVux/artifacts/image-gen/src/features/create-home/components/CreateSidebar.tsx` remains an app-specific create/studio tool rail.

Controls that must remain local:
- Density picker and platform zoom controls.
- Credits button and credits ledger dialog.
- Billing portal and upgrade controls.
- Account menu and logout.
- Site Wiki entry.
- Notification badge and workflow shortcut.
- Current studio controls trigger.
- Video studio mobile shortcuts.
- Dashboard mobile dock.
- Public/internal mode switching.
- Admin dashboard and internal ops links.
- Studio/create tool rails and storyboard controls.

Shared `MobileNavDrawer` fit assessment:
- Fits route rendering through `NavigationShellConfig`, `SidebarNav`, app-specific active matching, role visibility, disabled/external semantics, `renderLink`, and `currentPath`.
- Fits expected accessibility behavior for Escape close, backdrop close, route-change close, body scroll lock, initial drawer focus, and focus return to trigger.
- Has useful slots through `drawerIntro`, `accountFooter`, `userCard`, `workspaceCard`, `primaryAction`, and `quickAction`.
- Does not currently model all Crevux mobile regions as first-class areas: density grid, zoom slider, credits dialog launcher, billing portal action, Site Wiki action, notification badge, current studio controls, public/internal switch, and grouped account/logout actions would need local slot composition.
- The current Radix dropdown menu handles focus/keyboard behavior through Radix, but it is not equivalent to the shared drawer's body-scroll-lock and route-change-close behavior.

Readiness decision:
- Partial readiness.
- The shared drawer can render the route list safely, but a full mobile migration is not yet a safe one-surface swap because Crevux mobile navigation is also the control surface for account, billing, density, Site Wiki, admin/internal links, studio controls, notifications, and mode switching.
- Mobile should not be wired until those app-owned controls are mapped into explicit local drawer slots and the interaction with the existing mobile dock is verified.

Exact blockers:
- `CrevuxUniversalMobileMenu` is not only navigation; it is also an account/settings/control menu.
- The shared drawer has one `drawerIntro` plus shell slots, but Crevux needs multiple local regions with different grouping and actions.
- The dashboard mobile dock already provides primary route shortcuts, so a drawer migration must avoid duplicate or competing mobile primary nav.
- Studio routes have separate mobile controls and video-studio drawer behavior that must remain untouched.
- Billing, credits, density, and Site Wiki actions are callbacks/components, not plain nav config items.
- Existing dropdown behavior does not currently expose an app-owned route-change close hook to compare against the shared drawer without a browser QA pass.

Safest future migration sequence:
1. Add a Crevux-local `CrevuxMobileNavigationDrawer` wrapper component without removing `CrevuxUniversalMobileMenu`.
2. Use the existing `createCrevuxNavigationShellConfig()` route sections for the drawer route list, keeping `/app/popout` excluded and admin/internal visibility gated.
3. Compose local slots for account identity, credits, billing/upgrade, Site Wiki, density/zoom, mode switch, current studio controls, admin/internal links, and logout.
4. Keep dashboard mobile dock and video-studio mobile controls unchanged.
5. Add a feature-local test that asserts route config, gated items, excluded popout, and local control labels remain present in the wrapper.
6. Swap `CrevuxAppHeader.renderCompactActionsMenu()` to the wrapper only after the wrapper can preserve all current menu controls.
7. Browser QA mobile close paths: route change, Escape, backdrop, close button, body scroll unlock, and focus return to hamburger.
8. Only after dashboard mobile QA passes, evaluate whether `MobileStepHeader` can use the same wrapper.

Likely files for a future mobile wiring pass:
- `apps/CreVux/artifacts/image-gen/src/components/dashboard/CrevuxUniversalMobileMenu.tsx`
- `apps/CreVux/artifacts/image-gen/src/components/dashboard/CrevuxAppHeader.tsx`
- `apps/CreVux/artifacts/image-gen/src/components/layout/crevux-navigation-shell-config.tsx`
- A new local wrapper such as `apps/CreVux/artifacts/image-gen/src/components/dashboard/CrevuxMobileNavigationDrawer.tsx`
- Focused tests near the wrapper and existing nav config tests.

Tests added or updated:
- No tests were added in this pass because no runtime/config code changed.
- Existing Crevux config tests already cover popout exclusion, admin/internal gating, and query/hash active matching for shared navigation candidates.

Verification run:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck` - passed.
- `npm --prefix packages/ecosystem-assistant-ui test` - passed, 8 shared navigation tests.
- Full Crevux runtime checks were not required because only documentation changed.

Future mobile QA checklist:
- [ ] Hamburger opens drawer.
- [ ] Route change closes drawer.
- [ ] Escape closes drawer.
- [ ] Backdrop closes drawer.
- [ ] Focus returns to hamburger.
- [ ] Body scroll unlocks after close.
- [ ] Mobile dock still works.
- [ ] Studio controls still work.
- [ ] Credits still visible/reachable.
- [ ] Billing/pro controls still reachable.
- [ ] Account/logout reachable.
- [ ] Notifications still reachable.
- [ ] Site Wiki/help still reachable.
- [ ] Admin links only visible when gate allows.
- [ ] Public/internal mode switching still works.
- [ ] Query/hash route active states correct.
- [ ] No duplicate nav.
- [ ] No hidden content.
- [ ] No horizontal scroll.
- [ ] No console errors.

Recommendation:
- Do not proceed directly with Crevux mobile wiring until a local wrapper/slot plan is implemented and reviewed.
- It is reasonable to move to Verixet/AudAiX readiness next while Crevux mobile remains in partial-readiness state.

## Verixet And AudAiX Readiness Audit

Scope:
- Audit/readiness only for Verixet and AudAiX.
- No Verixet or AudAiX runtime migration was performed.
- No WordGeni, XFlow, RatAiFy, or Crevux runtime files were changed.
- No backend, auth, database, API, payment, business-logic, or route-invention changes were part of this pass.

Shared package gate:
- Both apps still resolve `@xflow-ecosystem/ecosystem-assistant-ui` through app-local package copies that export only assistant bubble UI.
- `apps/Verixet/packages/ecosystem-assistant-ui/src/index.tsx` does not include the shared navigation shell exports.
- `apps/AudAix/packages/ecosystem-assistant-ui/src/index.tsx` does not include the shared navigation shell exports.
- This blocks safe runtime migration for both apps until package resolution is cleaned up or the app-local package copies are deliberately synchronized.

### Verixet Readiness

Package resolution findings:
- `apps/Verixet/package.json` declares `@xflow-ecosystem/ecosystem-assistant-ui` as `file:./packages/ecosystem-assistant-ui`.
- `apps/Verixet/package-lock.json` resolves the package to `packages/ecosystem-assistant-ui`.
- `apps/Verixet/tsconfig.json` maps `@xflow-ecosystem/ecosystem-assistant-ui` to `./packages/ecosystem-assistant-ui/dist/index`.
- `apps/Verixet/next.config.ts` does not currently provide a root-package alias for the shared UI package.
- Safest next step: a Verixet package-resolution cleanup pass should either point TypeScript, Next, and package metadata at the root shared package or synchronize the Verixet-local package copy. Do this before importing `NavigationShellStyles`, `SidebarNav`, `MobileNavDrawer`, or shared shell types.

Primary shell surfaces:
- `apps/Verixet/src/app/dashboard/(main)/layout.tsx` composes the dashboard shell. It passes `DashboardShellNav` into `AppShell.sidebar` and `TopCommandBar` into `AppShell.commandBar`.
- `apps/Verixet/src/components/dashboard/AppShell.tsx` owns the desktop sidebar region, mobile hamburger, backdrop drawer, command-bar slot, and `#dashboard-main` content landmark.
- `apps/Verixet/src/components/dashboard/DashboardShellNav.tsx` owns hardcoded `SIDEBAR_GROUPS`, workspace-admin filtering, platform-operator additions, account/workspace metadata, route prefetching, and active matching.
- `apps/Verixet/src/components/dashboard/xflow-app-command/AppContextSidebar.tsx` is contextual per-app subnavigation and should stay app-specific.
- `apps/Verixet/src/lib/dashboard/dashboard-top-nav.ts` is a separate product-style top-nav source with its own section-first active matching and should not be merged into the primary sidebar migration unless a later pass intentionally unifies top navigation.

Route and behavior to preserve:
- `sidebarItemIsActive()` has a deliberate `/dashboard/xflow` special case. It treats `/dashboard/connect`, `/dashboard/apps`, `/dashboard/integration-readiness`, and most nested `/dashboard/xflow/*` routes as active for Integrations, but excludes `/dashboard/xflow/issues`.
- `/dashboard` remains exact-match only.
- Workspace-admin-only items must continue to hide for regular workspace users.
- Platform-operator items must continue to appear only for platform operators.
- `data-testid="dashboard-nav-integrations"` and `data-testid="dashboard-nav-integration-center"` are covered by existing tests and should be preserved through shared `dataAttributes`.
- `TopCommandBar`, `DashboardWelcomeModal`, `EcosystemAccessRequired`, `EcosystemAssistantBubbleMount`, `DashboardHelpLegalStrip`, and `VeraThinkingProvider` remain outside shared navigation and should not move.

Mobile/accessibility gap:
- Current `AppShell` closes via backdrop but does not fully implement route-change close, Escape close, body-scroll lock, focus movement into the drawer, or focus return to the hamburger.
- The shared `MobileNavDrawer` fits this gap after package resolution, but it should be introduced as a shell-only replacement for the current drawer behavior while keeping the command bar and content layout intact.

Tests already available:
- `apps/Verixet/src/components/dashboard/DashboardNav.test.tsx` covers grouped destinations, workspace-admin filtering, platform-operator additions, and active route quirks.
- `apps/Verixet/src/app/dashboard/dashboard-shell.test.ts` reads `DashboardShellNav.tsx` directly for route ownership assertions. A migration must update this test to read the new config source or keep the relevant route declarations parseable.
- Verixet scripts available in `apps/Verixet/package.json` include `typecheck`, `test`, `build`, `audit:dashboard`, `check:app-routes`, and dashboard e2e scripts. For a future migration pass, run at minimum `npm --prefix apps/Verixet run typecheck`, `npm --prefix apps/Verixet run test`, `npm --prefix apps/Verixet run build`, and the relevant dashboard route/audit script if package resolution is changed.

Recommended Verixet migration shape:
1. Complete package-resolution cleanup first.
2. Extract `SIDEBAR_GROUPS`, platform-operator additions, workspace-admin visibility, and `sidebarItemIsActive()` into a Verixet navigation config adapter, for example `apps/Verixet/src/components/dashboard/verixet-navigation-shell-config.tsx`.
3. Render the desktop nav through shared `NavigationShellStyles` and `SidebarNav`.
4. Replace only the mobile dashboard drawer behavior with `MobileNavDrawer`, preserving `TopCommandBar` and existing dashboard layout.
5. Keep `AppContextSidebar` app-specific.

Readiness decision:
- Partially ready after package resolution cleanup.
- Verixet is the safer first candidate between Verixet and AudAiX because its primary sidebar is concentrated in one component, existing tests already cover most route/role quirks, and `AppShell` already accepts sidebar and command-bar slots.
- Do not migrate Verixet in the same pass as package resolution unless the package change is small, verified, and shared package checks pass first.

### AudAiX Readiness

Package resolution findings:
- `apps/AudAix/dashboard/package.json` declares `@xflow-ecosystem/ecosystem-assistant-ui` as `file:../packages/ecosystem-assistant-ui`.
- `apps/AudAix/dashboard/tsconfig.json` and `apps/AudAix/dashboard/tsconfig.test.json` map `@xflow-ecosystem/ecosystem-assistant-ui` to `../packages/ecosystem-assistant-ui/dist/index`.
- `apps/AudAix/dashboard/vite.config.ts` aliases `@xflow-ecosystem/ecosystem-assistant-ui` to `../packages/ecosystem-assistant-ui/dist/index.js` and allows the app-local package in the Vite dev server file-system allowlist.
- Both root AudAiX and dashboard lockfiles exist, so dependency metadata changes need a dedicated package-resolution pass.
- Safest next step: synchronize the AudAiX-local package copy or deliberately repoint dashboard package metadata, TypeScript paths, Vite alias, and lockfiles to the root shared package in one package-resolution pass.

Primary shell surfaces:
- `apps/AudAix/dashboard/src/layout/AppShell.tsx` chooses marketing/sitewide navigation for unauthenticated or public routes, wraps authenticated studio routes with `AudAixStudioShell`, renders the access gate, and mounts the assistant bubble.
- `apps/AudAix/dashboard/src/layout/AudAixStudioShell.tsx` resolves viewer/workspace metadata, owns the workspace selector top bar, and renders `AudAixStudioSidebar`.
- `apps/AudAix/dashboard/src/components/navigation/AudAixStudioSidebar.tsx` owns hardcoded studio sidebar groups, nested module sections, workspace/account footer metadata, route/query active matching, and section navigation callbacks.
- `apps/AudAix/dashboard/src/components/navigation/SitewideNav.tsx` owns marketing and signed-in top navigation, public dropdowns, signed-in tabs, account/sign-out actions, ecosystem links, and a separate mobile drawer.
- `apps/AudAix/dashboard/src/features/auditDashboard/AuditDashboardCommandCenter.tsx` also imports `AudAixStudioSidebar`, so migration must account for this second sidebar mount before changing component contracts.

Route and behavior to preserve:
- Studio primary routes come from `appPaths` helpers, not raw route literals.
- Dashboard section items use query strings such as `/dashboard?section=dependencies`, `/dashboard?section=evidence`, `/dashboard?section=reports`, `/dashboard?section=activity`, `/dashboard?section=api-keys`, and `/dashboard?section=webhooks`.
- Tool-suite nested sections are query-driven: Architecture Scanner and Architecture Doctor use `?tab=...`, and ASO Audit uses its own tab query matching.
- `pathMatches()` normalizes studio paths and treats the portfolio home specially.
- Workspace-aware items such as workspace members, connections, and integration health must remain disabled or absent when no workspace is selected.
- Viewer display name, email, workspace name, role label, sites count, connection status, workspace selector, access gate, checkout actions, assistant bubble, and sitewide sign-in/sign-out flows remain app-owned slots or shell-adjacent logic.

Mobile/accessibility observations:
- `SitewideNav` already closes on path/search changes, closes on Escape, locks body scroll, and returns focus to the trigger. It does not need to be the first shared-shell target.
- The authenticated studio sidebar does not currently have an obvious shared mobile drawer insertion point in `AudAixStudioShell`; adding one requires a slot plan for workspace selector, account footer, nested tool sections, and possible duplicate `AudAixStudioSidebar` usage in `AuditDashboardCommandCenter`.

Tests already available:
- `apps/AudAix/dashboard/src/components/navigation/SitewideNav.test.ts` covers sitewide navigation structure.
- `apps/AudAix/dashboard/src/layout/AppShell.test.ts` covers workspace status and next-action helpers, not the full sidebar behavior.
- No focused `AudAixStudioSidebar` route/config test was found in this pass. Add one before migration to pin section/query active matching and nested tool subnav behavior.
- AudAiX dashboard scripts available in `apps/AudAix/dashboard/package.json` include `typecheck`, `typecheck:test`, `test`, and `build`. For a future migration pass, run at minimum `npm --prefix apps/AudAix/dashboard run typecheck`, `npm --prefix apps/AudAix/dashboard run test`, and `npm --prefix apps/AudAix/dashboard run build` after shared package checks.

Recommended AudAiX migration shape:
1. Complete package-resolution cleanup first.
2. Add focused tests for `AudAixStudioSidebar` config normalization, query/tab active matching, workspace-disabled items, nested tool sections, account footer metadata, and the second sidebar mount in `AuditDashboardCommandCenter`.
3. Extract the authenticated studio groups into an AudAiX navigation config adapter, for example `apps/AudAix/dashboard/src/components/navigation/audaix-navigation-shell-config.tsx`.
4. Keep `SitewideNav` unchanged until the authenticated studio shell is stable, because it has separate public marketing, ecosystem-link, auth, and mobile behavior.
5. Render only the authenticated studio primary navigation through the shared shell first, keeping workspace selector and tool-specific nested subnavs as app-owned slots where needed.

Readiness decision:
- Not ready for runtime migration in this pass.
- AudAiX needs package-resolution cleanup plus a test/config extraction pass before shared shell wiring.
- The first AudAiX migration target should be the authenticated studio sidebar, not `SitewideNav`.

### First Candidate Recommendation

- Migrate Verixet before AudAiX after package resolution cleanup.
- Rationale: Verixet has a single primary dashboard sidebar and clear existing tests for route and role behavior. AudAiX has multiple navigation surfaces, query-driven nested sections, a second sidebar consumer, and a public/sitewide nav that should remain independent until the studio shell is stable.
- Do not start either migration until the app imports the shared package version that contains `NavigationShellStyles`, `SidebarNav`, `MobileNavDrawer`, and the navigation config types.

## Verixet Package Resolution And Adapter Pass

Scope:
- Verixet package resolution, Verixet navigation config extraction, focused adapter tests, and documentation.
- No AudAiX migration was performed.
- No WordGeni, XFlow, RatAiFy, or Crevux runtime files were changed.
- No backend, auth, database, API, payment, business-logic, or invented-route changes were part of this pass.
- Live Verixet rendering was not switched to shared `SidebarNav` in this pass.

### Verixet Package Resolution Decision

Previous package resolution:
- `apps/Verixet/package.json` used `@xflow-ecosystem/ecosystem-assistant-ui` as `file:./packages/ecosystem-assistant-ui`.
- `apps/Verixet/package-lock.json` linked `node_modules/@xflow-ecosystem/ecosystem-assistant-ui` to `packages/ecosystem-assistant-ui`.
- `apps/Verixet/tsconfig.json` mapped `@xflow-ecosystem/ecosystem-assistant-ui` to `./packages/ecosystem-assistant-ui/dist/index`.
- The app-local package at `apps/Verixet/packages/ecosystem-assistant-ui` exported the assistant bubble only and did not include shared navigation shell exports.

Chosen fix:
- Verixet now resolves `@xflow-ecosystem/ecosystem-assistant-ui` to the root shared package at `../../packages/ecosystem-assistant-ui`.
- `apps/Verixet/package.json` and `apps/Verixet/package-lock.json` now point the dependency/link to `../../packages/ecosystem-assistant-ui`.
- `apps/Verixet/tsconfig.json` points the TypeScript path to `../../packages/ecosystem-assistant-ui/dist/index`.
- `apps/Verixet/next.config.ts` aliases webpack resolution to the root package dist file so runtime bundling does not fall back to the stale app-local symlink.
- `apps/Verixet/vitest.config.ts` aliases tests to the root package dist file.

Lockfile/install caveat:
- The lockfile was aligned manually to match the root file dependency pattern already used by XFlow.
- No package install was required for verification because TypeScript, Vitest, and Next all resolve through explicit root-package aliases.
- Future dependency installs should preserve the `file:../../packages/ecosystem-assistant-ui` link; if npm rewrites the lockfile, confirm `node_modules/@xflow-ecosystem/ecosystem-assistant-ui.resolved` remains `../../packages/ecosystem-assistant-ui`.

Migration readiness after cleanup:
- Verixet is import-safe for both existing assistant bubble exports and shared navigation shell types/components.
- `npm --prefix apps/Verixet run typecheck` passed after package cleanup.
- Runtime shared-shell wiring is ready for a separate live wiring pass, but was intentionally deferred until the adapter can be reviewed in isolation.

### Adapter Added

Files added or changed:
- `apps/Verixet/src/components/dashboard/verixet-navigation-shell-config.tsx`
- `apps/Verixet/src/components/dashboard/verixet-navigation-shell-config.test.tsx`
- `apps/Verixet/src/components/dashboard/DashboardShellNav.tsx`
- `apps/Verixet/src/components/dashboard/DashboardNav.test.tsx`
- `apps/Verixet/src/app/dashboard/dashboard-shell.test.ts`
- `apps/Verixet/src/app/dashboard/(main)/kyc-verification/page.test.ts`
- `apps/Verixet/src/app/dashboard/(main)/roles-permissions/page.test.ts`
- `apps/Verixet/scripts/audit-dashboard-routes.ts`
- `apps/Verixet/package.json`
- `apps/Verixet/package-lock.json`
- `apps/Verixet/tsconfig.json`
- `apps/Verixet/next.config.ts`
- `apps/Verixet/vitest.config.ts`

Adapter behavior:
- Extracts the existing Verixet dashboard sidebar groups into `VERIXET_DASHBOARD_SIDEBAR_GROUPS`.
- Exposes `getVerixetDashboardSidebarGroups()` for the current live renderer.
- Exposes `createVerixetNavigationSections()` and `createVerixetNavigationShellConfig()` for future shared-shell rendering.
- Preserves workspace-admin visibility through `workspaceAdminOnly` and shared `requiredRoles`.
- Preserves platform-operator routes as a `Superadmin` shared section gated by `platform-operator`.
- Preserves Verixet's `/dashboard/xflow` active-route quirk, including `/dashboard/apps`, `/dashboard/connect`, `/dashboard/integration-readiness`, and nested `/dashboard/xflow/*` routes except `/dashboard/xflow/issues`.
- Preserves `data-testid="dashboard-nav-integrations"` and `data-testid="dashboard-nav-integration-center"` through shared `dataAttributes`.
- Leaves command bars, workspace/account metadata, welcome modal, access gate, assistant bubble mount, and dashboard help/legal strip app-owned.

Routes included in the adapter:
- Base dashboard routes: `/dashboard`, `/dashboard/system-health`, `/dashboard/transactions`, `/dashboard/token-scanner`, `/dashboard/address-lookup`, `/dashboard/risk-engine`, `/dashboard/sanctions`, `/dashboard/reports`, `/dashboard/threats`, `/dashboard/alerts`, `/dashboard/wallet-monitor`, `/dashboard/payment-monitor`, `/dashboard/rules-automation`, `/dashboard/cases`, `/dashboard/evidence-vault`, `/dashboard/kyc-verification`, `/dashboard/support-tickets`, `/dashboard/announcements`, `/dashboard/configure`, `/dashboard/data-sources`, `/dashboard/xflow`, `/dashboard/keys`, `/dashboard/webhooks`, `/dashboard/roles-permissions`, `/dashboard/logs`, `/dashboard/audit`, `/dashboard/billing`, and `/dashboard/workspace`.
- Platform routes: `/dashboard/ecosystem`, `/dashboard/admin/plans-entitlements`, and `/dashboard/admin/billing-infrastructure`.

Routes excluded:
- No new routes were added.
- Contextual or redirect routes such as `/dashboard/apps`, `/dashboard/connect`, `/dashboard/integration-readiness`, `/dashboard/xflow/apps/[appId]`, and `/dashboard/xflow/issues` remain route/active-match behavior around the Integrations item rather than new primary sidebar entries.
- `AppContextSidebar` remains app-specific contextual subnavigation.

Tests added or updated:
- Added adapter tests for route mapping, no invented routes, workspace-admin visibility, platform-operator visibility, active-route quirks, `dataAttributes`, disabled/external/beta/badge absence, and app-owned slot preservation.
- Updated existing source-parsing tests and `audit-dashboard-routes.ts` to read `verixet-navigation-shell-config.tsx` as the navigation source of truth.
- `DashboardShellNav.tsx` now imports the adapter but keeps the existing renderer and CSS classes.

Verification run:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck` - passed.
- `npm --prefix packages/ecosystem-assistant-ui test` - passed, 8 shared navigation tests.
- `npm --prefix apps/Verixet run typecheck` - passed.
- `npm --prefix apps/Verixet test` - passed, 577 files passed / 3 skipped, 2125 tests passed / 26 skipped.
- `npm --prefix apps/Verixet run audit:dashboard` - passed, with no duplicate nav labels, no duplicate hrefs, no missing nav targets, no suspicious admin routes, and no platform nav routes missing platform guards.
- `npm --prefix apps/Verixet run build` - passed.

Warnings observed:
- Verixet build reported existing unused-variable warnings in unrelated files such as `TokenScannerDetailDrawer.tsx`, `TopCommandBar.tsx`, `TransactionsTable.tsx`, marketing home/footer files, dashboard transaction/risk helpers, workspace core, and XFlow helper files. These warnings were not introduced by the navigation adapter pass.

Live wiring decision:
- Deferred.
- Reason: the package resolution and adapter are now clean, but this pass intentionally avoided replacing the live sidebar renderer with shared `SidebarNav` so the config extraction can be reviewed and stabilized separately.
- A future live wiring pass should replace only the nav list renderer inside `DashboardShellNav.tsx` or the sidebar slot inside `AppShell.tsx`, keeping `TopCommandBar`, workspace/account metadata, mobile drawer behavior, access gates, and contextual `AppContextSidebar` local.

Manual QA checklist for the future live wiring pass:
- [ ] Desktop nav renders once.
- [ ] Active route highlighting works for exact dashboard routes.
- [ ] Integrations active state works for `/dashboard/xflow`, `/dashboard/apps`, `/dashboard/connect`, `/dashboard/integration-readiness`, and nested app routes.
- [ ] `/dashboard/xflow/issues` does not incorrectly activate the Integrations parent unless intended by the future renderer.
- [ ] Workspace-admin-only routes remain hidden from regular users.
- [ ] Platform-operator routes remain hidden from non-platform users.
- [ ] Command bar remains intact.
- [ ] Workspace/account metadata remains intact.
- [ ] Mobile behavior remains unchanged if mobile is not part of the wiring pass.
- [ ] `data-testid` hooks for Integrations and Integration Center remain present.
- [ ] No horizontal scroll.
- [ ] No content hidden under nav/header.
- [ ] No dashboard console errors.

Next recommendation:
- Verixet is ready for a live desktop-sidebar wiring pass or a short stabilization pass focused on rendering the extracted config through shared `SidebarNav`.
- Keep mobile drawer replacement separate unless the future pass explicitly targets mobile behavior and browser QA.

## Verixet Live Sidebar Wiring Pass

Scope:
- Verixet desktop/sidebar route-list renderer only.
- No Verixet shell rewrite, shared `AppShell` adoption, mobile drawer replacement, backend/auth/database/API/payment/business-logic change, or invented route was part of this pass.
- No WordGeni, XFlow, RatAiFy, Crevux, or AudAiX runtime files were changed.

Live wiring decision:
- Wired the live Verixet dashboard sidebar route list through the shared `SidebarNav`.
- The safe insertion point was `apps/Verixet/src/components/dashboard/DashboardShellNav.tsx`, inside the existing `ds-sidebar-nav__groups` region.
- Existing Verixet wrapper structure remains in place: brand header, account/workspace footer, route prefetch behavior, and the containing `nav.ds-sidebar-nav` are still app-owned.
- Full shared `AppShell` was not used because the current Verixet `AppShell` already owns desktop layout, mobile drawer state, command-bar slot, and main content landmarks.

Files changed:
- `apps/Verixet/src/components/dashboard/DashboardShellNav.tsx`
- `apps/Verixet/src/components/dashboard/DashboardNav.test.tsx`
- `apps/Verixet/src/app/dashboard/dashboard.css`
- `docs/navigation-shell-audit.md`

Shared components used:
- `NavigationShellStyles`
- `SidebarNav`
- `NavigationRenderLinkProps`

Routes included:
- The same adapter-backed Verixet dashboard routes documented in the package-resolution pass, including workspace-admin and platform-operator routes when their props are enabled.

Routes excluded:
- No new routes were added.
- `/dashboard/connect`, `/dashboard/apps`, `/dashboard/integration-readiness`, `/dashboard/xflow/apps/[appId]`, and `/dashboard/xflow/issues` remain active-match or contextual routes around the Integrations experience, not primary sidebar entries.
- Verixet `AppContextSidebar` remains app-specific contextual subnavigation.

Behavior preserved:
- `TopCommandBar` remains local to `apps/Verixet/src/app/dashboard/(main)/layout.tsx`.
- Workspace/account metadata remains local in `DashboardShellNav`.
- Platform-operator and workspace-admin visibility remains adapter-driven through shared role filtering.
- The `/dashboard/xflow` active-route quirk is preserved through the adapter's `isActive` callbacks.
- Existing `router.prefetch()` behavior remains local and uses the same visible group filtering.
- Mobile behavior remains unchanged and deferred. The current Verixet `AppShell` mobile drawer still owns its open/close behavior and renders the same sidebar component inside the drawer.
- The shared nav is styled through Verixet-scoped CSS under `ds-sidebar-nav__shared-shell` so the app shell layout is not redesigned.

Tests added or expanded:
- `DashboardNav.test.tsx` now asserts the shared renderer marker appears exactly once.
- It verifies the exact visible workspace-admin/platform route list and excludes integration-adjacent routes that are not primary sidebar entries.
- It verifies active route highlighting uses the shared `xflow-nav-shell__item--active` class.
- It verifies command, mobile drawer, workspace metadata, and account/footer surfaces remain local.

Known issues:
- The shared `NavigationShellStyles` injects CSS rules for mobile drawer classes even though this pass does not render `MobileNavDrawer`; tests assert no rendered dialog/mobile drawer markup is introduced.
- Build still reports existing unrelated unused-variable warnings in Verixet files outside this navigation pass.

Manual QA checklist:
- [ ] Desktop sidebar/nav renders once.
- [ ] Active route highlighting works for `/dashboard`.
- [ ] Active route highlighting works for `/dashboard/xflow` and its integration-adjacent active-match routes.
- [ ] `/dashboard/xflow/issues` is not incorrectly highlighted as the Integrations parent.
- [ ] Route clicks work.
- [ ] Workspace-admin-only routes are hidden for regular users.
- [ ] Platform-operator routes are hidden for non-platform users.
- [ ] Command bar remains intact.
- [ ] Workspace metadata remains intact.
- [ ] Account/user footer remains intact.
- [ ] Mobile drawer behavior is unchanged.
- [ ] No horizontal scroll.
- [ ] No content hidden behind sidebar/header.
- [ ] No dashboard console errors.

Next recommendation:
- Verixet is ready for a desktop sidebar stabilization/manual-QA pass.
- Mobile drawer migration should remain a separate pass if it is needed, because that affects Verixet `AppShell` behavior rather than only the route-list renderer.

## Verixet Desktop Sidebar Stabilization

Scope:
- Verixet desktop/sidebar shared-nav stabilization only.
- No mobile drawer migration, shell rewrite, command-bar rewrite, account/workspace footer rewrite, backend/auth/database/API/payment/business-logic change, or route addition was part of this pass.
- No WordGeni, XFlow, RatAiFy, Crevux, or AudAiX runtime files were changed.

Regressions found:
- No duplicate nav rendering, missing primary routes, role/admin visibility regression, active-route regression, or mobile drawer regression was found in the wired desktop sidebar.
- One stabilization gap was found: keyboard focus visibility for the embedded shared nav depended mostly on inherited/shared hover/focus styles. Verixet now has an explicit scoped focus ring for shared sidebar items.
- Local prefetch behavior remained in `DashboardShellNav`, but it was not pinned by focused tests after the renderer swap.

Regressions fixed:
- Added an explicit `:focus-visible` ring under `.ds-sidebar-nav__shared-shell .xflow-nav-shell__item:focus-visible`.
- Expanded focused tests to guard the local prefetch loop, shared renderer marker, exact visible route list, active state, scoped CSS, local command/account surfaces, and unchanged mobile-rendering boundary.

Files changed:
- `apps/Verixet/src/app/dashboard/dashboard.css`
- `apps/Verixet/src/components/dashboard/DashboardNav.test.tsx`
- `docs/navigation-shell-audit.md`

Tests added or updated:
- `DashboardNav.test.tsx` now checks the local `router.prefetch(href)` wrapper source still uses visible groups and de-duplicates hrefs.
- `DashboardNav.test.tsx` now checks shared-sidebar CSS remains scoped under `ds-sidebar-nav__shared-shell` and includes the explicit keyboard focus ring.
- Existing tests continue to assert one shared nav marker, exact route list, no invented primary integration-adjacent routes, active route highlighting, role/admin visibility, and local workspace/account/command/mobile boundaries.

Verification run:
- `npm --prefix apps/Verixet test -- src/components/dashboard/DashboardNav.test.tsx src/components/dashboard/verixet-navigation-shell-config.test.tsx src/app/dashboard/dashboard-shell.test.ts src/app/dashboard/(main)/kyc-verification/page.test.ts src/app/dashboard/(main)/roles-permissions/page.test.ts` - passed, 28 files / 150 tests.

Known issues:
- Full build warnings about unused variables remain in unrelated Verixet files and were not introduced by this navigation work.
- Mobile drawer behavior remains deferred by design.

Manual QA checklist:
- [ ] Desktop sidebar renders once.
- [ ] Route clicks work.
- [ ] Active route highlighting works for key dashboard routes.
- [ ] Integrations active-state quirk works for integration-adjacent routes.
- [ ] `/dashboard/xflow/issues` is not incorrectly highlighted as the Integrations parent.
- [ ] Admin/role visibility works.
- [ ] Keyboard focus is visible on sidebar links.
- [ ] Command bars still work.
- [ ] Workspace/account footer still works.
- [ ] Local prefetch behavior has no console errors.
- [ ] Mobile drawer behavior is unchanged.
- [ ] No duplicate nav.
- [ ] No horizontal scroll.
- [ ] No content hidden behind sidebar/header.
- [ ] No console errors.

Next recommendation:
- Verixet desktop sidebar is stable enough for manual QA.
- It is reasonable to move to AudAiX readiness/package-resolution work next while keeping Verixet mobile drawer migration deferred.

## AudAiX Package Resolution And Config Extraction Pass

Scope:
- AudAiX dashboard package resolution, authenticated studio sidebar config extraction, focused adapter tests, and documentation.
- No shared `AppShell` or `SidebarNav` live wiring was performed in this pass.
- No WordGeni, XFlow, RatAiFy, Crevux, or Verixet runtime files were changed.
- No backend, auth, database, API, payment, business-logic, or invented-route changes were part of this pass.

### AudAiX Package Resolution Decision

Previous package resolution:
- `apps/AudAix/dashboard/package.json` used `@xflow-ecosystem/ecosystem-assistant-ui` as `file:../packages/ecosystem-assistant-ui`, which resolved to `apps/AudAix/packages/ecosystem-assistant-ui`.
- `apps/AudAix/dashboard/package-lock.json` linked `node_modules/@xflow-ecosystem/ecosystem-assistant-ui` to `../packages/ecosystem-assistant-ui`.
- `apps/AudAix/dashboard/tsconfig.json`, `tsconfig.test.json`, and `vite.config.ts` pointed to the AudAiX-local package dist.
- The app-local package exported assistant UI only and did not include the shared navigation shell types/components.

Chosen fix:
- AudAiX dashboard now resolves `@xflow-ecosystem/ecosystem-assistant-ui` to the root shared package at `../../../packages/ecosystem-assistant-ui`.
- `apps/AudAix/dashboard/package.json` and `package-lock.json` now point the dependency/link to `../../../packages/ecosystem-assistant-ui`.
- `apps/AudAix/dashboard/tsconfig.json` and `tsconfig.test.json` point the TypeScript path to the root package dist index.
- `apps/AudAix/dashboard/vite.config.ts` aliases Vite resolution and server filesystem allow-list to the root shared package.

Lockfile/install caveat:
- The dashboard lockfile was aligned manually to match the root file dependency.
- Future dependency installs should preserve the `file:../../../packages/ecosystem-assistant-ui` link; if npm rewrites the lockfile, confirm `node_modules/@xflow-ecosystem/ecosystem-assistant-ui.resolved` remains `../../../packages/ecosystem-assistant-ui`.

### Adapter Added

Files added or changed:
- `apps/AudAix/dashboard/src/components/navigation/audaix-navigation-shell-config.tsx`
- `apps/AudAix/dashboard/src/components/navigation/audaix-navigation-shell-config.test.tsx`
- `apps/AudAix/dashboard/src/components/navigation/AudAixStudioSidebar.tsx`
- `apps/AudAix/dashboard/package.json`
- `apps/AudAix/dashboard/package-lock.json`
- `apps/AudAix/dashboard/tsconfig.json`
- `apps/AudAix/dashboard/tsconfig.test.json`
- `apps/AudAix/dashboard/vite.config.ts`
- `docs/navigation-shell-audit.md`

Adapter behavior:
- Extracts the existing authenticated studio sidebar groups into `createAudAixStudioSidebarGroups()` for the current live renderer.
- Exposes `createAudAixNavigationSections()` and `createAudAixNavigationShellConfig()` for future shared-shell rendering.
- Preserves AudAiX query-string dashboard section links such as `/dashboard?section=dependencies`, `/dashboard?section=evidence`, `/dashboard?section=api-keys`, and `/dashboard?section=webhooks`.
- Preserves nested tool tab destinations for Architecture Scanner, Architecture Doctor, and ASO Audit through shared `children` configs and active callbacks.
- Preserves workspace-dependent disabled behavior for Workspaces, Settings, and Integration Health when no workspace is selected.
- Leaves `SitewideNav`, workspace selector/topbar, account footer metadata, command/dashboard surfaces, and tool-specific content areas app-owned.

Routes included in the adapter:
- `/dashboard`
- `/dashboard/workspaces/:workspaceId/members`
- `/score-builder`
- `/dashboard?section=dependencies`
- `/dashboard/security`
- `/dashboard?section=evidence`
- `/dashboard?section=reports`
- `/dashboard?section=activity`
- `/dashboard/workspaces/:workspaceId/connections`
- `/system-health`
- `/dashboard?section=api-keys`
- `/dashboard?section=webhooks`
- `/project-architect` plus `?tab=scan`, `?tab=findings`, `?tab=history`, and `?tab=safety`
- `/architecture-doctor` plus `?tab=sources`, `?tab=findings`, `?tab=plans`, `?tab=validation`, `?tab=reports`, and `?tab=framework`
- `/tools/aso-audit` plus `?tab=lookup`, `?tab=scorecard`, `?tab=recommendations`, and `?tab=history`

Routes excluded:
- No new primary routes were added.
- JournOwl and 1ofaKindPiece were not added to AudAiX.
- Public/sitewide marketing routes remain in `SitewideNav`.
- Audit command-center and tool page internals remain app-specific.

Tests added:
- Adapter tests cover existing group labels/items, no invented routes, query-string active matching, nested tool child representation, nested tab active matching, workspace-disabled shared items, and app-owned slot preservation.

Live wiring decision:
- Deferred.
- Reason: this pass intentionally extracted and tested config while keeping the live `AudAixStudioSidebar` renderer intact. A later pass can replace only the route-list renderer or studio shell once the workspace selector, account footer, `AuditDashboardCommandCenter` sidebar mount, and nested tool subnav display rules have a precise slot plan.

Manual QA checklist for future live wiring:
- [ ] Desktop authenticated studio sidebar renders once.
- [ ] Query-section links route to the same dashboard sections.
- [ ] Dashboard section active state still follows `section` query params.
- [ ] Architecture Scanner nested tabs render and highlight correctly.
- [ ] Architecture Doctor nested tabs render and highlight correctly.
- [ ] ASO Audit nested tabs render and highlight correctly.
- [ ] Workspace-dependent routes are disabled without a workspace and enabled with a workspace.
- [ ] Workspace selector/topbar remains intact.
- [ ] Account/workspace metadata remains intact.
- [ ] `SitewideNav` mobile/public behavior remains unchanged.
- [ ] `AuditDashboardCommandCenter` sidebar usage remains functional.
- [ ] No duplicate nav.
- [ ] No horizontal scroll.
- [ ] No hidden content under shell.
- [ ] No dashboard console errors.

Next recommendation:
- Run shared package and AudAiX dashboard checks after this pass.
- If they pass, AudAiX is ready for a separate live studio-sidebar wiring pass focused on rendering the extracted config through the shared nav primitives.

## AudAiX Config Extraction Stabilization

Scope:
- AudAiX config extraction stabilization only.
- No live shared `SidebarNav` wiring, mobile drawer migration, shell rewrite, backend/auth/database/API/payment/business-logic change, or route addition was part of this pass.
- No WordGeni, XFlow, RatAiFy, Crevux, or Verixet runtime files were changed.

Regressions found:
- No route mismatch, missing group, duplicate group, role/admin visibility regression, mobile/sitewide boundary regression, or shared-package ownership regression was found in the extracted AudAiX config.
- One test gap was found: the first adapter tests did not pin the full route list, every query-section active case, live `AudAixStudioSidebar` rendering from the extracted config, or the local/conditional nested tool subnav behavior.

Regressions fixed:
- No runtime extraction fix was needed.
- Stabilization was test-only plus documentation. The existing studio sidebar renderer remains unchanged from the prior extraction pass and still consumes `createAudAixStudioSidebarGroups()`.

Files changed:
- `apps/AudAix/dashboard/src/components/navigation/audaix-navigation-shell-config.test.tsx`
- `docs/navigation-shell-audit.md`

Tests added or updated:
- Expanded `audaix-navigation-shell-config.test.tsx` from 5 to 10 focused tests.
- Added exact route-list assertions for the extracted studio sidebar groups.
- Added all query-section active matching cases for Dependencies, Evidence, Reports, Activity Logs, API Keys, and Webhooks.
- Added nested tool child href assertions for Architecture Scanner, Architecture Doctor, and ASO Audit.
- Added legacy alias active matching for `/dashboard/project-architect`, `/dashboard/architecture-doctor`, and `/dashboard/tools/aso-audit`.
- Added explicit assertions that the visible Admin / Developer group remains ungated because the old sidebar did not hide it by role.
- Added assertions that no external, beta, or hidden shared-shell items were introduced.
- Added a render test proving `AudAixStudioSidebar` renders from the extracted config while account/workspace metadata remains local.
- Added a render test proving nested tool subnavs remain local and conditional in the current sidebar renderer.
- Added a render test proving dashboard section callbacks remain local to the current sidebar.

Exact route groups verified:
- Command: `/dashboard`, `/dashboard/workspaces/workspace-1/members`, `/score-builder`
- Audit Readiness: `/dashboard?section=dependencies`, `/dashboard/security`, `/dashboard?section=evidence`, `/dashboard?section=reports`
- Operations: `/dashboard?section=activity`, `/dashboard/workspaces/workspace-1/connections`, `/system-health`
- Admin / Developer: `/dashboard?section=api-keys`, `/dashboard?section=webhooks`, `/dashboard/workspaces/workspace-1/connections`
- Audit Tool Suite: `/project-architect`, `/architecture-doctor`, `/tools/aso-audit`

Query-string sections verified:
- `dependencies`
- `evidence`
- `reports`
- `activity`
- `api-keys`
- `webhooks`

Nested tool subnav behavior verified:
- Shared-shell config metadata includes Architecture Scanner children: `/project-architect`, `/project-architect?tab=scan`, `/project-architect?tab=findings`, `/project-architect?tab=history`, `/project-architect?tab=safety`.
- Shared-shell config metadata includes Architecture Doctor children: `/architecture-doctor`, `/architecture-doctor?tab=sources`, `/architecture-doctor?tab=findings`, `/architecture-doctor?tab=plans`, `/architecture-doctor?tab=validation`, `/architecture-doctor?tab=reports`, `/architecture-doctor?tab=framework`.
- Shared-shell config metadata includes ASO Audit children: `/tools/aso-audit`, `/tools/aso-audit?tab=lookup`, `/tools/aso-audit?tab=scorecard`, `/tools/aso-audit?tab=recommendations`, `/tools/aso-audit?tab=history`.
- Current live `AudAixStudioSidebar` still renders nested subnavs only when the corresponding tool route is active.

Mobile/sitewide boundaries verified:
- `SitewideNav` remains untouched.
- Public and signed-in top/mobile navigation behavior remains app-owned.
- The shared config does not include mobile drawer state, sitewide links, command bars, account footer JSX, workspace cards, primary actions, or quick actions.

Known issues:
- The current studio sidebar still double-highlights Dashboard plus the matching query-section item on `/dashboard?section=...`, which matches pre-extraction behavior and was not changed.
- Workspace `Settings` and `Integration Health` intentionally point to the same workspace connections route, matching the old sidebar.
- Live shared `SidebarNav` wiring remains deferred.

Manual QA checklist:
- [ ] Studio sidebar renders the same groups as before.
- [ ] Query-section active states work for Dependencies, Evidence, Reports, Activity Logs, API Keys, and Webhooks.
- [ ] Nested Architecture Scanner subnav works.
- [ ] Nested Architecture Doctor subnav works.
- [ ] Nested ASO Audit subnav works.
- [ ] Route clicks work.
- [ ] Admin / Developer visibility matches current behavior.
- [ ] Command bars remain intact.
- [ ] Workspace/account metadata remains intact.
- [ ] Sitewide desktop/mobile behavior is unchanged.
- [ ] No duplicate nav.
- [ ] No invented routes.
- [ ] No horizontal scroll.
- [ ] No content hidden behind sidebar/header.
- [ ] No console errors.

Readiness decision:
- AudAiX config extraction is stable enough for a future live shared `SidebarNav` wiring pass.
- The next pass should still avoid mobile drawer replacement and should only replace the authenticated studio route-list renderer after a precise slot plan for workspace/account metadata, `AuditDashboardCommandCenter`, and conditional tool subnav display.

## AudAiX Live Sidebar Wiring

Scope:
- AudAiX authenticated studio/sidebar route-list renderer only.
- No full shared `AppShell`, mobile drawer migration, sitewide nav migration, command-bar rewrite, account/workspace footer rewrite, backend/auth/database/API/payment/business-logic change, or route addition was part of this pass.
- No WordGeni, XFlow, RatAiFy, Crevux, or Verixet runtime files were changed.

Insertion point used:
- The route-list loop inside `apps/AudAix/dashboard/src/components/navigation/AudAixStudioSidebar.tsx`.
- The outer `aside.audaix-sidebar`, brand header, local account/workspace footer, `Manage sites` callback, and AudAiX studio layout remain app-owned.
- The live route list is now wrapped in `data-testid="audaix-shared-sidebar-nav"` for regression tests.

Shared components used:
- `NavigationShellStyles`
- `SidebarNav`
- `NavigationRenderLinkProps`

Files changed:
- `packages/ecosystem-assistant-ui/src/index.tsx`
- `packages/ecosystem-assistant-ui/dist/index.js`
- `packages/ecosystem-assistant-ui/dist/index.d.ts`
- `apps/AudAix/dashboard/src/components/navigation/AudAixStudioSidebar.tsx`
- `apps/AudAix/dashboard/src/components/navigation/audaix-navigation-shell-config.tsx`
- `apps/AudAix/dashboard/src/components/navigation/audaix-navigation-shell-config.test.tsx`
- `apps/AudAix/dashboard/src/styles.css`
- `apps/AudAix/dashboard/vitest.config.ts`
- `docs/navigation-shell-audit.md`

Shared package fix:
- `packages/ecosystem-assistant-ui/src/index.tsx` now exports `./navigation-shell.js` explicitly so the built ESM index resolves navigation shell exports reliably in AudAiX's Vite/Vitest runtime.
- The shared package verification passed after this change.

AudAiX package/runtime resolution fix:
- `apps/AudAix/dashboard/vitest.config.ts` now aliases `@xflow-ecosystem/ecosystem-assistant-ui` to the root shared package dist index, matching the existing dashboard Vite build alias.
- This prevents Vitest from resolving the stale AudAiX-local package junction that does not include shared navigation shell exports.

Routes included:
- Command: `/dashboard`, `/dashboard/workspaces/workspace-1/members`, `/score-builder`
- Audit Readiness: `/dashboard?section=dependencies`, `/dashboard/security`, `/dashboard?section=evidence`, `/dashboard?section=reports`
- Operations: `/dashboard?section=activity`, `/dashboard/workspaces/workspace-1/connections`, `/system-health`
- Admin / Developer: `/dashboard?section=api-keys`, `/dashboard?section=webhooks`, `/dashboard/workspaces/workspace-1/connections`
- Audit Tool Suite: `/project-architect`, `/architecture-doctor`, `/tools/aso-audit`

Routes excluded:
- No new primary routes were added.
- JournOwl and 1ofaKindPiece were not added to AudAiX.
- Public/sitewide marketing routes remain in `SitewideNav`.
- Tool-internal and command-center panels remain app-specific.

Behavior preserved:
- `/dashboard?section=...` still highlights Dashboard plus the matching section item.
- `Settings` and `Integration Health` still both point to `/dashboard/workspaces/:workspaceId/connections`.
- The Admin / Developer group remains visible and ungated.
- Workspace-dependent routes remain disabled in shared config when no workspace is selected.
- Query-section click handling remains local: when `onSectionChange` is provided, dashboard section links prevent default and call the local callback.
- Account/workspace metadata remains local in `AudAixStudioSidebar`.
- `Manage sites` remains local and still routes/calls the `launchpad` section.
- `SitewideNav` and the sitewide mobile drawer remain untouched.

Nested tool subnav decision:
- The adapter still exposes Architecture Scanner, Architecture Doctor, and ASO Audit child metadata for future shared-shell work.
- The live `SidebarNav` receives `includeToolChildren: false` so the shared renderer does not render tool children unconditionally.
- Conditional nested tool subnav rendering remains AudAiX-local in `AudAixStudioSidebar`, preserving the old behavior where the subnav only appears on the active tool route.

CSS containment:
- Added AudAiX-scoped CSS under `.audaix-sidebar__shared-nav`.
- No shared package visual CSS was changed.
- Added a scoped focus-visible ring for shared sidebar links inside the AudAiX sidebar.

Tests added or updated:
- Expanded `audaix-navigation-shell-config.test.tsx` to cover the live shared renderer marker exactly once.
- Verified the exact live route list and no invented routes.
- Verified Dashboard plus matching query-section active state is preserved through shared `SidebarNav`.
- Verified nested tool subnavs remain local and conditional.
- Verified `Settings` and `Integration Health` still share the workspace connections route.
- Verified Admin / Developer visibility remains unchanged.
- Verified account/workspace metadata and section callbacks remain local.
- Verified `SitewideNav` does not import/use `SidebarNav` and mobile drawer source remains untouched.
- Verified AudAiX scoped CSS includes the shared-sidebar focus selector.

Verification:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck` - passed.
- `npm --prefix packages/ecosystem-assistant-ui test` - passed, 8 shared navigation tests.
- `npm --prefix apps/AudAix/dashboard run test -- src/components/navigation/audaix-navigation-shell-config.test.tsx` - passed, 13 focused tests.
- `npm --prefix apps/AudAix/dashboard run typecheck` - passed.
- `npm --prefix apps/AudAix/dashboard run test` - passed, 43 files / 227 tests.
- `npm --prefix apps/AudAix/dashboard run build` - passed.

Known issues:
- Manual browser QA is still needed.
- The current double-highlight behavior for `/dashboard?section=...` is intentionally preserved.
- Mobile/sitewide drawer migration remains deferred.

Manual QA checklist:
- [ ] Studio sidebar renders once.
- [ ] Query-section active states work.
- [ ] Dashboard plus section highlight behavior remains as before.
- [ ] Nested Architecture Scanner subnav works.
- [ ] Nested Architecture Doctor subnav works.
- [ ] Nested ASO Audit subnav works.
- [ ] Route clicks work.
- [ ] Admin / Developer visibility remains as before.
- [ ] Settings and Integration Health route behavior remains as before.
- [ ] Command bars remain intact.
- [ ] Workspace/account metadata remains intact.
- [ ] Mobile/sitewide behavior is unchanged.
- [ ] No duplicate nav.
- [ ] No invented routes.
- [ ] No horizontal scroll.
- [ ] No content hidden behind sidebar/header.
- [ ] No console errors.

Readiness decision:
- AudAiX live studio/sidebar route-list wiring is ready for a stabilization/manual-QA pass if full verification remains green.
- Mobile drawer replacement should remain separate.

## AudAiX Live Sidebar Stabilization

Scope:
- AudAiX authenticated studio/sidebar desktop route-list stabilization only.
- Mobile/sitewide navigation, command bars, workspace/account metadata, dashboard callbacks, nested tool panels, backend/auth/database/API/payment/business logic, and routes were not migrated or redesigned.

Regressions found:
- The shared primary route list was not duplicated, no routes were missing, no invented routes were present, and query-section active behavior remained correct.
- One accessibility styling gap was found: local conditional nested tool subnav links had hover/active styling but no explicit scoped `:focus-visible` rule.

Regressions fixed:
- Added an AudAiX-scoped focus-visible outline for `.audaix-sidebar__subnav--shared-local a:focus-visible`.
- No shared package runtime code changes were needed in this stabilization pass.

Files changed:
- `apps/AudAix/dashboard/src/components/navigation/audaix-navigation-shell-config.test.tsx`
- `apps/AudAix/dashboard/src/styles.css`
- `docs/navigation-shell-audit.md`

Tests added or updated:
- Expanded the focused AudAiX navigation test file from 13 to 15 tests.
- Added coverage that the live shared `SidebarNav` renders only top-level items while adapter metadata still preserves tool children.
- Added coverage that local nested tool subnavs remain conditional beside, not inside, the shared `nav` route list.
- Added coverage for the local nested subnav focus-visible selector.
- Added coverage that AudAiX package metadata and Vitest config point to the root shared package path instead of the app-local junction.

Exact routes verified:
- Command: `/dashboard`, `/dashboard/workspaces/workspace-1/members`, `/score-builder`
- Audit Readiness: `/dashboard?section=dependencies`, `/dashboard/security`, `/dashboard?section=evidence`, `/dashboard?section=reports`
- Operations: `/dashboard?section=activity`, `/dashboard/workspaces/workspace-1/connections`, `/system-health`
- Admin / Developer: `/dashboard?section=api-keys`, `/dashboard?section=webhooks`, `/dashboard/workspaces/workspace-1/connections`
- Audit Tool Suite: `/project-architect`, `/architecture-doctor`, `/tools/aso-audit`
- `Settings` and `Integration Health` still intentionally share `/dashboard/workspaces/:workspaceId/connections`.

Query-section behavior verified:
- `/dashboard?section=...` still highlights Dashboard plus the matching section item.
- Section links still use the local dashboard section callback when `onSectionChange` is provided.

Nested tool subnav behavior verified:
- Architecture Scanner, Architecture Doctor, and ASO Audit child metadata remains in the adapter for future migration.
- The live shared sidebar uses `includeToolChildren: false`, so tool children are not rendered unconditionally by `SidebarNav`.
- Conditional nested tool subnav rendering remains local to `AudAixStudioSidebar` and appears only on the active tool route.

Mobile/sitewide boundaries verified:
- `SitewideNav` still owns `sitewide-mobile-nav-drawer` and `audaix-mobile-navigation`.
- `SitewideNav` does not import or render shared `SidebarNav`.
- AudAiX mobile/sitewide nav migration remains deferred.

Verification:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck` - passed.
- `npm --prefix packages/ecosystem-assistant-ui test` - passed, 8 shared navigation tests.
- `npm --prefix apps/AudAix/dashboard run typecheck` - passed.
- `npm --prefix apps/AudAix/dashboard run test -- src/components/navigation/audaix-navigation-shell-config.test.tsx` - passed, 15 focused tests.
- `npm --prefix apps/AudAix/dashboard run test` - passed, 43 files / 229 tests.
- `npm --prefix apps/AudAix/dashboard run build` - passed.

Known issues:
- Manual browser QA is still needed.
- The current double-highlight behavior for `/dashboard?section=...` is intentionally preserved.
- The AudAiX dashboard `node_modules/@xflow-ecosystem/ecosystem-assistant-ui` entry still exists as an app-local junction, but package metadata, Vite, Vitest, and TypeScript paths point at the root shared package.
- Mobile/sitewide drawer migration remains deferred.

Manual QA checklist:
- [ ] Studio sidebar renders once.
- [ ] Route clicks work.
- [ ] Query-section active states work.
- [ ] Dashboard plus section highlight behavior remains as before.
- [ ] Nested Architecture Scanner subnav works.
- [ ] Nested Architecture Doctor subnav works.
- [ ] Nested ASO Audit subnav works.
- [ ] Workspace-disabled states work.
- [ ] Admin / Developer visibility remains as before.
- [ ] Settings and Integration Health route behavior remains as before.
- [ ] Command bars remain intact.
- [ ] Workspace/account metadata remains intact.
- [ ] Mobile/sitewide behavior is unchanged.
- [ ] Keyboard traversal works.
- [ ] Focus state is visible on shared sidebar links and local nested subnav links.
- [ ] No duplicate nav.
- [ ] No invented routes.
- [ ] No horizontal scroll.
- [ ] No content hidden behind sidebar/header.
- [ ] No console errors.

Readiness decision:
- AudAiX desktop/studio sidebar shared route-list migration is stable enough to mark the desktop sidebar migration complete after manual browser QA.
- Deferred ecosystem work remains: Crevux mobile drawer, Verixet mobile drawer, and AudAiX mobile/sitewide nav.

## Final Shared Navigation Shell Migration Status

Acceptance scope:
- Final ecosystem-wide audit for the shared navigation shell migration.
- No new runtime surfaces were migrated in this pass.
- No backend, auth, database, API, payment, business-logic, route, or UI redesign changes were made.
- Runtime fixes were not required. One RatAiFy source-level test was updated to assert the migrated shared-renderer ownership boundary for `aria-current` and disabled item accessibility.

Shared package status:
- `packages/ecosystem-assistant-ui/src/navigation-shell.tsx` remains router-neutral.
- Exports include `AppShell`, `SidebarNav`, `MobileNavDrawer`, `MobileHeader`, `NavSection`, `NavItem`, `SidebarUserCard`, `SidebarAccountFooter`, `PrimaryActionButton`, `QuickActionCard`, `CollapseToggle`, `NavigationShellStyles`, and the navigation shell types.
- The navigation shell does not import Next, Wouter, React Router, auth hooks, app stores, or app APIs.
- No app-specific navigation behavior was found in `navigation-shell.tsx`.
- App names and prompt packs remain in the pre-existing assistant bubble export surface in `index.tsx`; this is assistant UI content, not navigation shell logic.

| App | Package resolution status | Shared components used | Live-wired surfaces | Deferred surfaces | Verification status | Known issues | Manual QA status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| WordGeni | Resolves `@xflow-ecosystem/ecosystem-assistant-ui` via app package file dependency | `SidebarNav`, `MobileNavDrawer`, `NavigationShellStyles` | Desktop sidebar route list and dashboard mobile drawer | None identified for current migrated shell | Test, build, and typecheck passed | Prior `.next-prod/types` typecheck blocker did not reproduce in this run | Required |
| XFlow | Resolves root shared package through app package file dependency | `SidebarNav`, `MobileNavDrawer`, `NavigationShellStyles` | Desktop sidebar and mobile drawer | None identified for current migrated shell | Typecheck, focused shared-nav adapter test, and build passed | Build has existing Chronicle hook/image warnings; not navigation-related | Required |
| RatAiFy | Resolves root shared package through app package file dependency and package build script | `SidebarNav`, `MobileNavDrawer`, `NavigationShellStyles` | Active authenticated trust shell desktop nav and mobile drawer | Legacy/admin duplicate sidebars remain app-specific unless separately migrated | Package builds, typecheck, sidebar verifier, build, and targeted nav tests passed | Test ownership was updated for shared renderer `aria-current`; no runtime issue found | Required |
| Crevux | Resolves root shared package through pnpm/file dependency in active `apps/CreVux/artifacts/image-gen` app | `SidebarNav`, `NavigationShellStyles` | Dashboard desktop primary navigation | Mobile drawer/menu remains deferred; studio rails remain app-specific | Unit tests, typecheck, build, and focused shared-nav tests passed | Mobile menu mixes app controls with navigation and remains intentionally deferred | Required |
| Verixet | Resolves root shared package through app package file dependency | `SidebarNav`, `NavigationShellStyles` | Desktop dashboard sidebar route list in `DashboardShellNav.tsx` | Mobile drawer remains deferred; command/context sidebars remain app-specific | Typecheck, dashboard audit, test suite, and build passed | Build emits unrelated unused-variable warnings | Required |
| AudAiX | Package metadata, Vite, Vitest, and TS paths point at root shared package; dashboard `node_modules` still has an app-local junction caveat | `SidebarNav`, `NavigationShellStyles` | Desktop/studio sidebar primary route list | Mobile/sitewide nav remains deferred; nested tool subnavs remain app-local | Typecheck, full tests, and build passed | Existing Dashboard plus section double-highlight behavior intentionally preserved | Required |

Verification results:
- Shared package: `npm --prefix packages/ecosystem-assistant-ui run typecheck` - passed.
- Shared package: `npm --prefix packages/ecosystem-assistant-ui test` - passed, 8 navigation-shell tests.
- WordGeni: `npm --prefix apps/WordGeni/apps/web test` - passed, 83 files / 296 tests plus `check-production-feints`.
- WordGeni: `npm --prefix apps/WordGeni/apps/web run build` - passed.
- WordGeni: `npm --prefix apps/WordGeni/apps/web run typecheck` - passed.
- XFlow: `npm --prefix apps/XFlow run typecheck` - passed.
- XFlow: `npm --prefix apps/XFlow test -- tests/unit/shared-navigation-adapter.test.ts` - passed, 4 tests.
- XFlow: `npm --prefix apps/XFlow run build` - passed with unrelated Chronicle warnings.
- RatAiFy: `npm --prefix apps/RatAiFy run build:packages` - passed.
- RatAiFy: `npm --prefix apps/RatAiFy run typecheck` - passed.
- RatAiFy: `npm --prefix apps/RatAiFy run verify:sidebar` - passed, 19 sidebar paths registered.
- RatAiFy: `npm --prefix apps/RatAiFy run build` - passed.
- RatAiFy targeted nav tests: `npx --prefix apps/RatAiFy tsx --test tests/rataify-navigation-shell-config.node.test.ts tests/trust-shell-navigation.node.test.ts tests/trust-dashboard-rendering.node.test.ts tests/sidebar-routes-sync.node.test.ts tests/protected-layout-selected-site.node.test.ts` - passed, 14 tests.
- Crevux: `pnpm -C apps/CreVux/artifacts/image-gen run test:unit` - passed, 30 files / 99 tests.
- Crevux: `pnpm -C apps/CreVux/artifacts/image-gen run typecheck` - passed.
- Crevux: `pnpm -C apps/CreVux/artifacts/image-gen run build` - passed.
- Crevux focused nav tests: `pnpm -C apps/CreVux/artifacts/image-gen exec vitest run --config vitest.config.ts src/components/layout/crevux-navigation-shell-config.test.tsx src/components/dashboard/CrevuxAppHeader.shared-nav.test.ts` - passed, 2 files / 10 tests.
- Verixet: `npm --prefix apps/Verixet run typecheck` - passed.
- Verixet: `npm --prefix apps/Verixet run audit:dashboard` - passed; no missing nav routes reported.
- Verixet: `npm --prefix apps/Verixet test` - passed, 577 files passed / 3 skipped, 2131 tests passed / 26 skipped.
- Verixet: `npm --prefix apps/Verixet run build` - passed with unrelated unused-variable warnings.
- AudAiX: `npm --prefix apps/AudAix/dashboard run typecheck` - passed.
- AudAiX: `npm --prefix apps/AudAix/dashboard run test` - passed, 43 files / 229 tests.
- AudAiX: `npm --prefix apps/AudAix/dashboard run build` - passed.

Failures and classification:
- No automated verification command remains failing.
- RatAiFy targeted nav tests initially failed because `tests/trust-dashboard-rendering.node.test.ts` still asserted the old local shell implementation for `aria-current` and disabled setup copy. The migrated shared renderer now owns those accessibility attributes, so the test was updated to assert `SidebarNav`, `currentPath`, shared `aria-current`, adapter `Setup` badge mapping, and shared `aria-disabled`. This was a test migration issue, not a runtime regression.
- No shared navigation runtime regression was found.

Shared-package leakage check:
- No WordGeni Genie-specific navigation logic was found in the shared navigation shell.
- No XFlow workspace switcher logic was found in the shared navigation shell.
- No RatAiFy selected-site, billing, demo, or platform-admin navigation logic was found in the shared navigation shell.
- No Crevux billing, credits, density, studio rail, or tool-specific logic was found in the shared navigation shell.
- No Verixet command bars, workspace metadata, account metadata, or contextual subnav logic was found in the shared navigation shell.
- No AudAiX dashboard callback logic or nested tool panel logic was found in the shared navigation shell.
- App-specific behavior remains in app adapters/components and is passed to shared components as config or slots.

## Final Manual QA Checklist

WordGeni:
- [ ] Desktop sidebar renders once and route clicks work.
- [ ] Mobile drawer opens, closes, locks body scroll, and returns focus.
- [ ] Progress card remains visible and accurate.
- [ ] Genie quick action remains reachable.
- [ ] Feature-flagged nav visibility remains correct.
- [ ] Admin visibility remains correct.
- [ ] Account and logout controls remain reachable.

XFlow:
- [ ] Desktop sidebar renders once and active states are correct.
- [ ] Mobile drawer opens, closes, locks body scroll, and returns focus.
- [ ] Workspace switcher remains local and functional.
- [ ] `RightAiRail` remains intact.
- [ ] MFA gate still blocks/permits as before.
- [ ] Onboarding state remains intact.
- [ ] Admin visibility remains correct.

RatAiFy:
- [ ] Desktop trust shell nav renders once.
- [ ] Mobile drawer opens, closes, locks body scroll, and returns focus.
- [ ] Selected-site selector remains intact.
- [ ] Billing card remains intact.
- [ ] Platform-admin card remains role-gated as before.
- [ ] Scan CTA and dialogs remain functional.
- [ ] Account and logout controls remain reachable.

Crevux:
- [ ] Desktop dashboard primary nav renders once.
- [ ] Query/hash active routes behave as before.
- [ ] Credits display remains intact.
- [ ] Billing and pro controls remain intact.
- [ ] Account menu remains intact.
- [ ] Density controls remain intact.
- [ ] Studio rails remain unchanged.
- [ ] Mobile menu remains unchanged.

Verixet:
- [ ] Desktop sidebar renders once and active states are correct.
- [ ] Command bars remain intact.
- [ ] Workspace/account footer remains intact.
- [ ] Role/admin visibility remains correct.
- [ ] Local prefetch behavior remains correct.
- [ ] Mobile behavior remains unchanged.

AudAiX:
- [ ] Studio sidebar renders once.
- [ ] Query-section active states work.
- [ ] Dashboard plus section double-highlight remains preserved.
- [ ] Nested Architecture Scanner, Architecture Doctor, and ASO Audit subnavs remain conditional and local.
- [ ] Workspace-disabled states behave correctly.
- [ ] Admin / Developer visibility remains as before.
- [ ] Mobile/sitewide nav remains unchanged.

Global:
- [ ] Keyboard traversal works across migrated sidebars and drawers.
- [ ] Visible focus states are present.
- [ ] `aria-current` appears only on active items.
- [ ] Route clicks work.
- [ ] No duplicate navigation surfaces.
- [ ] No hidden content behind sidebars/headers.
- [ ] No horizontal scroll.
- [ ] No console errors.

## Dependency and Lockfile Follow-up

Observed in this acceptance run:
- XFlow verification commands passed; the prior npm/arborist package-lock-only install issue was not exercised because no install or lockfile rewrite was run.
- RatAiFy verification commands passed; the prior npm/arborist package-lock-only install issue was not exercised because no install or lockfile rewrite was run.
- Crevux pnpm checks passed. Caveats: Vitest reports both esbuild and oxc options are set and oxc wins; build reports plugin timing warnings. These are package-manager/build-tool caveats, not navigation failures.
- Verixet npm checks passed. Build still emits unrelated unused-variable warnings.
- AudAiX npm checks passed. Package metadata and aliases point to the root shared package, but the dashboard `node_modules/@xflow-ecosystem/ecosystem-assistant-ui` entry has previously been observed as an app-local junction; keep this on the dependency-maintenance list.

Recommendation:
- Run a dedicated dependency-maintenance pass after manual QA to normalize file dependencies, package-lock behavior, pnpm catalog behavior, and stale local package junctions across XFlow, RatAiFy, AudAiX, Verixet, WordGeni, and Crevux.
- Do not rewrite lockfiles as part of this navigation acceptance pass unless a future verification run is blocked by dependency resolution.

Final acceptance decision:
- The shared navigation shell migration is ready for manual browser acceptance.
- Automated verification is green across the shared package and all audited app surfaces.
- Desktop/sidebar migration can be considered complete for WordGeni, XFlow, RatAiFy trust shell, Crevux dashboard desktop primary nav, Verixet dashboard desktop sidebar, and AudAiX studio desktop sidebar, subject to manual QA.
- Deferred work remains intentionally out of scope: Crevux mobile drawer, Verixet mobile drawer, and AudAiX mobile/sitewide nav.

## Manual Browser QA Acceptance Results

Date:
- 2026-06-21.

Browser/device:
- Playwright Chromium 1.61.0, desktop viewport 1440x1000.
- Playwright Chromium 1.61.0, mobile viewport 390x844 with touch emulation.

Local URLs used:
- WordGeni: `http://127.0.0.1:3103`.
- XFlow: attempted `http://127.0.0.1:3100`, `http://localhost:3100`, and fresh `http://localhost:3104`.
- RatAiFy: `http://127.0.0.1:5000`.
- Crevux: initial `http://127.0.0.1:5174` was invalid because another Vite app was also bound to that port; corrected Crevux QA URL was `http://127.0.0.1:5176`.
- Verixet: `http://127.0.0.1:3102`.
- AudAiX: `http://127.0.0.1:5175`.

Evidence:
- Browser screenshots were written under `tmp/navigation-shell-manual-qa/`; normalized findings are recorded in this section.
- The probe checks covered page load status, final URL, nav landmark count, active markers, labelled buttons, horizontal overflow, mobile drawer candidates, console errors, and screenshots for first desktop/mobile routes.

WordGeni:
- Status: blocked by local authentication, not manually accepted.
- Routes checked: `/dashboard`, `/dashboard/projects`, `/dashboard/editor`, plus mobile `/dashboard`.
- Result: all checked dashboard routes returned 401 JSON with `Authentication required`; no product shell rendered, so desktop sidebar, mobile drawer, progress card, Genie quick action, route metadata, feature flags, admin visibility, account, and logout behavior could not be browser-accepted in this unauthenticated run.
- Issues found: no shared-navigation runtime issue observed; auth blocked the shell before render.
- Fixes made: none.
- Verification rerun: not applicable because no code change was made.
- Remaining manual QA: repeat with a valid local authenticated WordGeni session.

XFlow:
- Status: blocked by local dev-server connectivity, not manually accepted.
- Routes checked: attempted `/dashboard`, `/tools`, `/tools/apps`, `/settings`, plus mobile `/dashboard`.
- Result: the Next dev process reported ready on ports 3100 and 3104, but browser and PowerShell HTTP requests to loopback and the advertised network address returned connection refused. No dashboard shell rendered.
- Issues found: local server binding/connectivity issue only; no shared-navigation runtime issue could be evaluated.
- Fixes made: none.
- Verification rerun: not applicable because no code change was made.
- Remaining manual QA: repeat after the local XFlow dev server accepts HTTP, then verify desktop/mobile collapse persistence, `/tools` active quirks, workspace switcher, thumbnails, `RightAiRail`, MFA, onboarding, admin, account, scroll, and console behavior.

RatAiFy:
- Status: blocked by local authentication/central auth redirect, not manually accepted.
- Routes checked: `/dashboard`, `/sites`, `/rataiffyscan`, `/settings`, `/superadmin`, plus mobile `/dashboard`.
- Result: routes redirected to XFlow sign-in with a missing-context callback. The authenticated trust shell did not render, so selected-site, billing, platform-admin, demo, scan CTA, setup disabled, external Community, account, admin sidebar, and mobile drawer behavior could not be browser-accepted.
- Issues found: console showed expected unauthenticated 401s and unrelated CSP blocks for Sentry/Cloudflare scripts on the sign-in surface; no shared-navigation runtime issue observed.
- Fixes made: none.
- Verification rerun: not applicable because no code change was made.
- Remaining manual QA: repeat with a valid local RatAiFy authenticated trust-shell session.

Crevux:
- Status: environment-blocked for authenticated dashboard shell, popout accepted for shell exclusion.
- Routes checked on corrected Crevux URL `http://127.0.0.1:5176`: `/app`, `/app/create?view=projects`, `/app/create?view=gallery`, `/app/create?view=assets`, `/app/create#source-enhance`, `/app/exports`, `/app/create?view=history`, `/app/popout`, plus mobile `/app`.
- Result: authenticated `/app` routes redirected to XFlow auth and then returned `ECOSYSTEM_PUBLIC_URL_MISCONFIGURED: production signup URL cannot use localhost`, so desktop primary nav, active query/hash states, route-click preservation, credits, billing/pro, account, density, and admin gates could not be accepted in this unauthenticated local run.
- Result: `/app/popout` rendered `Missing viewer key in the URL.` with zero nav landmarks, confirming the media popout remains outside the shared product shell.
- Issues found: initial port 5174 result was invalid because another local Vite app was serving StackSight on the same port; corrected by starting Crevux on strict port 5176. No shared-navigation runtime issue observed.
- Fixes made: none.
- Verification rerun: not applicable because no app/shared code change was made.
- Remaining manual QA: repeat with a valid local Crevux authenticated `/app` session and keep mobile drawer deferred.

Verixet:
- Status: blocked by local authentication/central auth redirect, not manually accepted.
- Routes checked: `/dashboard`, `/dashboard/transactions`, `/dashboard/reports`, `/dashboard/settings`, plus mobile `/dashboard`.
- Result: routes redirected to Verixet sign-in with `reason=session`; desktop dashboard sidebar did not render. Command bars, workspace/account footer, admin visibility, local prefetch, focus, and sidebar duplication could not be browser-accepted.
- Issues found: sign-in surface logged unrelated CSP script blocks from the hosted auth page; no shared-navigation runtime issue observed.
- Fixes made: none.
- Verification rerun: not applicable because no code change was made.
- Remaining manual QA: repeat with a valid local Verixet authenticated dashboard session; keep mobile drawer deferred.

AudAiX:
- Status: partially accepted for the migrated studio/sidebar routes that rendered without authenticated API data; dashboard portfolio routes remain API-blocked.
- Routes checked: `/dashboard`, `/dashboard?section=sites`, `/architecture-doctor?tab=reports`, `/project-architect?tab=safety`, `/tools/aso-audit?tab=history`, `/dashboard/connect/xflow`, plus mobile `/dashboard`.
- Result: `/project-architect?tab=safety` rendered one `AudAiX navigation` landmark and active markers for `Architecture Scanner` plus nested `Safety`; `/tools/aso-audit?tab=history` rendered one `AudAiX navigation` landmark and active markers for `ASO Audit` plus nested `History`; `/dashboard/connect/xflow` rendered one `AudAiX navigation` landmark with no horizontal overflow.
- Result: `/dashboard`, `/dashboard?section=sites`, and `/architecture-doctor?tab=reports` showed API 500/load failures before the studio sidebar could be meaningfully accepted.
- Result: mobile `/dashboard` remained outside the migrated desktop/studio sidebar acceptance path and did not expose a nav drawer; this matches the deferred mobile/sitewide-nav scope.
- Issues found: API 500 console errors on dashboard data routes only; no shared-navigation runtime issue observed on rendered migrated sidebar routes.
- Fixes made: none.
- Verification rerun: not applicable because no app/shared code change was made.
- Remaining manual QA: repeat dashboard portfolio and Architecture Doctor checks with the AudAiX API available; mobile/sitewide nav remains deferred.

Overall acceptance:
- Manual browser QA did not find a clear shared-navigation regression requiring code changes.
- Browser acceptance is partial because most live product shells require authenticated local sessions or service dependencies that were not available in this run.
- Manually accepted now: AudAiX rendered migrated studio sidebar routes for `Project Architect` and `ASO Audit`; Crevux `/app/popout` confirmed no shared shell/nav.
- Not manually accepted yet: WordGeni, XFlow, RatAiFy, Crevux authenticated dashboard shell, Verixet authenticated dashboard shell, and AudAiX API-backed dashboard/Architecture Doctor routes.
- Deferred surfaces remain unchanged: Crevux mobile drawer, Verixet mobile drawer, and AudAiX mobile/sitewide nav.

## Authenticated Browser QA Follow-up Results

Date:
- 2026-06-21.

Evidence:
- Structured browser results and screenshots were written under `output/playwright/navigation-shell-authenticated-qa/`.
- Main result file: `output/playwright/navigation-shell-authenticated-qa/results.json`.

Focused fix made:
- WordGeni resolved `@xflow-ecosystem/ecosystem-assistant-ui` through a stale app-local junction at `apps/WordGeni/packages/ecosystem-assistant-ui`; that package copy did not include the navigation shell exports used by the migrated WordGeni shell.
- Synced the app-local package source with the root shared package for `src/index.tsx` and `src/navigation-shell.tsx`, then rebuilt `apps/WordGeni/packages/ecosystem-assistant-ui`.
- This was a package-resolution artifact fix only. No auth, backend, database, payment, or business-logic code was changed.

Local server and auth findings:
- WordGeni: standard dev URL `http://127.0.0.1:3103`; local dev auth works with an `auth-token` cookie signed with the existing non-production JWT secret contract. Initial 500s were caused first by the stale app-local shared package, then by an invalid temporary harness token. After package sync and matching `jose` signing, `/dashboard` and `/dashboard/projects` rendered.
- XFlow: clean local server reached at `http://127.0.0.1:3110`; the earlier "connection refused" result was reclassified as a redirect-follow issue. `/dashboard` redirects to `http://localhost:3110/sign-in?callbackUrl=%2Fdashboard`. Authenticated dashboard QA still requires seeded local credentials/session.
- RatAiFy: normal and `dev:smoke` starts both reached `http://127.0.0.1:5000`, but this workspace logged `demoSeedingEnabled: false` even through the smoke wrapper, then `/login?demo=1` redirected to XFlow auth. The remaining blocker is local smoke/demo seed configuration, not shared navigation rendering.
- Crevux: authenticated `/app` and `/app/create?public=1` still redirected to XFlow hosted auth from the corrected local app URL `http://127.0.0.1:5176`; no local authenticated Crevux session was available.
- Verixet: `/dashboard` still redirected to hosted sign-in. Local dashboard auth requires the documented e2e/bootstrap API-key setup; no `E2E_API_KEY` session was available in this pass.
- AudAiX: backend was started with the existing Playwright-safe contract on `http://127.0.0.1:19399` using sqlite/in-memory auth-off test mode, and the dashboard was started on `http://127.0.0.1:5177` with `VITE_API_BASE` pointed at that backend.

Browser QA results:
- WordGeni `/dashboard`: status 200, three nav landmarks (`WordGeni navigation`, `WordGeni navigation`, `Primary navigation`), active Dashboard/Console markers, no horizontal scroll. Screenshot: `output/playwright/navigation-shell-authenticated-qa/wordgeni-desktop-dashboard.png`.
- WordGeni `/dashboard/projects`: status 200, shared nav rendered with Projects active, no horizontal scroll. Screenshot: `output/playwright/navigation-shell-authenticated-qa/wordgeni-desktop-dashboard-projects.png`.
- WordGeni mobile `/dashboard`: status 200, shared nav rendered with no horizontal scroll. Screenshot: `output/playwright/navigation-shell-authenticated-qa/wordgeni-mobile-dashboard.png`.
- WordGeni `/dashboard/editor`: status 404; this is not a confirmed migrated route and should not be used for acceptance.
- AudAiX `/project-architect?tab=safety`: status 200, one `AudAiX navigation` landmark, active `Architecture Scanner` and nested `Safety`, no horizontal scroll, no nav console errors. Desktop and mobile screenshots were captured.
- AudAiX `/tools/aso-audit?tab=history`: status 200, one `AudAiX navigation` landmark, active `ASO Audit` and nested `History`, no horizontal scroll, no nav console errors.
- AudAiX `/dashboard`: status 200 with the local backend available, but no shared nav landmark; this remains outside the currently accepted migrated studio sidebar path.
- XFlow, RatAiFy, Crevux, and Verixet did not reach authenticated product shells in this pass; the browser only reached sign-in/redirect surfaces.

Residual issues:
- WordGeni rendered the shell, but console capture still included unrelated API/data 500 resource noise. No shared-nav export/runtime error remained after the package sync.
- AudAiX desktop studio subnav items are 36px high in the desktop route captures; the mobile capture did not report 44px touch-target violations. Desktop density was preserved from the existing app behavior.
- RatAiFy smoke auth remains blocked by local seed/config state because the server reported `demoSeedingEnabled: false`.

Verification after fix:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck` - passed.
- `npm --prefix packages/ecosystem-assistant-ui test` - passed, 8 navigation-shell tests.
- `npm --prefix apps/WordGeni/packages/ecosystem-assistant-ui run build` - passed.
- Playwright authenticated follow-up harness - passed for reachable WordGeni and AudAiX migrated routes; blocked apps are documented above.

## Remaining Authenticated Browser QA Blockers

Date:
- 2026-06-21.

Scope:
- Remaining blocked apps only: XFlow, RatAiFy, Crevux, and Verixet.
- No production auth, backend, database, API, payment, or business-logic changes were made.
- Deferred surfaces remain out of scope: Crevux mobile drawer, Verixet mobile drawer, AudAiX mobile/sitewide nav.

XFlow:
- Auth path: dashboard routes redirect to the local XFlow sign-in route, then require a seeded local credential or session before the shared dashboard shell renders.
- Local QA setup found: `apps/XFlow/scripts/seed-qa-account.ts` and `apps/XFlow/scripts/seed-admin.ts`.
- Safety result: `npm --prefix apps/XFlow run seed:qa` refused to seed because the configured database host is a hosted Supabase pooler and `XFLOW_ALLOW_REMOTE_QA_SEED=1` was not set. This is the correct guard for this pass.
- Blocker: no `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD`, `QA_TEST_EMAIL`/`QA_TEST_PASSWORD`, or seeded local session was present in the process environment.

RatAiFy:
- Auth path: `/login?demo=1` uses the local demo auth route only when demo data is seeded; otherwise protected trust-shell routes route to XFlow/central auth.
- Local QA setup found: `npm --prefix apps/RatAiFy run dev:smoke`, `GET /api/auth/demo`, `demo_explorer` demo seed data, and Playwright authenticated smoke specs.
- Safety result: the workspace `apps/RatAiFy/.env` database host is a hosted Supabase pooler. Demo seeding was not run against it.
- Local setup fix: `apps/RatAiFy/scripts/dev/start-smoke-server.mjs` now avoids overriding `DATABASE_URL` with the old placeholder and only auto-enables demo seeding when the caller provides a local/test database URL or explicitly opts into remote smoke seeding. This keeps local smoke QA usable without silently mutating a hosted database.
- Blocker: no safe local/test RatAiFy database with seeded demo data was available, so the trust shell could not be authenticated in browser QA.

Crevux:
- Auth path: the active web app remains `apps/CreVux/artifacts/image-gen`; authenticated `/app` routes use XFlow/Crevux API-backed session state. `/app/popout` remains outside the product navigation shell.
- Local QA setup found: API auth routes support `/auth/login` and `/auth/me`; API scripts exist for smoke/mobile QA users, but they require explicit smoke credentials and a configured API database.
- Safety result: no `apps/CreVux/artifacts/api-server/.env.local` or `.env` file was present, and only the API `.env.example` keys were available. No API server smoke user was created.
- Blocker: no local Crevux API session, smoke credentials, or API database configuration was available.

Verixet:
- Auth path: dashboard routes require a dashboard session. Local e2e auth is through `POST /api/dashboard/login` with an `E2E_API_KEY`, with session signing through `DASHBOARD_SESSION_SECRET`.
- Local QA setup found: `apps/Verixet/scripts/bootstrap-e2e-env.ts`, `.env.e2e.example`, and `e2e/dashboard-auth-helpers.ts`.
- Safety result: the workspace has a dashboard session secret and hosted database URL in `apps/Verixet/.env`, but no `.env.e2e` and no `E2E_API_KEY`, `E2E_ADMIN_API_KEY`, or `E2E_PLATFORM_SUPER_ADMIN_API_KEY` in the process environment. The bootstrap path requires explicit `E2E_BOOTSTRAP=1` and rejects production-like hosts; it was not run against the hosted database.
- Blocker: no local e2e API key/session was available, so the dashboard shell remained behind sign-in.

## Remaining Authenticated Browser QA Results

Date:
- 2026-06-21.

Evidence:
- Structured browser results and screenshots were written under `output/playwright/remaining-authenticated-qa/`.
- Main result file: `output/playwright/remaining-authenticated-qa/results.json`.

XFlow:
- Routes checked: `/dashboard`, `/overview`, `/tools`, `/tools/apps`, `/settings`, plus mobile `/dashboard`.
- Result: all routes reached `http://localhost:3110/sign-in?...` with status 200 and did not render the dashboard navigation shell.
- Browser signals: no horizontal overflow and no unlabelled buttons on the sign-in surface; product nav landmarks were not present because auth blocked the shell.
- Acceptance status: still blocked pending safe local credentials or seeded session.

RatAiFy:
- Routes checked: `/login?demo=1`, `/dashboard`, `/sites`, `/rataiffyscan`, `/settings`, `/superadmin`, plus mobile `/login?demo=1`.
- Result: `/login?demo=1` and `/superadmin` routed to XFlow sign-in with missing-context callback because the demo session was not available. Several SPA routes returned an empty body with module MIME errors from the already-running local process, so they were not accepted.
- Browser signals: no product trust-shell nav rendered in this pass; no horizontal overflow was reported on captured pages.
- Acceptance status: still blocked pending a safe local/test database and seeded demo user.

Crevux:
- Routes checked: `/app`, `/app/create?view=projects`, `/app/create?view=gallery`, `/app/exports`, `/app/popout`, plus mobile `/app`.
- Result: authenticated `/app` routes redirected to XFlow auth and returned `ECOSYSTEM_PUBLIC_URL_MISCONFIGURED: production signup URL cannot use localhost`; the product nav shell did not render. `/app/popout` rendered `Missing viewer key in the URL.` with no nav landmarks, confirming it remains outside the shared shell.
- Browser signals: no horizontal overflow was reported on captured pages.
- Acceptance status: authenticated shell still blocked pending a local Crevux API session; popout exclusion remains accepted.

Verixet:
- Routes checked: `/dashboard`, `/dashboard/transactions`, `/dashboard/reports`, `/dashboard/settings`, plus mobile `/dashboard`.
- Result: all routes redirected to hosted Verixet sign-in with `reason=session`; the dashboard sidebar did not render.
- Browser signals: no horizontal overflow and no unlabelled buttons on the sign-in surface; product nav landmarks were not present because auth blocked the shell.
- Acceptance status: still blocked pending a local e2e API key/session.

Verification after this pass:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck` - passed.
- `npm --prefix packages/ecosystem-assistant-ui test` - passed, 8 navigation-shell tests.
- `npx --prefix apps/RatAiFy tsx --test tests/demo-seeding-guard.node.test.ts tests/start-smoke-server.node.test.ts tests/reserved-fallback.node.test.ts tests/security-harness-persona-auth.node.test.ts` - passed, 13 tests.

## Local Authenticated QA Harness Requirements

Date:
- 2026-06-21.

Scope:
- Remaining blocked authenticated browser QA surfaces only: XFlow, RatAiFy, Crevux, and Verixet.
- Goal is a safe local/dev/test path to reach migrated product shells. This section does not introduce production auth changes, auth bypasses, new routes, backend behavior changes, database migrations, payment changes, or navigation refactors.
- Hosted database seeding remains out of scope. All seed/bootstrap commands below must target local or disposable non-production databases only.

XFlow:
- Required frontend command: `npm --prefix apps/XFlow run dev` for local manual QA, or Playwright's existing `apps/XFlow/playwright.config.ts` web server via `node scripts/start-e2e-server.cjs <host> <port>` after a build for e2e.
- Required backend command: none separate; XFlow is a Next app with server routes in the same process.
- Required local DB type: PostgreSQL with the XFlow schema applied. The current QA seed path treats any non-local DB host as remote and refuses to run unless `XFLOW_ALLOW_REMOTE_QA_SEED=1`; do not use that override for navigation QA.
- Required env vars: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`/`NEXTAUTH_URL`/app URL values aligned to the local port, Supabase service-role env needed by the central-auth upsert path, plus `QA_TEST_EMAIL`/`QA_TEST_PASSWORD` or `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` for browser login.
- Existing seed script: `npm --prefix apps/XFlow run seed:qa` (`apps/XFlow/scripts/seed-qa-account.ts`). It creates/updates a QA account, owner workspace membership, and all-app entitlement snapshot, and refuses remote DB hosts by default. `seed:admin` exists but is less complete for navigation QA because the authenticated e2e expects an active workspace and dashboard access.
- Existing dev/test auth helper: `apps/XFlow/e2e/auth-operator.spec.ts` performs real credential sign-in; no local storage-state shortcut or production-code auth bypass was found.
- Current blocker: this workspace's XFlow `.env.local` points at a hosted Supabase pooler, and no QA/e2e credentials are present in the process environment. `seed:qa` correctly refused the hosted target in the previous pass.
- Safe local-only harness status: partially exists. The safe seed and Playwright login path already exist; the missing piece is a local/disposable Postgres setup with schema/migrations and local credential env.
- New local-only harness script needed: not now. A future improvement could add a wrapper such as `scripts/dev/start-local-navigation-qa.cjs` that refuses non-local `DATABASE_URL`, runs migrations/seed, starts XFlow on a requested port, and never prints secrets.

RatAiFy:
- Required frontend/backend command: `npm --prefix apps/RatAiFy run dev:smoke`. RatAiFy serves the Vite client and Express API from the same local process for the authenticated smoke path.
- Required local DB type: PostgreSQL containing the RatAiFy schema. Demo browser QA needs `demo_explorer` seeded by `server/services/demoSeeder.ts`; this is DB-backed and is not in-memory.
- Required env vars: `DATABASE_URL` pointing at a local/test database whose database name is clearly test/smoke/local/RatAiFy-like, `SESSION_SECRET`, and optionally `SEED_DEMO_DATA=true` or `DEMO_MODE=true`. The smoke starter now auto-enables demo seeding only when the DB URL is local/test-like or `RATAIFY_ALLOW_REMOTE_SMOKE_SEED=1` is explicitly set; do not use the remote override for navigation QA.
- Existing seed script/helper: demo seeding runs at server startup when `assertDemoSeedingAllowed()` allows it. `/api/auth/demo` signs in the `demo_explorer` user, and `/login?demo=1` triggers that endpoint from the client.
- Existing browser tests: `npm --prefix apps/RatAiFy run test:smoke:auth` runs `smoke-authenticated-demo.spec.ts`, `navigation.spec.ts`, and `smoke-dashboard-issues.spec.ts` against `dev:smoke`.
- Current blocker: this workspace's RatAiFy `.env` points at a hosted Supabase pooler. The smoke starter correctly does not auto-seed against that hosted DB, so `/login?demo=1` cannot reach the trust shell here.
- Safe local-only harness status: mostly exists after the smoke-starter guard fix. Supply a local/test `DATABASE_URL`, let `dev:smoke` seed demo data, then run the authenticated smoke specs or manual browser QA.
- New local-only harness script needed: not now. The existing `dev:smoke` wrapper plus `tests/start-smoke-server.node.test.ts` guard cover the local-only safety boundary.

Crevux:
- Required frontend command: from `apps/CreVux/artifacts/image-gen`, run the Vite app, typically `pnpm exec vite --config vite.config.ts --host 127.0.0.1 --port 5176 --strictPort` for the QA port used in prior evidence. The package `dev` script also works but binds to `0.0.0.0` and default port behavior.
- Required backend command: from `apps/CreVux/artifacts/api-server`, run the Express API, normally `pnpm run dev` after configuring env. The Vite proxy defaults `/api` to `http://127.0.0.1:8787` through `VITE_DEV_API_ORIGIN`.
- Required local DB type: PostgreSQL with the Crevux API schema. Crevux auth is API-backed custom email/password/OAuth using the app `public.users` table, not Supabase Auth users created in the Supabase dashboard.
- Required env vars: API server needs at least `DATABASE_URL`, `AUTH_JWT_SECRET`, `PORT=8787`, and any required provider/env validation values for the routes under test. Vite needs `VITE_DEV_API_ORIGIN=http://127.0.0.1:8787` if the API is not on the default local origin. Smoke-user scripts require `SMOKE_NORMAL_EMAIL`, `SMOKE_NORMAL_PASSWORD`, `SMOKE_ADMIN_EMAIL`, and `SMOKE_ADMIN_PASSWORD`.
- Existing seed script/helper: `apps/CreVux/artifacts/api-server/scripts/create-smoke-users.ts` creates normal/admin smoke users, verifies email/terms, assigns credits, and creates personal workspace context. `create-mobile-qa-user.ts` exists but is not relevant to the primary desktop product-shell acceptance path.
- Existing local auth/session path: `/api/auth/login` issues API cookies/tokens; `/api/auth/me` hydrates the frontend session. The frontend `AuthContext` uses those API routes before rendering authenticated `/app` surfaces.
- Current blocker: this workspace does not have `apps/CreVux/artifacts/api-server/.env.local` or `.env`, local API DB settings, or smoke credentials. `/app` therefore redirects to XFlow auth and does not reach the product shell.
- Safe local-only harness status: partial. The API server, Vite proxy, auth routes, and smoke-user scripts exist, but a complete local/disposable database setup and non-secret smoke credential convention are not yet packaged into a one-command harness.
- New local-only harness script needed: optional future work. A safe wrapper should refuse non-local/non-disposable DB hosts, require explicit smoke email/password env, run `create-smoke-users.ts`, start the API on 8787, and start Vite on a QA port. Do not add a fake session or production auth bypass.

Verixet:
- Required frontend/backend command: `npm --prefix apps/Verixet run dev` for manual local QA on port 3102, or Playwright via `npm --prefix apps/Verixet run test:e2e:dashboard` once e2e env is loaded.
- Required backend command: none separate; Verixet is a Next app with dashboard/API routes in one process.
- Required local DB type: PostgreSQL with Verixet migrations applied. For authenticated dashboard QA, use a dedicated local/disposable DB only.
- Required env vars: `DATABASE_URL`, `DASHBOARD_SESSION_SECRET` with at least 32 characters, `VERIXET_LOCAL_DASHBOARD_LOGIN_ENABLED=true`, `VERIXET_E2E_INSECURE_COOKIE=1` for local HTTP e2e, and generated `E2E_API_KEY`, `E2E_ADMIN_API_KEY`, `E2E_PLATFORM_SUPER_ADMIN_API_KEY` when role coverage is needed.
- Existing seed/bootstrap script: `npm --prefix apps/Verixet run bootstrap:e2e-env` (`apps/Verixet/scripts/bootstrap-e2e-env.ts`). It requires `E2E_BOOTSTRAP=1`, refuses `NODE_ENV=production`, rejects production-like deployment envs/hosts, creates regular/admin/platform-super-admin identities, and prints e2e API keys to stdout for local shell/CI secret capture.
- Existing dev/test auth helper: `apps/Verixet/e2e/dashboard-auth-helpers.ts` posts `{ api_key }` to `/api/dashboard/login` and then opens authenticated dashboard pages. `.env.e2e.example` documents the required non-secret placeholders.
- Current blocker: this workspace has a hosted `DATABASE_URL` and `DASHBOARD_SESSION_SECRET` in `.env`, but no `.env.e2e` and no `E2E_API_KEY` values in the process environment. Bootstrap was not run because navigation QA must not seed hosted databases.
- Safe local-only harness status: mostly exists. The bootstrap script, `.env.e2e.example`, local dashboard-login route, and role-aware Playwright helpers are present; the missing piece is a local/disposable Postgres instance with e2e env loaded.
- New local-only harness script needed: not now. The existing bootstrap script and `.env.e2e.example` are sufficient if operators target a local/disposable DB and capture the generated keys outside source control.

Recommended local QA sequence:
- XFlow: configure local/disposable Postgres and local auth env, run migrations/schema setup, run `npm --prefix apps/XFlow run seed:qa`, start XFlow with local URL env aligned to the chosen port, then run browser QA with the QA credentials through the real sign-in form.
- RatAiFy: configure `DATABASE_URL` to a local/test RatAiFy database, run `npm --prefix apps/RatAiFy run dev:smoke`, verify startup logs show demo seeding enabled, then use `/login?demo=1` or `npm --prefix apps/RatAiFy run test:smoke:auth`.
- Crevux: configure API `.env.local` for a local/disposable DB and `AUTH_JWT_SECRET`, create explicit smoke credentials in the shell, run `pnpm -C apps/CreVux/artifacts/api-server exec tsx scripts/create-smoke-users.ts`, start the API on 8787, start Vite with `VITE_DEV_API_ORIGIN=http://127.0.0.1:8787`, then sign in through the API-backed login path and visit `/app`.
- Verixet: copy `.env.e2e.example` values into a local shell or untracked env file, point `DATABASE_URL` at a local/disposable DB, set `E2E_BOOTSTRAP=1`, run `npm --prefix apps/Verixet run bootstrap:e2e-env`, export the generated keys only in the shell/CI secret store, then run `npm --prefix apps/Verixet run test:e2e:dashboard` or manual `/dashboard` QA after `/api/dashboard/login`.

No new browser QA was unblocked by this inventory alone because the missing requirements are local/disposable databases and secrets/session fixtures, not shared-navigation runtime failures.

## Local Disposable QA Environment

Date:
- 2026-06-21.

Added `docs/local-navigation-qa.md` as the concrete disposable local QA environment plan for XFlow, RatAiFy, Crevux, and Verixet. The plan uses one disposable local PostgreSQL database per app, requires `scripts/assert-local-db.mjs` before seed/bootstrap commands, and keeps hosted databases out of scope.

Readiness summary:
- XFlow: ready once local PostgreSQL plus local central-auth/Supabase service env are supplied; `seed:qa` exists and refuses remote databases.
- RatAiFy: ready once local/test PostgreSQL is supplied; `dev:smoke` can seed demo data safely.
- Crevux: partial; local API/web/smoke scripts exist, but local DB, smoke credentials, and provider placeholders are required.
- Verixet: blocked for a purely local disposable database because the current migration preflight requires a Supabase host and rejects loopback; it needs a future local-compatible schema path or an already-prepared disposable database.

No browser QA was rerun in this pass.

## RatAiFy Local Disposable Browser QA Results

Date:
- 2026-06-21.

Local DB guard:
- Passed with `DATABASE_URL=postgresql://postgres@127.0.0.1:55411/rataify_nav_qa`.
- Database was a disposable local PostgreSQL 17 cluster under `output/playwright/rataify-local-disposable-qa/pgdata`; no hosted database was seeded.

Setup notes:
- Docker was installed but the Docker daemon was not running, so the QA run used the local PostgreSQL binaries to initialize an isolated cluster on `127.0.0.1:55411`.
- `npm --prefix apps/RatAiFy run db:migrate` failed before schema changes with `ERR_PACKAGE_PATH_NOT_EXPORTED` from `drizzle-kit`/`drizzle-orm`. For this disposable run only, the committed `apps/RatAiFy/migrations/*.sql` files were applied directly with `psql`.
- `dev:smoke` was started with `RATAIFY_SECURITY_HARNESS=0`, `SEED_DEMO_DATA=true`, and `DEMO_MODE=true` so the real Vite app and migrated shell rendered locally. The server log confirmed `demoSeedingEnabled: true`.

Local URL tested:
- `http://127.0.0.1:5000`.

Auth method:
- `/login?demo=1` using the local demo user `demo_explorer`, backed by `/api/auth/demo`.

Routes and behaviors checked:
- Desktop `/dashboard` and `/sites`.
- Mobile `/dashboard` plus drawer route-change, Escape, and backdrop close paths.
- Demo-user `/superadmin` access remains gated and redirects away from the admin sidebar.
- Shared nav renders once visibly on desktop, no desktop mobile-drawer overlay remains mounted, active state works for `/sites`, disabled setup items expose `aria-disabled`, Community remains an external link, selected-site selector opens, billing card renders, platform-admin card stays hidden for the demo user, scan CTA remains reachable, account and logout links are reachable, and no horizontal scroll was detected.

Issues found and fixed:
- `/login?demo=1` was intercepted by the reserved-path fallback and redirected to XFlow before the existing demo login flow could run. Fixed with a dev/demo-only reserved-path exception; normal `/login` and production demo login still redirect to central auth.
- The seeded demo user lacked current legal consent and the demo org lacked onboarding fields, which caused authenticated local QA to be blocked by legal/onboarding UI. Fixed in the local demo seeder by recording current legal consent and filling demo org onboarding metadata when demo seeding is enabled.
- The RatAiFy wrapper mounted `MobileNavDrawer` at desktop widths inside a hidden container; its fixed overlay could still intercept desktop clicks. Fixed by mounting the mobile drawer only for `max-width: 767px` and closing it when the viewport grows.
- The migrated trust shell had a user card but no account/logout actions. Added account security and sign-out links in the shell footer.

Evidence:
- `output/playwright/rataify-local-disposable-qa/browser-qa-results.json`.
- Screenshots in `output/playwright/rataify-local-disposable-qa/`: `desktop-dashboard.png`, `desktop-sites-active.png`, `mobile-dashboard-closed.png`, `mobile-drawer-open.png`, and `superadmin-demo-user.png`.

Result:
- RatAiFy authenticated local disposable browser QA accepted.

Verification rerun:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck` - passed.
- `npm --prefix packages/ecosystem-assistant-ui test` - passed.
- `npx tsx --test tests/demo-seeding-guard.node.test.ts tests/start-smoke-server.node.test.ts tests/reserved-fallback.node.test.ts tests/reserved-demo-login.node.test.ts tests/security-harness-persona-auth.node.test.ts` from `apps/RatAiFy` - passed, 16 tests.
- `npm --prefix apps/RatAiFy run typecheck` - passed.
- `npm --prefix apps/RatAiFy run verify:sidebar` - passed.
- `npm --prefix apps/RatAiFy run build` - passed.

Remaining blockers:
- The documented RatAiFy `db:migrate` command still fails locally under the current installed `drizzle-kit`/`drizzle-orm` package set; this did not block browser acceptance because committed SQL migrations were applied directly to the disposable database.

## XFlow Local Disposable Browser QA Results

Date:
- 2026-06-21.

Local DB guard:
- Passed with `DATABASE_URL=postgresql://postgres@127.0.0.1:55410/xflow_nav_qa` before local bootstrap, migration, seed, and browser QA.
- Database was a disposable local PostgreSQL 17 cluster under `output/playwright/xflow-local-disposable-qa/pgdata`; no hosted database was seeded.

Setup notes:
- Docker was unavailable, so the run used local PostgreSQL binaries on `127.0.0.1:55410`.
- A local-only bootstrap helper prepared minimal `auth`, `core`, and `xflow` schemas before Drizzle migrations because fresh disposable databases do not already contain Supabase-style `core.profiles`.
- XFlow ran locally at `http://127.0.0.1:3123` with the local database URL, loopback public URL overrides, QA credentials, and local-only auth/session secrets.

Auth method:
- Seeded QA account `qa-xflow@example.local` with the local-only `seed:qa` path.
- Signed in through the real `/sign-in?callbackUrl=/overview` credential form.
- The disposable workspace disables MFA enforcement and marks profile onboarding, legal consent, first-run welcome, and guided-tour state complete so navigation QA reaches the authenticated shell directly.

Routes and behaviors checked:
- Desktop `/overview`, `/tools`, and `/settings`.
- Mobile `/overview` plus drawer route-change, Escape, and backdrop close paths.
- Shared nav renders once visibly on desktop, semantic nav exists, `/tools` active-route behavior is preserved, workspace metadata is visible, app thumbnails/future provider entries render, owner/admin visibility is preserved, RightAiRail/assistant surface remains present, account/logout candidates are reachable, no desktop/mobile horizontal scroll was detected, and no shared-nav console errors were captured.

Issues found and fixed:
- Shared mobile drawer scroll lock only set `document.body.style.overflow`; XFlow's layout still left the document element scrollable. Fixed in `packages/ecosystem-assistant-ui` by locking/restoring both `body` and `documentElement` overflow and overscroll behavior, then rebuilt package `dist`.
- `seed:qa` could load `.env.local` over an explicit local shell `DATABASE_URL`. Fixed by preserving shell-provided env values.
- Fresh disposable XFlow databases lacked the minimal Supabase-style schemas required before migrations. Added `apps/XFlow/scripts/bootstrap-local-nav-qa-auth-schema.ts` with a local-host guard.
- Local disposable auth previously fell through paths requiring hosted Supabase service env. Added a local DB onboarding fallback and local seed mirror setup.
- Local profile onboarding fallback treated PostgreSQL `Date` values as null, which kept the first-run welcome modal open. Fixed timestamp normalization and updated the local seed/bootstrap to mark first-run welcome dismissed.
- `.env.local` public URL values could redirect loopback QA from `127.0.0.1` to a different localhost port. Added a loopback-only local QA public URL override.

Evidence:
- `output/playwright/xflow-local-disposable-qa/browser-qa-results.json`.
- Screenshots in `output/playwright/xflow-local-disposable-qa/`: `desktop-overview.png`, `desktop-tools.png`, `desktop-settings.png`, `mobile-overview-closed.png`, and `mobile-drawer-open.png`.

Result:
- XFlow authenticated local disposable browser QA accepted.

Verification rerun:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck` - passed.
- `npm --prefix packages/ecosystem-assistant-ui test` - passed, 8 tests.
- `npm --prefix apps/XFlow run test -- tests/unit/profile-onboarding-first-run.test.ts tests/unit/ecosystem-signup-app-config.test.ts tests/unit/shared-navigation-adapter.test.ts tests/unit/dashboard-navigation.test.ts tests/unit/dashboard-nav-route-paths.test.ts src/lib/navigation/main-nav.test.ts` - passed, 37 tests.
- `npm --prefix apps/XFlow run typecheck` - passed.
- `npm --prefix apps/XFlow run build` - passed. Build emitted existing warnings in `src/components/chronicle/ChronicleSourcesClient.tsx` about a `useMemo` dependency and raw `<img>` usage.

Remaining blockers:
- None for XFlow shared navigation shell acceptance in this local disposable QA run.

## Crevux Local Disposable Browser QA Results

Date:
- 2026-06-21.

Local DB guard:
- Passed when invoked with the literal URL form: `node scripts/assert-local-db.mjs --url postgresql://postgres@127.0.0.1:55412/crevux_nav_qa`.
- Database was a disposable local PostgreSQL 17 cluster under `output/playwright/crevux-local-disposable-qa/pgdata`; no hosted database was seeded.

Setup notes:
- Docker was unavailable, so the run used local PostgreSQL binaries on `127.0.0.1:55412`.
- Fresh local Crevux databases cannot currently rely on `pnpm -C apps/CreVux run db:push` because the installed Drizzle package set fails with `ERR_PACKAGE_PATH_NOT_EXPORTED` from `drizzle-orm/_relations`.
- Added `apps/CreVux/scripts/bootstrap-local-nav-qa-base-schema.mjs` as a local-only bootstrap helper for the base schema expected before the committed SQL migrations. The helper refuses production and non-local PostgreSQL URLs.
- SQL migrations then completed with the local legacy migration flag. Smoke users were created with local-only `SMOKE_*` env vars and placeholder provider env.
- The accepted run used Crevux API `http://127.0.0.1:8787` and Vite frontend `http://127.0.0.1:5200` with `VITE_DEV_API_ORIGIN=http://127.0.0.1:8787`.
- The API static server on 8787 was not used as the frontend target.

Auth method:
- Same-origin local API login through the Vite proxy at `POST http://127.0.0.1:5200/api/auth/login` using the seeded normal smoke user.
- The API returned normal `ir_access_token` and `ir_refresh_token` cookies. This avoided hosted auth and did not change production auth behavior.

Routes and behaviors checked:
- Desktop `/app`, `/app/create?view=projects`, `/app/create?view=gallery`, `/app/create?view=assets`, `/app/create#source-enhance`, `/app/exports`, `/app/create?view=history`, and `/app/popout`.
- Mobile `/app`.
- Checked authenticated shell load, shared dashboard nav count/visibility, duplicate nav, active `/app`, route-click query/hash preservation, credits, billing/pro control, account menu, density menu, normal-user admin gate, studio nav behavior, popout exclusion, horizontal overflow, mobile dock behavior, mobile desktop-nav hiding, and shared-nav-related console failures.

Result:
- Crevux authenticated local disposable browser QA accepted.
- `browser-qa-results.json` passed with 37 checks, 6 routed nav targets, 4 screenshots, and 0 failed checks.
- `/app` passed the shared navigation check: the shared desktop primary nav rendered once, was visible, had canonical hrefs, showed the active dashboard route, rendered credits and upgrade controls, and had no horizontal overflow.
- Shared dashboard nav clicks preserved canonical destinations for Projects, Gallery, Assets, Enhance, Exports, and Workflows.
- `/app/create*` studio routes hydrated and kept the existing app-specific studio nav behavior after navigation.
- `/app/popout` correctly stayed outside the shared app shell.
- Mobile `/app` kept the existing dock/menu behavior, hid the desktop shared nav, and had no horizontal overflow.
- The browser captured local API `403` responses from `/api/projects`, `/api/generation/jobs?limit=80`, and `/api/assets`. Response capture confirmed these were disposable local fixture/API context failures, not shared-navigation asset, component, or package failures.

Issues found:
- Local API login initially returned 404 because `CREVUX_LOCAL_AUTH_ENABLED=true` was missing. Restarting the disposable API with that local-only flag unblocked credential login.
- Vite proxy login through `/api/auth/login` was unstable while earlier API processes and the small local pool were still attached; after restarting the dead local services cleanly on 8787/5200, same-origin Vite proxy login passed.
- The first disposable PostgreSQL cluster used Windows-default encoding and failed on UTF-8 migration content. Reinitializing the disposable cluster with UTF-8 resolved this.
- The disposable PostgreSQL process stopped once during the run and was restarted from the same local `pgdata` directory.
- The guard script accepts literal URLs only with `--url`; positional arguments are env var names.
- Shared dashboard primary nav links for Gallery, Assets, and Workflows could preserve the studio `public=1` surface preference after visiting create routes, which broke the canonical route-preservation check.

Fixes made:
- Added `apps/CreVux/scripts/bootstrap-local-nav-qa-base-schema.mjs` for local-only base schema preparation before Crevux SQL migrations.
- Updated `apps/CreVux/artifacts/image-gen/src/components/layout/crevux-navigation-shell-config.tsx` so shared dashboard primary nav links for Projects, Gallery, Assets, and Workflows opt out of public/internal surface preservation and keep canonical route destinations.
- No production auth, backend business logic, mobile drawer, or hosted DB changes were made.

Evidence:
- `output/playwright/crevux-local-disposable-qa/browser-qa-results.json`.
- Screenshots in `output/playwright/crevux-local-disposable-qa/`: `final-desktop-dashboard.png`, `final-desktop-exports.png`, `final-desktop-popout.png`, and `final-mobile-dashboard.png`.

Verification rerun:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck` - passed.
- `npm --prefix packages/ecosystem-assistant-ui test` - passed, 8 tests.
- `pnpm -C apps/CreVux/artifacts/image-gen exec vitest run --config vitest.config.ts src/components/layout/crevux-navigation-shell-config.test.tsx src/components/dashboard/CrevuxAppHeader.shared-nav.test.ts` - passed, 2 files and 10 tests.
- `pnpm -C apps/CreVux/artifacts/image-gen run test:unit` - passed, 30 files and 99 tests.
- `pnpm -C apps/CreVux/artifacts/image-gen run typecheck` - passed.
- `pnpm -C apps/CreVux/artifacts/image-gen run build` - passed.

Remaining blockers:
- None for Crevux shared navigation shell acceptance in this local disposable QA run.
- The disposable local fixture still produces non-shared-nav API `403` responses for project/job/asset data calls; these did not block shared-navigation acceptance because route rendering, active behavior, and shared-nav resources passed.

## Verixet Local Disposable Browser QA Results

Date:
- 2026-06-21.

Local DB guard:
- Passed with `node scripts/assert-local-db.mjs --url postgresql://postgres:postgres@127.0.0.1:55413/verixet_nav_qa`.
- Planned database host was `127.0.0.1:55413`, database `verixet_nav_qa`.
- No hosted database was seeded, migrated, or otherwise mutated.

Migration preflight:
- Blocked before any database connection when run with `DATABASE_URL` and `DIRECT_DATABASE_URL` pointed at the disposable loopback URL.
- `npm --prefix apps/Verixet run db:migrate` failed with `DIRECT_DATABASE_URL must not use a loopback host; configure Supabase cloud Postgres.`
- `apps/Verixet/src/db/index.ts` also asserts `DATABASE_URL` through the same Supabase-only URL guard, so the authenticated dashboard runtime cannot use the local disposable database without a future local-compatible schema/runtime path.

Local URL planned:
- `http://127.0.0.1:3102`.

Auth/session method planned:
- `POST /api/dashboard/login` through `apps/Verixet/e2e/dashboard-auth-helpers.ts`, using generated local `E2E_API_KEY`, `E2E_ADMIN_API_KEY`, and `E2E_PLATFORM_SUPER_ADMIN_API_KEY` values from `npm --prefix apps/Verixet run bootstrap:e2e-env`.

Routes checked:
- None. Browser QA was intentionally not started after migration preflight rejected the local disposable database.

Result:
- Verixet authenticated local disposable browser QA remains blocked.

Issues found:
- Verixet's migration command still requires a Supabase cloud `DIRECT_DATABASE_URL` and rejects loopback hosts.
- Verixet's runtime DB client still requires a Supabase cloud `DATABASE_URL`.
- No local-only migration/fixture path was found that can prepare a disposable Verixet dashboard DB without weakening production guards.

Fixes made:
- Added blocked-run evidence only. No Verixet runtime, auth, backend, mobile drawer, or production guard code was changed.

Evidence:
- `output/playwright/verixet-local-disposable-qa/browser-qa-results.json`.
- No screenshots were captured because the browser run did not start.

Verification rerun:
- `node scripts/assert-local-db.mjs --url postgresql://postgres:postgres@127.0.0.1:55413/verixet_nav_qa` - passed.
- `npm --prefix apps/Verixet run db:migrate` with local loopback `DATABASE_URL`/`DIRECT_DATABASE_URL` - blocked by Verixet preflight before connecting.

Remaining blockers:
- Add a local/test-only Verixet migration/runtime path that accepts a disposable local PostgreSQL URL while preserving the existing Supabase-only guard for production and hosted runtime use.
- After that path exists, run `bootstrap:e2e-env`, start Verixet at `http://127.0.0.1:3102`, authenticate through `/api/dashboard/login`, and complete desktop/mobile shared-navigation browser QA.

## Shared Navigation Shell Final Closeout

Date:
- 2026-06-21.

Scope:
- This closeout is documentation-only. No new runtime migration, backend, auth, database, payment, business logic, route, or mobile drawer wiring was performed.

Apps migrated:
- WordGeni: shared shell used for the authenticated dashboard sidebar and dashboard mobile drawer.
- XFlow: shared shell used for the dashboard desktop sidebar and mobile drawer.
- RatAiFy: shared shell used for the authenticated trust shell navigation.
- Crevux: shared shell used for the authenticated desktop dashboard primary nav; media popout and studio tool rails remain app-specific.
- Verixet: shared shell used for the desktop dashboard sidebar route list.
- AudAiX: shared shell used for the authenticated studio desktop sidebar route list.

Shared components used:
- `NavigationShellStyles`.
- `SidebarNav`.
- `MobileNavDrawer` where the app's migrated mobile surface was in scope.
- Shared navigation config/types and behavior from `packages/ecosystem-assistant-ui/src/navigation-shell.tsx`, including route matching, disabled/external handling, role visibility, collapse storage, focus management, Escape/backdrop close, and scroll locking.

Package-resolution changes made:
- Root `packages/ecosystem-assistant-ui` now owns the shared navigation shell exports and explicit built ESM re-export path.
- XFlow resolves `@xflow-ecosystem/ecosystem-assistant-ui` to the root shared package.
- RatAiFy resolves app imports to the root shared package; the app-local package copy remains on disk and should be cleaned up later.
- Crevux image-gen resolves app imports to the root shared package.
- Verixet resolves app imports to the root shared package.
- AudAiX dashboard package metadata and Vite/Vitest/TypeScript aliases point to the root shared package; a dashboard `node_modules` app-local junction caveat remains on the dependency-maintenance list.
- WordGeni needed an app-local package sync for the existing local junction during authenticated QA; no runtime auth/backend behavior was changed.

Browser QA status by app:
- WordGeni: partially accepted. Authenticated local QA reached `/dashboard` and `/dashboard/projects` with the shared nav rendered; evidence is in `output/playwright/navigation-shell-authenticated-qa/`.
- RatAiFy: accepted. Local disposable authenticated browser QA passed with real demo login and shared-nav checks; evidence is in `output/playwright/rataify-local-disposable-qa/`.
- XFlow: accepted. Local disposable authenticated browser QA passed with real sign-in and shared-nav checks; evidence is in `output/playwright/xflow-local-disposable-qa/`.
- Crevux: accepted. Local disposable authenticated browser QA passed for the shared desktop primary nav and mobile dock boundary; evidence is in `output/playwright/crevux-local-disposable-qa/`.
- AudAiX: partially accepted. Desktop/studio shared sidebar routes were accepted with local backend/test-mode support; dashboard portfolio routes and mobile/sitewide nav remain deferred. Evidence is in `output/playwright/navigation-shell-authenticated-qa/` and root AudAiX screenshots under `output/playwright/`.
- Verixet: accepted for the migrated desktop shared-nav surface after the local-only DB/QA harness pass. Local disposable browser QA passed with real `/api/dashboard/login` API-key sessions; Verixet mobile drawer behavior remains deferred. Evidence is in `output/playwright/verixet-local-disposable-qa/browser-qa-results.json`.

Automated verification status by app:
- Shared package: typecheck and navigation-shell tests passed repeatedly, including the final closeout run.
- WordGeni: prior typecheck/test/build and authenticated follow-up checks passed for the migrated reachable shell surfaces; remaining coverage is manual/human visual QA.
- XFlow: focused navigation/unit checks, typecheck, and build passed; local disposable browser QA accepted.
- RatAiFy: typecheck, sidebar verification, focused smoke/guard tests, and build passed; local disposable browser QA accepted.
- Crevux: focused shared-nav tests, unit tests, typecheck, and build passed; local disposable browser QA accepted.
- Verixet: earlier typecheck, dashboard audit, tests, and build passed for the desktop sidebar migration; the local-only DB guard tests and browser QA harness now also pass.
- AudAiX: dashboard typecheck, tests, and build passed; studio/sidebar shared route-list accepted for reachable local browser routes.

Accepted apps:
- RatAiFy.
- XFlow.
- Crevux.
- Verixet desktop shared-nav surface.

Partial apps:
- WordGeni, because authenticated local QA reached key dashboard routes but the final local disposable matrix was not expanded to every requested manual state.
- AudAiX, because desktop/studio sidebar shared navigation is accepted while mobile/sitewide nav and API-backed dashboard portfolio surfaces remain outside this pass.

Blocked apps:
- None for the migrated desktop shared navigation surfaces. Deferred mobile/sitewide/contextual surfaces remain listed below.

Deferred surfaces:
- Crevux mobile drawer wrapper design and wiring.
- Verixet mobile drawer readiness and wiring.
- AudAiX mobile/sitewide navigation readiness and wiring.
- App-specific contextual subnavs and tool rails, including Verixet command sidebars, Crevux studio rails, and AudAiX nested tool subnavs.
- JournOwl and 1ofaKindPiece remain provider/future entries only where previously documented; no routes were invented.

Known non-blocking warnings:
- XFlow build emits existing Chronicle warnings about a `useMemo` dependency and raw `<img>` usage; these are not shared-nav regressions.
- RatAiFy `db:migrate` remains affected by the installed `drizzle-kit`/`drizzle-orm` package export issue; the accepted disposable QA run applied committed SQL directly.
- Crevux local DB push/migration path has existing Drizzle package export limitations; the accepted disposable QA run used the local-only bootstrap plus committed SQL migrations.
- Crevux local fixture produced API `403` responses for project/job/asset calls; shared-nav route rendering and shell behavior passed.
- Verixet build previously emitted unrelated unused-variable warnings.
- AudAiX preserves existing dashboard/section highlight behavior and has an app-local junction cleanup caveat.
- Crevux pnpm/Vitest reports existing build-tool warnings around esbuild/oxc and peer dependencies.

Evidence locations:
- WordGeni: `output/playwright/navigation-shell-authenticated-qa/wordgeni-desktop-dashboard.png`, `wordgeni-desktop-dashboard-projects.png`, `wordgeni-desktop-dashboard-editor.png`, and `wordgeni-mobile-dashboard.png`.
- RatAiFy: `output/playwright/rataify-local-disposable-qa/browser-qa-results.json` plus screenshots in the same folder.
- XFlow: `output/playwright/xflow-local-disposable-qa/browser-qa-results.json` plus screenshots in the same folder.
- Crevux: `output/playwright/crevux-local-disposable-qa/browser-qa-results.json` plus screenshots in the same folder.
- AudAiX: `output/playwright/navigation-shell-authenticated-qa/results.json`, `audaix-desktop-dashboard.png`, `audaix-desktop-project-architect-tab-safety.png`, `audaix-desktop-tools-aso-audit-tab-history.png`, `audaix-mobile-project-architect-tab-safety.png`, plus earlier root screenshots `output/playwright/audaix-dashboard-operations.png` and `output/playwright/audaix-dashboard-simplified-nav.png`.
- Verixet: `output/playwright/verixet-local-disposable-qa/browser-qa-results.json` plus screenshots in the same folder.

Cleanup status:
- No hosted database was seeded during the final local disposable QA passes.
- Disposable local QA evidence and logs remain under `output/playwright/*-local-disposable-qa/`.
- Local package copies and junctions were not removed in this closeout; they remain part of dependency cleanup.
- Root workspace git metadata remains unresolved in this environment because `git -C K:\XFlow-Ecosystem Workspace status` reports that the workspace root is not a Git repository.

Follow-up backlog:
- Verixet local-only DB/QA harness maintenance: keep `VERIXET_LOCAL_NAV_QA_DATABASE=1` test-only, preserve production Supabase URL requirements by default, and revisit the local-only migration compatibility rewrites if future migrations remove legacy text/UUID compatibility drift.
- Deferred mobile wrappers: run separate audit, adapter, wiring, and stabilization passes for the Crevux mobile drawer wrapper, Verixet mobile drawer readiness/wiring, and AudAiX mobile/sitewide nav readiness/wiring.
- Dependency/lockfile cleanup: resolve the XFlow/RatAiFy npm arborist package-lock-only issue, remove or retire stale app-local `ecosystem-assistant-ui` copies where imports no longer use them, normalize nested/local package junctions, and investigate the root workspace git metadata issue.
- Manual human visual QA: perform a human review of the captured screenshots even where automated browser QA accepted the shell. Review WordGeni under `output/playwright/navigation-shell-authenticated-qa/`, RatAiFy under `output/playwright/rataify-local-disposable-qa/`, XFlow under `output/playwright/xflow-local-disposable-qa/`, Crevux under `output/playwright/crevux-local-disposable-qa/`, AudAiX under `output/playwright/navigation-shell-authenticated-qa/` and root AudAiX screenshots, and Verixet accepted evidence under `output/playwright/verixet-local-disposable-qa/`.

Recommended next project:
- Run a dependency/lockfile cleanup pass for stale app-local shared package copies and npm/arborist lockfile behavior, or begin one of the deferred mobile wrapper passes as a separate audit -> adapter -> wiring -> stabilization project.

## Verixet Local Disposable Browser QA Harness Results

Date:
- 2026-06-21.

Local QA DB guard override:
- Added `VERIXET_LOCAL_NAV_QA_DATABASE=1` as a Verixet-specific local QA flag.
- Loopback/local Docker-style database hosts are accepted only when the flag is set and `NODE_ENV` is not `production`.
- Supabase-hosted URLs remain accepted by default.
- Loopback URLs remain rejected by default.
- Hosted non-Supabase URLs remain rejected even when the local QA flag is set.

DB guard result:
- `node scripts/assert-local-db.mjs --url postgresql://postgres:postgres@127.0.0.1:55413/verixet_nav_qa` passed for both planned `DATABASE_URL` and `DIRECT_DATABASE_URL`.
- `npm --prefix apps/Verixet run db:migrate` passed against the disposable local database with `VERIXET_LOCAL_NAV_QA_DATABASE=1`.
- `npm --prefix apps/Verixet run bootstrap:e2e-env` passed with generated local API keys kept in process memory only.

Local database:
- Host/port: `127.0.0.1:55413`.
- Database: `verixet_nav_qa`.
- PostgreSQL data directory: `output/playwright/verixet-local-disposable-qa/pgdata`.
- No hosted database was seeded, migrated, or queried.

Local URLs:
- App/API: `http://127.0.0.1:3102`.
- Health endpoint: `http://127.0.0.1:3102/api/v1/health`.

Auth/session method:
- Real local `POST /api/dashboard/login` with generated e2e API keys from `bootstrap:e2e-env`.
- Covered regular, workspace-admin, and platform-super-admin sessions.
- Generated API keys were not written to docs or evidence files.

Routes checked:
- `/dashboard`.
- `/dashboard/transactions`.
- `/dashboard/reports`.
- `/dashboard/settings` stayed on the local origin and returned the app's current 404 for that path.
- Mobile `/dashboard` for auth-boundary and no-duplicate/no-overflow observation only; Verixet mobile drawer wiring remains deferred.

Result:
- Verixet local disposable browser QA accepted for the migrated desktop shared-nav surface.
- `browser-qa-results.json` passed with 28 checks, 7 screenshots, and 0 failed checks.

Issues found:
- The existing Verixet DB URL guard was unconditional and rejected loopback for both `DATABASE_URL` and `DIRECT_DATABASE_URL`.
- Local migration replay hit legacy compatibility migrations that assumed text IDs/defaults while the fresh local schema uses UUID IDs.
- Playwright Chromium was not installed for this app environment and had to be installed before browser QA.
- The first browser QA assertion treated dashboard content text `Platform Security Score` as platform navigation; the QA helper now checks platform nav links instead.
- Verixet mobile drawer did not open at the tested mobile viewport; this remains a deferred app-owned mobile drawer surface and did not block desktop shared-nav acceptance.

Fixes made:
- Added a local-only DB guard allowance in `apps/Verixet/src/lib/env/supabase-database-url.ts`.
- Added focused guard and local migration compatibility tests in `apps/Verixet/src/lib/env/supabase-database-url.test.ts`.
- Added local-only migration statement rewrites in `apps/Verixet/scripts/pg-migrate.ts` for the known fresh-local UUID/text compatibility gaps; production migration behavior remains unchanged unless `VERIXET_LOCAL_NAV_QA_DATABASE=1` is set.
- Added `apps/Verixet/scripts/local-nav-browser-qa.mjs` to run authenticated local browser QA without writing generated API keys to evidence.

Evidence:
- `output/playwright/verixet-local-disposable-qa/browser-qa-results.json`.
- Screenshots in `output/playwright/verixet-local-disposable-qa/`: `desktop-dashboard.png`, `desktop-transactions.png`, `desktop-reports-admin.png`, `desktop-settings-admin.png`, `desktop-platform-admin.png`, `mobile-dashboard-closed.png`, and `mobile-drawer-open.png`.

Cleanup:
- Verixet local dev server was stopped.
- Disposable PostgreSQL was stopped.
- Evidence files were left in place.

Remaining blockers:
- None for Verixet's migrated desktop shared navigation shell acceptance.
- Verixet mobile drawer readiness/wiring remains deferred and must be handled in its own audit -> adapter -> wiring -> stabilization pass.

## Deferred Mobile Drawer Wrapper Design

Date:
- 2026-06-21.

Scope:
- Readiness and design only for Crevux, Verixet, and AudAiX deferred mobile/custom navigation surfaces.
- No mobile drawer runtime wiring, route invention, backend, auth, database, payment, business logic, or desktop shared-nav changes were performed.

Shared/local boundary:
- The shared package should continue to own route-list rendering, route matching, role filtering, disabled/external state, `aria-current`, minimum touch target styling, Escape/backdrop/focus/scroll behavior primitives, and package CSS variables.
- Each app should own the mobile wrapper that decides when a drawer opens, which local controls surround the route list, how product command tools coexist with global navigation, and how account/logout/billing/admin actions are invoked.
- Do not move app-specific controls into `packages/ecosystem-assistant-ui`: Crevux density/Site Wiki/studio controls, Verixet command/workspace/account metadata, and AudAiX sitewide ecosystem/auth CTAs remain app-owned slots.

Proposed wrapper architecture:
- App-owned mobile wrapper component: owns the trigger, open state, route-change close integration, and app-specific visual shell.
- Shared route-list renderer: use `SidebarNav` or `MobileNavDrawer` content semantics with app config, current path, and app router `renderLink`.
- Local top slot: brand, workspace label, environment label, active chapter, or product context.
- Local middle/action slot: billing/pro cards, upgrade CTAs, notification summaries, density/display preferences, and app mode switches.
- Local command/tool slot: studio/current controls, command palette entry points, tool rails, bottom dock launchers, and contextual subnavs.
- Local footer/account slot: account identity, workspace status, logout, legal/trust links, and billing authority copy.
- Mobile dock coexistence: bottom docks and edge tool drawers remain siblings of the global drawer. The global drawer must reserve safe-area/bottom-dock padding or close before opening tool drawers so focus and scroll locks do not compete.
- Focus/scroll/escape/backdrop behavior: wrappers should reuse the shared drawer behavior where feasible. If a local wrapper cannot use `MobileNavDrawer` directly, it must match the contract: close on route change, Escape, and backdrop; lock body scroll; move focus to the drawer close/first focusable control; return focus to the hamburger; avoid trapping focus in text inputs; preserve 44px touch targets; and prevent horizontal overflow.

### Crevux Mobile Audit

Current mobile nav components:
- `apps/CreVux/artifacts/image-gen/src/components/dashboard/CrevuxUniversalMobileMenu.tsx`.
- `apps/CreVux/artifacts/image-gen/src/components/studio/responsive/StudioMobileShell.tsx`.
- `apps/CreVux/artifacts/image-gen/src/components/studio/responsive/MobileToolDock.tsx`.
- `apps/CreVux/artifacts/image-gen/src/components/video-studio/shell/VideoStudioMobileBottomBar.tsx`.
- `apps/CreVux/artifacts/image-gen/src/components/video-studio/shell/VideoStudioMobileDockDrawer.tsx`.

Current route links:
- Product route config lives in `apps/CreVux/artifacts/image-gen/src/lib/crevuxAppNavigation.ts`.
- Shared shell adapter exists in `apps/CreVux/artifacts/image-gen/src/components/layout/crevux-navigation-shell-config.tsx`.
- Mobile menu groups route links by Create, Workspace, Platform, and Account, with internal-studio-only visibility handled by `getVisibleCrevuxNavItems`.

Current account/logout controls:
- `CrevuxUniversalMobileMenu` renders account email, plan label, optional logout, Site Wiki entry, account/security/settings route items, and mode-switch entries.

Current billing/pro controls:
- `Upgrade plan`, `Manage billing`, plan label, and pro/settings routes are local controls.

Current notifications:
- The mobile menu trigger accepts `notificationCount` and renders a badge; history/workflow routes are present in config.

Current command/tool controls:
- `showCurrentControls` and `onOpenCurrentControls` open local current controls.
- `MobileToolDock` exposes Project, Storyboard, Provider, and Advanced controls.
- `VideoStudioMobileBottomBar` exposes Source, Prompt, Media, More, Tools, and Render actions.
- `VideoStudioMobileDockDrawer` owns left/right edge tool drawers with focus return and Escape handling.

Current admin/internal controls:
- `showAdminDashboardLink`, `canAccessInternalStudio`, internal studio, ops, and public/internal app switches are local visibility and action concerns.

Mobile dock behavior:
- Crevux has fixed/bottom studio command surfaces and edge drawers that are not primary navigation. They must remain local siblings or slots and must not be generalized into the shared package.

Can shared `MobileNavDrawer` be used directly:
- Not directly for the full Crevux mobile experience. The current menu includes density preferences, Site Wiki, billing portal callbacks, current controls, admin/internal switches, and studio tool docks.

Local wrapper required:
- Yes. Recommended component shape: `CrevuxMobileNavigationDrawer` or `CrevuxUniversalMobileNavigationWrapper`.
- The wrapper should feed `createCrevuxNavigationShellConfig` into the shared route-list renderer and provide local slots for account, billing, density, Site Wiki, current controls, admin/internal links, and logout.

Crevux recommendation:
- Migrate first, but only as an adapter/wrapper pass. Replace the route-list portion of `CrevuxUniversalMobileMenu` with the shared route renderer while preserving all local action rows and dock/tool behavior outside the shared package.
- Treat `VideoStudioMobileBottomBar`, `VideoStudioMobileDockDrawer`, `MobileToolDock`, and `StudioMobileShell` as coexistence surfaces. They should be QA targets, not shared shell internals.

### Verixet Mobile Audit

Current mobile nav components:
- `apps/Verixet/src/components/dashboard/AppShell.tsx` owns the authenticated dashboard hamburger and drawer.
- `apps/Verixet/src/components/dashboard/DashboardShellNav.tsx` renders the desktop sidebar and is currently reused inside the mobile drawer.
- `apps/Verixet/src/components/marketing/MarketingHeader.tsx` owns a separate marketing mobile drawer and should remain separate from authenticated dashboard migration.

Current route links:
- Authenticated route config lives in `apps/Verixet/src/components/dashboard/verixet-navigation-shell-config.tsx`.
- Dashboard sections include Overview, Intelligence, Monitoring, Investigations, Operations, Admin, and Superadmin.
- Marketing route groups live inside `MarketingHeader.tsx` and are sitewide/marketing, not dashboard shell routes.

Current account/logout controls:
- Dashboard sidebar shows workspace name, user badge, and environment label. No direct logout control is present in the dashboard drawer surface inspected.
- Marketing mobile drawer has sign-in/sign-up actions and trust/legal links.

Current billing/pro controls:
- Dashboard config includes Billing under Admin.
- Marketing header includes Pricing and auth CTAs.

Current notifications:
- Dashboard routes include Alerts, Threats, Wallet Monitor, Payment Monitor, and related monitoring entries; no separate notification badge was found in the dashboard drawer shell.

Current command/tool controls:
- Dashboard `AppShell` places `commandBar` beside the hamburger. This command surface should remain local and outside the shared package.
- Verixet contextual command sidebars under `xflow-app-command` remain app-specific subnav/tool surfaces.

Current admin/internal controls:
- Workspace-admin and platform-operator visibility is handled by `createVerixetNavigationShellConfig` roles and local options.

Mobile dock behavior:
- No product bottom dock was found for authenticated dashboard navigation. Drawer currently mounts the full sidebar node in a mobile overlay.

Can shared `MobileNavDrawer` be used directly:
- Yes for the authenticated dashboard route list if Verixet supplies local header/footer slots and router link rendering. Direct use should not include the desktop sidebar wrapper node.
- No for `MarketingHeader`; that drawer is marketing/sitewide and should remain a separate future sitewide-nav pass.

Local wrapper required:
- Yes, but smaller than Crevux. Recommended component shape: `VerixetDashboardMobileNav`.
- It should render brand/workspace/account metadata locally, render the shared route list once, keep the command bar outside the drawer, and preserve role visibility from the current config.

Verixet recommendation:
- Migrate second after Crevux patterns are proven. Replace the current “reuse full sidebar inside drawer” approach with a dashboard-only mobile wrapper around the shared route list. Leave marketing mobile nav and contextual command sidebars out of scope.

### AudAiX Mobile Audit

Current mobile nav components:
- `apps/AudAiX/dashboard/src/layout/AudAixStudioShell.tsx` owns the authenticated studio layout.
- `apps/AudAiX/dashboard/src/components/navigation/AudAixStudioSidebar.tsx` renders the shared desktop route list and local tool subnavs.
- `apps/AudAiX/dashboard/src/components/navigation/SitewideNav.tsx` owns a separate mobile drawer for marketing and signed-in sitewide navigation.

Current route links:
- Studio route config lives in `apps/AudAiX/dashboard/src/components/navigation/audaix-navigation-shell-config.tsx`.
- Sitewide nav groups live inside `SitewideNav.tsx`, including Product, How it works, Ecosystem, Pricing, Security, Docs, and signed-in portfolio/tool shortcuts.

Current account/logout controls:
- Studio sidebar renders viewer identity, workspace role, site count/status, and a Manage sites action.
- Sitewide mobile drawer renders signed-in user chip and Sign out; anonymous state renders Founder, Sign in, and Get started.

Current billing/pro controls:
- App shell has access-gate checkout actions for add-app and bundle upgrade. Sitewide nav includes Pricing. Studio sidebar includes managed API key/webhook and workspace settings routes.

Current notifications:
- No dedicated notification badge was found in the inspected studio/sitewide mobile surfaces. Activity, reports, diagnostics, and system health are route entries.

Current command/tool controls:
- Studio sidebar renders local tool subnavs for Architecture Doctor, Architecture Scanner, and ASO Audit. These should remain a local command/tool slot.
- `AudAixStudioShell` owns workspace switching in its top module bar.

Current admin/internal controls:
- Studio config includes Admin / Developer routes and disabled workspace-dependent items. Role/account state is local to AudAiX workspace context.

Mobile dock behavior:
- No bottom dock was found for AudAiX studio nav. Mobile/sitewide drawer exists; authenticated studio mobile drawer is still deferred.

Can shared `MobileNavDrawer` be used directly:
- For authenticated studio route list: likely yes with a local wrapper and local tool-subnav slot.
- For `SitewideNav`: not directly, because it mixes marketing dropdown groups, ecosystem links, auth CTAs, signed-in shortcuts, account sign-out, and footer-like links.

Local wrapper required:
- Yes. Recommended component shapes: `AudAixStudioMobileNav` for authenticated studio, and a later `AudAixSitewideMobileNav` readiness pass only if sitewide nav is targeted.

AudAiX recommendation:
- Migrate third. Start with authenticated studio mobile route-list wrapper only. Keep `SitewideNav` as a separate sitewide-nav project because it has marketing and signed-in global app semantics beyond the shared app shell.

Safest migration order:
- 1. Crevux mobile wrapper audit -> adapter -> route-list wiring -> coexistence stabilization. It has the most complex control/dock surface and will define the slot discipline.
- 2. Verixet dashboard mobile wrapper. It is simpler and should remove the current full-sidebar drawer duplication after Crevux proves the route-list-only pattern.
- 3. AudAiX authenticated studio mobile wrapper. It should reuse the pattern while preserving local tool subnavs and workspace selector behavior.
- 4. AudAiX sitewide mobile nav, only as a separate sitewide/global navigation project.

Files likely to change in future implementation passes:
- Crevux: `apps/CreVux/artifacts/image-gen/src/components/dashboard/CrevuxUniversalMobileMenu.tsx`, `apps/CreVux/artifacts/image-gen/src/components/layout/crevux-navigation-shell-config.tsx`, `apps/CreVux/artifacts/image-gen/src/lib/crevuxAppNavigation.ts`, Crevux shared-nav/mobile tests, and relevant dashboard/studio CSS.
- Crevux coexistence QA only: `StudioMobileShell.tsx`, `MobileToolDock.tsx`, `VideoStudioMobileBottomBar.tsx`, and `VideoStudioMobileDockDrawer.tsx`.
- Verixet: `apps/Verixet/src/components/dashboard/AppShell.tsx`, `DashboardShellNav.tsx`, `verixet-navigation-shell-config.tsx`, `DashboardNav.test.tsx`, `dashboard-shell.test.ts`, and dashboard CSS.
- AudAiX studio: `apps/AudAiX/dashboard/src/layout/AudAixStudioShell.tsx`, `components/navigation/AudAixStudioSidebar.tsx`, `components/navigation/audaix-navigation-shell-config.tsx`, AppShell/studio sidebar tests, and navigation CSS.
- AudAiX sitewide later: `apps/AudAiX/dashboard/src/components/navigation/SitewideNav.tsx` and `SitewideNav.test.ts`.

Tests needed:
- Shared package: keep existing navigation-shell typecheck/tests green; add shared tests only if new exported slot/helper APIs are introduced.
- Crevux: unit tests that mobile wrapper renders shared route sections once, preserves density/Site Wiki/billing/logout/admin/internal controls, closes on route click, and does not render desktop shared sidebar markup in the drawer.
- Verixet: unit tests that dashboard mobile drawer renders the shared route list once, preserves workspace/account metadata, respects workspace-admin/platform-operator visibility, closes on route change/Escape/backdrop, and keeps command bar outside the drawer.
- AudAiX: unit tests that studio mobile wrapper renders shared route sections once, preserves workspace/account footer, disabled workspace-dependent routes, local tool subnav slot, and sitewide nav remains unchanged.
- Accessibility tests: trigger labels, `aria-expanded`, `aria-controls`, `aria-current`, `aria-disabled`, focus return, keyboard traversal, and 44px touch target assertions.

Browser QA checklist:
- Desktop shell still unchanged and visible only once.
- Mobile drawer opens from the app-owned trigger and closes on route click, Escape, backdrop, and route change.
- Body scroll locks while drawer is open and restores after close.
- Focus moves into drawer on open and returns to trigger on close.
- No duplicate desktop sidebar markup in mobile drawer.
- Shared route list highlights the active route and hides role-gated items correctly.
- Billing/pro/account/logout/admin/internal controls remain reachable where they existed before.
- App-specific command/tool controls still open their local panels and do not conflict with global drawer focus or scroll locks.
- Mobile bottom docks remain visible/usable when drawer is closed and do not create horizontal scroll.
- No hidden content under safe-area or bottom dock padding.
- No broken internal links, no invented routes, and no nav-related console errors.

Next implementation prompt:
- "Implement the Crevux mobile navigation wrapper only. Do not wire Verixet or AudAiX. Replace only the route-list portion of `CrevuxUniversalMobileMenu` with the shared route renderer using `createCrevuxNavigationShellConfig`, preserve all local Site Wiki, density, billing, admin/internal, current-controls, account/logout, and studio dock behavior, and add focused unit/browser QA for mobile drawer open/close, active routes, role visibility, focus return, scroll lock, no duplicate desktop nav, and no horizontal overflow."

## Crevux Mobile Wrapper Implementation

Date:
- 2026-06-21.

Scope:
- Crevux active web app only: `apps/CreVux/artifacts/image-gen`.
- Implemented the first safe mobile wrapper step without replacing the full mobile menu, without changing mobile docks/tool drawers, and without touching backend, auth, database, payment, business logic, lockfiles, installs, or other apps.

Insertion point used:
- `apps/CreVux/artifacts/image-gen/src/components/dashboard/CrevuxUniversalMobileMenu.tsx`.
- The route-list loops that previously rendered `getVisibleCrevuxNavItems(...)` directly were replaced with a shared `SidebarNav` route renderer inside the existing Crevux-owned dropdown wrapper.
- The outer trigger, dropdown content, account header, local action blocks, density controls, Site Wiki, billing, admin/internal switches, mode switch, notification badge, and logout controls remain local to Crevux.

Files changed:
- `apps/CreVux/artifacts/image-gen/src/components/dashboard/CrevuxUniversalMobileMenu.tsx`.
- `apps/CreVux/artifacts/image-gen/src/components/dashboard/CrevuxUniversalMobileMenu.shared-nav.test.tsx`.
- `apps/CreVux/artifacts/image-gen/src/components/layout/crevux-navigation-shell-config.tsx`.
- `apps/CreVux/artifacts/image-gen/src/components/layout/crevux-navigation-shell-config.test.tsx`.
- `docs/navigation-shell-audit.md`.

Shared components used:
- `NavigationShellStyles`.
- `SidebarNav`.
- Existing shared active matching and `aria-current` behavior through `@xflow-ecosystem/ecosystem-assistant-ui`.

Crevux-local controls preserved:
- Mobile menu trigger and notification count badge.
- Account email and plan label.
- Current studio controls entry.
- Site Wiki entry.
- Billing portal callback.
- Upgrade plan route/action.
- Admin dashboard entry.
- Public/internal studio mode switches.
- Internal ops/public app switches.
- Density controls and local display preference writes.
- Logout callback.

Routes included in the shared mobile route list:
- Existing mobile-safe Crevux navigation routes from `CREVUX_NAV_ITEMS`, grouped by Create, Workspace, Platform, and Account.
- Examples verified include `/app`, `/app/create`, `/app/create?view=animate`, `/app/create?view=projects`, `/app/builders`, and `/app/pro-settings`.
- Internal-only creation routes still depend on the existing `canAccessInternalStudio` gate.

Routes excluded from the shared mobile route list:
- Detached media popout: `/app/popout`.
- Local action routes that remain in Crevux controls rather than the route-list renderer: `/app/upgrade`, `/admin`, `/internal`, `/internal/ops`, and `/app/account/security`.
- Desktop-primary-only extras such as exports/admin entries are not injected into the mobile route-list section.

Mobile dock/tool drawer handling:
- `MobileToolDock`, `VideoStudioMobileBottomBar`, `VideoStudioMobileDockDrawer`, `StudioMobileShell`, and studio/create mobile controls remain siblings or separate local surfaces.
- The shared package does not own Crevux studio command actions or edge tool drawers.

Behavior preserved:
- Existing dropdown-based mobile menu UX remains in place for this pass; the shared `MobileNavDrawer` was not used because the current Crevux menu mixes route navigation with many local controls.
- Query/hash active matching is preserved by passing `pathname + search + hash` into `SidebarNav`.
- Detached popout routes remain outside the shared shell.
- No routes were added or removed.

Tests run:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.
- `pnpm -C apps/CreVux/artifacts/image-gen exec vitest run --config vitest.config.ts src/components/layout/crevux-navigation-shell-config.test.tsx src/components/dashboard/CrevuxAppHeader.shared-nav.test.ts src/components/dashboard/CrevuxUniversalMobileMenu.shared-nav.test.tsx`: passed, 14 tests.
- `pnpm -C apps/CreVux/artifacts/image-gen run test:unit`: passed, 31 files and 103 tests.
- `pnpm -C apps/CreVux/artifacts/image-gen run typecheck`: passed.
- `pnpm -C apps/CreVux/artifacts/image-gen run build`: passed.

Browser QA result:
- Not run in this pass. Existing Crevux local disposable browser QA remains the latest browser evidence for accepted desktop/mobile-dock boundary behavior.

Known issues:
- The wrapper still uses the current dropdown menu behavior, not the shared `MobileNavDrawer`; full drawer focus/scroll/backdrop QA remains a future pass if Crevux chooses to move from dropdown to drawer.
- The build continues to emit the existing Crevux/Vite warning that both esbuild and oxc options are configured; oxc takes precedence. This is not caused by the mobile wrapper change.

Manual QA still needed:
- Open the mobile menu on a real or Playwright mobile viewport.
- Confirm active route highlighting for query/hash create views.
- Confirm route click behavior matches the current dropdown UX.
- Confirm Site Wiki, billing, density, admin/internal, current controls, and logout remain reachable.
- Confirm mobile docks and edge tool drawers still work when the menu is closed.
- Confirm no horizontal scroll, hidden content, duplicate nav, or shared-nav console errors.

## Verixet Mobile Wrapper Implementation

Date:
- 2026-06-21.

Scope:
- Verixet authenticated dashboard shell only.
- Implemented the first safe mobile wrapper step without changing marketing/sitewide mobile nav, backend, auth, database, payment, business logic, lockfiles, installs, or other apps.

Insertion point used:
- `apps/Verixet/src/components/dashboard/AppShell.tsx`.
- The existing mobile drawer panel previously rendered the same full `sidebar` node used by the desktop sidebar.
- `AppShell` now accepts a Verixet-owned `mobileNav` slot and renders that slot inside `.ds-app-shell__drawer-panel`, while the desktop sidebar continues to render the original `sidebar` slot.
- `apps/Verixet/src/app/dashboard/(main)/layout.tsx` passes `VerixetMobileNavWrapper` as the mobile slot with the same workspace/admin/platform metadata used by `DashboardShellNav`.

Files changed:
- `apps/Verixet/src/components/dashboard/AppShell.tsx`.
- `apps/Verixet/src/components/dashboard/VerixetMobileNavWrapper.tsx`.
- `apps/Verixet/src/app/dashboard/(main)/layout.tsx`.
- `apps/Verixet/src/components/dashboard/DashboardNav.test.tsx`.
- `apps/Verixet/src/app/dashboard/dashboard.css`.
- `docs/navigation-shell-audit.md`.

Shared components used:
- `NavigationShellStyles`.
- `SidebarNav`.
- Existing Verixet adapter/config from `createVerixetNavigationShellConfig`.

Local controls and shell behavior preserved:
- Desktop sidebar behavior stays in `DashboardShellNav`.
- Desktop command bar remains outside the shared package and outside the mobile wrapper.
- Mobile hamburger/open state remains owned by `AppShell`.
- Backdrop/scrim close behavior remains owned by `AppShell`.
- Workspace/account metadata remains local in `VerixetMobileNavWrapper`.
- Workspace-admin and platform-operator visibility still flow through the existing Verixet config roles.
- Marketing/sitewide `MarketingHeader` mobile nav remains untouched.

Routes included:
- Same dashboard route config used by the desktop shared route list, including Overview, Intelligence, Monitoring, Investigations, Operations, Admin, and Superadmin sections.
- Role-gated routes remain hidden unless the same `includeWorkspaceAdminTools` and `includePlatformOperatorTools` flags are passed.

Routes excluded:
- No routes were invented.
- Contextual app-command sidebars, marketing/sitewide routes, and non-primary route quirks remain outside this mobile wrapper.

Mobile drawer behavior:
- The visual drawer shell, hamburger trigger, `aria-expanded` state, and backdrop close behavior are preserved.
- This pass did not introduce the shared `MobileNavDrawer` or alter Escape/focus behavior. Manual/browser QA should continue to document current mobile drawer behavior separately.
- The drawer now renders `data-verixet-shared-mobile-nav="true"` once and no longer mounts the full desktop `data-verixet-shared-sidebar-nav="true"` wrapper inside the drawer.

Tests run:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.
- `npm --prefix apps/Verixet test -- src/components/dashboard/DashboardNav.test.tsx src/components/dashboard/verixet-navigation-shell-config.test.tsx`: passed, 19 tests.
- `npm --prefix apps/Verixet run typecheck`: passed.
- `npm --prefix apps/Verixet run audit:dashboard`: passed.
- `npm --prefix apps/Verixet test`: passed, 578 files and 2143 tests; 3 files and 26 tests skipped.
- `npm --prefix apps/Verixet run build`: passed.

Browser QA result:
- Not run in this pass. Existing Verixet local disposable browser QA remains the latest accepted browser evidence for the desktop shared-nav surface. Mobile wrapper browser QA should use `output/playwright/verixet-mobile-wrapper-qa/` in a later local disposable QA pass.

Known issues:
- Existing build warnings remain unrelated unused-variable warnings in token scanner, command bar, marketing, dashboard query helpers, workspace helpers, and XFlow link helpers.
- Escape/focus/body-scroll behavior is still the current Verixet drawer behavior, not the shared `MobileNavDrawer` contract.

Manual QA still needed:
- Authenticated mobile dashboard loads.
- Hamburger opens the drawer.
- Mobile drawer renders the shared route list once.
- Desktop sidebar still renders once outside the drawer.
- Backdrop closes the drawer.
- Route links navigate correctly.
- Confirm whether route clicks close the drawer under current UX.
- Confirm Escape behavior under current UX.
- Workspace/account footer remains visible.
- Command bar remains outside the drawer and usable.
- No duplicate nav, horizontal scroll, hidden content, or shared-nav console errors.

## AudAiX Studio Mobile Wrapper Implementation

Date:
- 2026-06-21.

Scope:
- AudAiX authenticated studio shell only.
- Implemented the first safe studio mobile wrapper step without changing `SitewideNav`, marketing/public navigation, backend, auth, database, payment, business logic, lockfiles, installs, or other apps.

Insertion point used:
- `apps/AudAiX/dashboard/src/layout/AudAixStudioShell.tsx`.
- The existing shell previously rendered `AudAixStudioSidebar` for all viewports; mobile CSS changed that desktop sidebar into a full-width brand/account strip while hiding its route list.
- `AudAixStudioShell` now renders the unchanged desktop `AudAixStudioSidebar` plus a new app-owned `AudAixStudioMobileNavWrapper`.
- At the existing `980px` AudAiX studio breakpoint, CSS hides the desktop sidebar and shows the mobile wrapper so the mobile route list is rendered once.

Files changed:
- `apps/AudAiX/dashboard/src/components/navigation/AudAixStudioMobileNavWrapper.tsx`.
- `apps/AudAiX/dashboard/src/layout/AudAixStudioShell.tsx`.
- `apps/AudAiX/dashboard/src/components/navigation/audaix-navigation-shell-config.test.tsx`.
- `apps/AudAiX/dashboard/src/styles.css`.
- `docs/navigation-shell-audit.md`.

Shared components used:
- `NavigationShellStyles`.
- `SidebarNav`.
- Existing AudAiX adapter/config from `createAudAixNavigationShellConfig({ includeToolChildren: false })`.

Local controls preserved:
- Desktop/studio sidebar behavior remains in `AudAixStudioSidebar`.
- Workspace selector/top module bar remains in `AudAixStudioShell`.
- Account/workspace metadata remains AudAiX-owned in the desktop sidebar and mobile wrapper.
- Dashboard section callback behavior remains AudAiX-owned through `onSectionChange`.
- Nested Architecture Scanner, Architecture Doctor, and ASO Audit subnavs remain local conditional slots, not shared-package children in the live route list.
- Admin / Developer group remains visible and ungated through the existing config.
- `SitewideNav` remains separate and was not migrated.

Routes included:
- Same authenticated studio route config used by the desktop shared route list: Dashboard, Workspaces, Score Builder, Dependencies, Compliance, Evidence, Reports, Activity Logs, Settings, Diagnostics, API Keys, Webhooks, Integration Health, Architecture Scanner, Architecture Doctor, and ASO Audit.
- Settings and Integration Health continue to point at the workspace connections route when a workspace is selected and remain disabled when no workspace is selected.
- Dashboard section routes keep query-string active matching and preserve Dashboard plus section double-highlight behavior.

Routes excluded:
- No routes were invented.
- `SitewideNav` marketing/public/signed-in global routes remain outside this wrapper.
- Tool tab routes remain local subnav links instead of live shared-route children.

Mobile drawer behavior:
- The AudAiX-owned wrapper owns the hamburger trigger, `aria-expanded`/`aria-controls`, drawer/backdrop, Escape close, route-change close, body-scroll lock, initial focus movement into the drawer, and focus return to the trigger.
- Route clicks close the drawer through shared `SidebarNav` `onNavigate`; query-section links still call the AudAiX `onSectionChange` callback.
- Mobile touch targets for trigger, close button, shared route items, and local subnav links are at least 44px.

Tests run:
- `npm --prefix apps/AudAix/dashboard run test -- src/components/navigation/audaix-navigation-shell-config.test.tsx`: passed, 19 tests.
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.
- `npm --prefix apps/AudAix/dashboard run typecheck`: passed.
- `npm --prefix apps/AudAix/dashboard run test`: passed, 43 files and 233 tests.
- `npm --prefix apps/AudAix/dashboard run build`: passed.

Browser QA result:
- Not run in this pass. The request allowed browser QA only if safe; this pass did not start an AudAiX authenticated local browser environment. Use `output/playwright/audaix-studio-mobile-wrapper-qa/` for a later safe authenticated browser QA run.

Known issues:
- Root workspace git metadata still prevents `git -C K:\XFlow-Ecosystem Workspace status` and `git diff` from running; this is the previously documented workspace git metadata issue and was not changed in this pass.
- Human visual QA is still needed because automated tests verify structure and behavior but not final responsive polish.

Manual QA still needed:
- Authenticated studio route loads on a mobile viewport.
- Hamburger opens the studio drawer and focuses inside it.
- Escape and backdrop close the drawer and return focus to the trigger.
- Route clicks close the drawer and navigate correctly.
- Dashboard plus section double-highlight appears for query-section routes.
- Architecture Scanner, Architecture Doctor, and ASO Audit local subnavs appear only on their tool routes.
- Workspace/account metadata remains visible and readable.
- Desktop sidebar remains unchanged and visible once on desktop.
- `SitewideNav` public/mobile behavior remains unchanged.
- No duplicate nav, horizontal scroll, hidden content, or shared-nav console errors.

## AudAiX Studio Mobile Browser QA Results

Date:
- 2026-06-21.

Scope:
- AudAiX authenticated studio mobile wrapper QA only.
- No `SitewideNav` migration, production auth changes, backend/database/payment/business-logic changes, installs, lockfile changes, or route invention were performed.

Local QA target:
- Backend-served dashboard URL: `http://127.0.0.1:8787`.
- API URL: `http://127.0.0.1:8787`.
- Auth/session method: local e2e-safe AudAiX backend with `AUDAIX_AUTH_REQUIRED=false`; same-origin backend-served built dashboard; no production credentials.
- Backend probe passed with HTTP 200 and `authRequired: false`.
- Frontend probe passed with HTTP 200 and `text/html`.

Routes checked:
- Portfolio/reachability surfaces: `/dashboard`, `/dashboard?section=dependencies`, `/dashboard?section=project-architect`, `/dashboard?section=aso-audit`.
- Studio wrapper surfaces: `/project-architect?tab=safety`, `/architecture-doctor?tab=reports`, `/tools/aso-audit?tab=history`.

Accepted result:
- Browser QA accepted for the AudAiX studio mobile wrapper.
- The final QA run covered 12 desktop/mobile route states.
- Desktop studio routes rendered the shared route list once.
- Mobile studio routes rendered the AudAiX mobile wrapper before drawer open and the shared mobile route list once inside the drawer.
- Mobile drawer open, Escape close, backdrop close, route-click close, active studio route matching, local tool subnav visibility, focus return, and no-horizontal-scroll checks passed on the studio wrapper routes.
- Portfolio `/dashboard` and `/dashboard?section=*` routes are current portfolio `AppShell` surfaces and do not mount `AudAixStudioShell`; these were checked for reachability and no horizontal scroll only.

Issue found and fixed:
- The mobile account/footer `Manage sites` action was below the 44px minimum mobile touch target.
- Fixed in `apps/AudAiX/dashboard/src/styles.css` by adding `min-height: 44px` to `.audaix-studio-mobile-nav__account .audit-text-btn`.

Evidence:
- Result JSON: `output/playwright/audaix-studio-mobile-wrapper-qa/browser-qa-results.json`.
- Screenshot folder: `output/playwright/audaix-studio-mobile-wrapper-qa/`.
- Final accepted screenshot set includes desktop portfolio/studio captures, mobile portfolio/studio captures, and drawer-open captures for Architecture Scanner, Architecture Doctor, and ASO Audit.

Verification run after the CSS fix:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.
- `npm --prefix apps/AudAix/dashboard run typecheck`: passed.
- `npm --prefix apps/AudAix/dashboard run test`: passed, 43 files and 233 tests.
- `npm --prefix apps/AudAix/dashboard run build`: passed.

Known non-blocking warnings:
- Local browser QA observed existing 401 resource messages from assistant/auth-adjacent local API calls; these were not caused by the shared navigation wrapper.
- `SitewideNav` remains a separate deferred surface and was intentionally not migrated in this pass.
- Human visual review is still recommended using the screenshot folder above.

Cleanup status:
- The disposable failed Vite frontend on port `5179` and alternate AudAiX backend attempt on port `19410` were cleaned up after evidence capture.
- Pre-existing AudAiX local services on ports `8787` and `19399` were left untouched.

## Final Shared Navigation Shell and Mobile Wrapper Closeout

Date:
- 2026-06-21.

Scope:
- Final documentation and evidence closeout for the shared navigation shell rollout and the first mobile wrapper path.
- No runtime app behavior, backend, auth, database, payment, business logic, dependency install, lockfile, route, `SitewideNav`, or new mobile drawer wiring changes were made in this pass.

Final status table:

| App | Surface | Shared component used | Desktop status | Mobile status | Browser QA status | Evidence folder | Remaining follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- |
| WordGeni | Authenticated dashboard shell | Shared shell route rendering through the migrated WordGeni shell/config path | Partial accepted: `/dashboard` and `/dashboard/projects` reached with shared nav rendered | Partial; legacy/mobile behavior has known touch-target and route-surface caveats from authenticated QA | Partial authenticated QA evidence exists | `output/playwright/navigation-shell-authenticated-qa/` | Finish WordGeni mobile/a11y stabilization and any unresolved route-surface fixes in a dedicated pass |
| RatAiFy | Authenticated trust/dashboard shell | `NavigationShellStyles`, `SidebarNav`, RatAiFy config adapter | Accepted | Accepted for current authenticated local disposable QA scope | Accepted | `output/playwright/rataify-local-disposable-qa/` | Dependency cleanup: retire stale app-local shared package only after controlled install/link cleanup |
| XFlow | Authenticated dashboard shell | `NavigationShellStyles`, `SidebarNav`, XFlow config adapters | Accepted | Accepted for current authenticated local disposable QA scope | Accepted | `output/playwright/xflow-local-disposable-qa/` | Dependency cleanup: resolve npm/pnpm mixed lockfile ownership separately |
| Crevux | Authenticated `/app` product shell and mobile dropdown route list | `NavigationShellStyles`, `SidebarNav`, Crevux config adapter inside Crevux-owned wrapper | Accepted | Accepted for existing Crevux-owned mobile dropdown wrapper; not a shared `MobileNavDrawer` migration | Accepted | `output/playwright/crevux-local-disposable-qa/` | Future optional drawer redesign only if product chooses to replace the dropdown UX |
| Verixet | Authenticated dashboard shell and Verixet-owned mobile drawer route list | `NavigationShellStyles`, `SidebarNav`, Verixet config adapter and mobile wrapper slot | Accepted | Accepted for local disposable QA scope; mobile drawer remains Verixet-owned | Accepted | `output/playwright/verixet-local-disposable-qa/` | Dependency cleanup: installed link still needs controlled rebuild; keep production DB guards intact |
| AudAiX | Studio sidebar and studio mobile wrapper | `NavigationShellStyles`, `SidebarNav`, AudAiX config adapter and AudAiX-owned mobile drawer | Accepted | Accepted for studio mobile wrapper | Accepted | `output/playwright/audaix-studio-mobile-wrapper-qa/` | `SitewideNav` readiness/design pass remains separate |

Accepted app surfaces:
- RatAiFy authenticated trust/dashboard shell.
- XFlow authenticated dashboard shell.
- Crevux authenticated `/app` product shell and current mobile dropdown route-list wrapper.
- Verixet authenticated dashboard shell and Verixet-owned mobile drawer route-list wrapper.
- AudAiX studio desktop/sidebar and AudAiX-owned studio mobile wrapper.

Partial app surfaces:
- WordGeni authenticated dashboard QA reaches `/dashboard` and `/dashboard/projects` with shared nav rendered, but remains partial because the older authenticated QA captured mobile/touch-target and route-surface caveats.
- AudAiX portfolio `/dashboard` surfaces are reachable but are not the studio shell; they were checked as portfolio reachability/no-horizontal-scroll surfaces during the AudAiX mobile wrapper QA.

Deferred surfaces:
- AudAiX `SitewideNav` remains a separate sitewide/mobile nav project.
- Marketing/public/global navigation redesign remains out of scope.
- Contextual tool rails and app-specific command bars remain app-owned slots.
- Any conversion from app-owned mobile wrappers/dropdowns to shared `MobileNavDrawer` remains a future per-app audit, adapter, wiring, stabilization, and browser QA project.

Browser QA evidence locations:
- RatAiFy: `output/playwright/rataify-local-disposable-qa/browser-qa-results.json`, plus 6 screenshots.
- XFlow: `output/playwright/xflow-local-disposable-qa/browser-qa-results.json`, plus 9 screenshots.
- Crevux: `output/playwright/crevux-local-disposable-qa/browser-qa-results.json`, plus 17 screenshots.
- Verixet: `output/playwright/verixet-local-disposable-qa/browser-qa-results.json`, plus desktop/mobile screenshots and local DB logs in the same folder.
- AudAiX studio mobile: `output/playwright/audaix-studio-mobile-wrapper-qa/browser-qa-results.json`, plus 36 screenshots.
- WordGeni/shared authenticated QA: `output/playwright/navigation-shell-authenticated-qa/results.json`, plus 12 cross-app screenshots including WordGeni and AudAiX studio captures.

Automated verification summary:
- Shared package checks were run again in this closeout pass:
  - `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
  - `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.
- Earlier app-specific verification remains recorded in the app sections above. Full app builds were not rerun in this pass because only documentation was changed.

Manual visual review checklist:
- Review the app-by-app screenshot folders listed above.
- Confirm desktop sidebars render once and align with the accepted app shell.
- Confirm mobile wrappers render the route list once and preserve local account/workspace/actions.
- Confirm active route highlights match the current route and query/tab state.
- Confirm drawers/dropdowns do not create horizontal scroll or hidden content.
- Confirm Escape, backdrop, route-click, and focus-return behavior for apps that own those behaviors.
- Confirm role/admin/workspace visibility remains correct.
- Confirm no user-visible console errors are introduced by shared navigation.

Remaining follow-up:
- Recommended next project: AudAiX `SitewideNav` readiness/design pass.
- Dependency/lockfile cleanup remains tracked in `docs/dependency-resolution-audit.md`; do not run broad installs or lockfile rewrites until root git metadata and package-manager ownership are resolved.
- Root workspace git metadata remains unresolved: the workspace root still reports `fatal: not a git repository` in prior checks, so broad dirty-state and lockfile review should be done in a repaired or clean clone.

No-production-data-touch confirmation:
- No hosted database was seeded.
- No production credentials were used.
- No production auth behavior was changed.
- No backend/database/payment/business logic was changed.
- No evidence files were deleted or regenerated in this closeout pass.

## AudAiX SitewideNav Readiness and Design

Date:
- 2026-06-21.

Scope:
- Readiness and design audit for AudAiX public/sitewide/global navigation only.
- AudAiX authenticated studio sidebar and studio mobile wrapper remain complete enough for the current shared navigation shell rollout and were not changed.
- No runtime wiring, backend, auth, database, payment, business logic, dependency install, lockfile, route invention, or shared `AppShell` usage was added in this pass.

Files inspected:
- `apps/AudAix/dashboard/src/components/navigation/SitewideNav.tsx`.
- `apps/AudAix/dashboard/src/components/navigation/SitewideNav.test.ts`.
- `apps/AudAix/dashboard/src/layout/AppShell.tsx`.
- `apps/AudAix/dashboard/src/App.tsx`.
- `apps/AudAix/dashboard/src/lib/appPaths.ts`.
- `apps/AudAix/dashboard/src/styles.css`.
- `docs/navigation-shell-audit.md`.
- `docs/local-navigation-qa.md`.

Current SitewideNav behavior:
- `AppShell` renders `SitewideNav` only when `isAuthenticatedStudioPath(location.pathname)` is false.
- Authenticated studio paths continue into `AudAixStudioShell` instead of the sitewide top nav.
- The sitewide header is sticky, brand-led, and public/marketing oriented.
- Brand link routes to `/dashboard` when signed in and `/` when signed out.
- The ecosystem version pill links externally to `https://xflowx.com/apps?source=ecosystem-version`.
- `SiteFooter` remains coupled with the public/sitewide layout and is not part of the shared authenticated app shell.

Public route inventory:
- Product group:
  - `/product`
  - `/product#audits`
  - `/product#reports`
  - `/demo`
  - `/examples`
  - `/product#automation`
  - `/product#monitoring`
  - `/product#copilot`
- How it works group:
  - `/product#builders`
  - `/product#solo-founders`
  - `/product#agencies`
  - `/product#saas-platforms`
- Ecosystem group:
  - `/ecosystem#audaix`
  - `/ecosystem#verixet`
  - `/ecosystem#XFlow`
  - `/ecosystem#Rataify`
  - `/ecosystem#flow`
- Pricing group:
  - `/pricing`
- Security group:
  - `/security`
  - `/security-model`
  - `/system-health`
  - `/status`
- Docs group:
  - `/docs#api-overview`
  - `/docs#webhooks`
  - `/architecture`
  - `/case-study`
  - `/audit-engine`
  - `/security-model`
  - `/billing-authority`
  - `/runbook`
  - `/test-coverage`
  - `/system-health`
  - `/status`
  - `/changelog`

Signed-in sitewide route inventory:
- `/dashboard?section=overview`.
- `/dashboard?section=launchpad`.
- `/dashboard?section=operations`.
- `/dashboard?section=ecosystem`.
- `/project-architect`.
- `/architecture-doctor`.
- `/dashboard/security`.
- `https://xflowx.com/community?app=audaix`.

External links:
- `https://xflowx.com/apps?source=ecosystem-version`.
- `https://xflowx.com`.
- `https://verixet.com`.
- `https://rataify.com`.
- `https://wordgeni.com`.
- `https://crevux.com`.
- `https://xflowx.com/community?app=audaix`.
- `https://xflowx.com/founder`.
- Central auth URLs from `buildAudAixCentralAuthUrl({ mode: "signin" })` and `buildAudAixCentralAuthUrl({ mode: "signup" })`.

Auth, account, and CTA behavior:
- Signed-out desktop actions show Founder, Sign in, and Get started.
- Signed-out mobile actions show Founder, Sign in, and Get started inside the drawer.
- Signed-in desktop actions show a local user chip and Sign out button.
- Signed-in mobile actions show a local user chip and Sign out button.
- `onSignOut` remains app-owned and is passed from `AppShell` through `useAuthSession().signOut`.
- Display name and email come from local session/ecosystem session state in `AppShell`, not from the shared navigation package.
- No role-gated public nav behavior was found in `SitewideNav`; the primary branch is `signedIn`.

Mobile drawer behavior:
- The mobile trigger uses `aria-label="Open navigation"`, `aria-expanded`, and `aria-controls="audaix-mobile-navigation"`.
- The drawer uses `id="audaix-mobile-navigation"` and `.sitewide-mobile-nav-drawer`.
- The drawer closes on path/search changes.
- The drawer closes on Escape.
- The backdrop closes the drawer.
- Body scroll is locked while the drawer is open and restored on cleanup.
- Focus returns to the hamburger trigger when the drawer closes.
- Signed-out mobile drawer renders public dropdown groups, ecosystem app links, and auth CTAs.
- Signed-in mobile drawer renders workspace shortcuts, account chip, and sign-out action.
- CSS uses the current AudAiX sitewide visual system, right-side drawer placement, safe-area inset padding, and app-owned classes.

Active route behavior:
- Signed-in dashboard section links parse `search` and mark the matching `/dashboard?section=*` item active with `aria-current="page"`.
- Signed-in non-section internal links use React Router `NavLink` active matching.
- External signed-in Community link has no app active state.
- Signed-out public dropdown links do not currently apply per-route active state; they are marketing dropdown items.

Marketing/sitewide-only pieces:
- Public dropdown group structure.
- Ecosystem app link catalog and labels.
- Ecosystem version/update link.
- Founder link.
- Central auth sign-in/sign-up CTAs.
- Sitewide mobile drawer structure and CTAs.
- `SiteFooter` public/footer links.
- Brand lockup/top-nav presentation.

Overlap with studio nav:
- Signed-in SitewideNav includes shortcuts to `/dashboard`, `/project-architect`, `/architecture-doctor`, and `/dashboard/security`, which overlap conceptually with the studio shell.
- This overlap is not a reason to merge configs: SitewideNav is a global top-nav entry surface, while studio nav is the authenticated working shell with workspace/account/tool context.
- Public/sitewide nav must not import the authenticated studio config, and studio nav must not import public marketing groups.

Shared/local boundary decision:
- SitewideNav should stay fully local for now.
- Do not use shared `AppShell` for SitewideNav.
- Do not use shared `MobileNavDrawer` for SitewideNav; its behavior is marketing/public-specific and includes ecosystem links, auth CTAs, signed-in shortcuts, account actions, and footer-like mobile content.
- Shared package use, if any, should be limited to a future route-list renderer only after a local public-nav config adapter is extracted and tested.
- The preferred future adapter should live under AudAiX, for example `apps/AudAix/dashboard/src/components/navigation/audaix-sitewide-navigation-config.ts`, and should remain public/sitewide-specific.
- Auth CTAs, ecosystem links, account menu, sign-out, mobile drawer state, branding, and footer behavior should remain local slots or local rendering logic.

Runtime wiring decision:
- Runtime wiring is deferred.
- No config extraction was added in this pass because an unused adapter would create a second source of truth, and wiring a live adapter would require more route/account/mobile regression coverage than this readiness pass should introduce.

Proposed future implementation sequence:
1. Add focused SitewideNav tests that assert the full public dropdown groups, signed-in route list, external ecosystem links, central auth CTA href shape, account/sign-out controls, and mobile drawer route inventory.
2. Extract `NAV_GROUPS`, `ECOSYSTEM_LINKS`, `SIGNED_IN_NAV_ITEMS`, ecosystem version metadata, and public CTA metadata into an AudAiX-local sitewide config adapter.
3. Update `SitewideNav` to consume only the local adapter without changing markup, class names, active matching, or mobile drawer state.
4. Run AudAiX dashboard typecheck, tests, build, and focused SitewideNav tests.
5. Run browser QA for signed-out desktop/mobile public nav and signed-in desktop/mobile sitewide nav, separate from the studio mobile wrapper QA.
6. Consider a shared route-list renderer only if the extracted config still maps cleanly to shared route item primitives without moving auth/account/ecosystem/mobile behavior into the shared package.

Files likely to change in a future implementation pass:
- `apps/AudAix/dashboard/src/components/navigation/SitewideNav.tsx`.
- `apps/AudAix/dashboard/src/components/navigation/SitewideNav.test.ts`.
- `apps/AudAix/dashboard/src/components/navigation/audaix-sitewide-navigation-config.ts`.
- `apps/AudAix/dashboard/src/components/navigation/audaix-sitewide-navigation-config.test.ts`.
- `apps/AudAix/dashboard/src/styles.css` only if mobile/sitewide touch-target or layout issues are found.
- `docs/navigation-shell-audit.md`.

Tests needed in a future implementation pass:
- Public dropdown labels and hrefs match current `SitewideNav`.
- Signed-in shortcut labels and hrefs match current `SitewideNav`.
- External ecosystem links preserve target URLs and current-app metadata.
- Founder, Sign in, and Get started remain local public CTAs.
- Signed-in user chip and Sign out remain local account behavior.
- Mobile drawer renders public groups when signed out and workspace shortcuts when signed in.
- Mobile drawer keeps close-on-route-change, Escape close, backdrop close, body-scroll lock, and focus-return behavior.
- Studio routes/config are not imported into the public/sitewide config.
- No invented routes are introduced.

Browser QA checklist for a future pass:
- Signed-out desktop `/`, `/product`, `/ecosystem`, `/pricing`, `/docs`, `/security`.
- Signed-out mobile drawer opens/closes by button, Escape, backdrop, and route click.
- Signed-out mobile drawer shows public groups, ecosystem links, Founder, Sign in, and Get started.
- Signed-in desktop non-studio shell shows dashboard section shortcuts, user chip, and Sign out.
- Signed-in mobile drawer shows workspace shortcuts, account chip, and Sign out.
- `/dashboard?section=overview`, `/dashboard?section=launchpad`, `/dashboard?section=operations`, and `/dashboard?section=ecosystem` active states are correct when SitewideNav is visible.
- Studio routes still do not render SitewideNav and continue using `AudAixStudioShell`.
- No duplicate nav landmarks, horizontal scroll, hidden drawer content, broken internal links, or new console errors.

Verification for this readiness pass:
- Shared package checks only; no AudAiX app build is required because only documentation changed.

## AudAiX SitewideNav Local Config Extraction

Date:
- 2026-06-21.

Scope:
- AudAiX SitewideNav test coverage and AudAiX-local config extraction.
- No WordGeni, XFlow, RatAiFy, Crevux, Verixet, backend, auth, database, payment, business logic, dependency install, lockfile rewrite, route invention, shared `AppShell`, shared `MobileNavDrawer`, shared `SidebarNav`, or studio-nav merge changes were made.

Files changed:
- `apps/AudAix/dashboard/src/components/navigation/audaix-sitewide-navigation-config.ts`.
- `apps/AudAix/dashboard/src/components/navigation/audaix-sitewide-navigation-config.test.ts`.
- `apps/AudAix/dashboard/src/components/navigation/SitewideNav.tsx`.
- `apps/AudAix/dashboard/src/components/navigation/SitewideNav.test.ts`.
- `docs/navigation-shell-audit.md`.

Config extracted:
- Extracted the SitewideNav route/data constants into `audaix-sitewide-navigation-config.ts`.
- `SitewideNav.tsx` now reads route lists, ecosystem links, version link metadata, founder URL, community URL, external-link detection, and dashboard-section active matching from the local config.
- Runtime behavior is intentionally unchanged: SitewideNav still owns the shell, branding, auth CTAs, account/sign-out controls, mobile drawer state, body-scroll lock, Escape handling, route-change close behavior, backdrop close behavior, focus return, and all CSS classes/markup.
- No shared package primitives were introduced.

Routes included in the local config:
- Public Product routes: `/product`, `/product#audits`, `/product#reports`, `/demo`, `/examples`, `/product#automation`, `/product#monitoring`, `/product#copilot`.
- Public How it works routes: `/product#builders`, `/product#solo-founders`, `/product#agencies`, `/product#saas-platforms`.
- Public Ecosystem routes: `/ecosystem#audaix`, `/ecosystem#verixet`, `/ecosystem#XFlow`, `/ecosystem#Rataify`, `/ecosystem#flow`.
- Public Pricing route: `/pricing`.
- Public Security routes: `/security`, `/security-model`, `/system-health`, `/status`.
- Public Docs routes: `/docs#api-overview`, `/docs#webhooks`, `/architecture`, `/case-study`, `/audit-engine`, `/security-model`, `/billing-authority`, `/runbook`, `/test-coverage`, `/system-health`, `/status`, `/changelog`.
- Signed-in sitewide shortcuts: `/dashboard?section=overview`, `/dashboard?section=launchpad`, `/dashboard?section=operations`, `/dashboard?section=ecosystem`, `/project-architect`, `/architecture-doctor`, `/dashboard/security`, and `https://xflowx.com/community?app=audaix`.
- Ecosystem/version links: `https://xflowx.com/apps?source=ecosystem-version`, `https://xflowx.com`, `https://verixet.com`, `/ecosystem`, `https://rataify.com`, `https://wordgeni.com`, `https://crevux.com`, `https://xflowx.com/founder`.

Routes and behavior excluded:
- No new public routes were introduced.
- `/score-builder`, `/tools/aso-audit`, workspace detail routes, site detail routes, and other authenticated studio-shell-only routes were not added to the SitewideNav config.
- Auth implementation, account action handlers, sign-out logic, branding JSX, mobile drawer state, and footer rendering remain outside the config.
- The authenticated studio navigation config remains separate and is not imported by SitewideNav config.

Tests added or expanded:
- Added `audaix-sitewide-navigation-config.test.ts` to pin public groups, signed-in shortcuts, external ecosystem/version links, dashboard-section active matching, no shared shell imports, and no studio config imports.
- Expanded `SitewideNav.test.ts` to cover signed-out public rendering, signed-in shortcut rendering, local desktop/mobile sign-out behavior, public mobile drawer open/close, Escape close, backdrop close, route-change close, route-click close, dashboard-section active state, external Community link preservation, and exclusion of unrelated studio routes.
- Focused SitewideNav/config verification passed: `npm --prefix apps/AudAix/dashboard run test -- src/components/navigation/SitewideNav.test.ts src/components/navigation/audaix-sitewide-navigation-config.test.ts`, 2 files and 12 tests passed.

Verification results:
- `npm --prefix packages/ecosystem-assistant-ui run typecheck`: passed.
- `npm --prefix packages/ecosystem-assistant-ui test`: passed, 8 tests.
- `npm --prefix apps/AudAix/dashboard run typecheck`: passed.
- `npm --prefix apps/AudAix/dashboard run test`: passed, 44 files and 242 tests.
- `npm --prefix apps/AudAix/dashboard run build`: passed.

Future shared route-list decision:
- SitewideNav is now ready for a later evaluation of a shared route-list renderer, but not for an automatic renderer swap.
- The next pass should compare the extracted public/signed-in config with shared route item primitives and proceed only if the renderer can preserve current markup, CSS classes, auth/account slots, ecosystem links, mobile drawer behavior, and public marketing semantics.
- Shared `AppShell` and shared `MobileNavDrawer` remain inappropriate for SitewideNav unless the product intentionally redesigns the public/sitewide navigation system.

## AudAiX SitewideNav Config Stabilization and Browser QA

Date:
- 2026-06-21.

Scope:
- AudAiX `SitewideNav` local config extraction stabilization and browser QA.
- No WordGeni, XFlow, RatAiFy, Crevux, Verixet, backend, auth, database, payment, business logic, dependency install, lockfile rewrite, route invention, shared `AppShell`, shared `MobileNavDrawer`, shared `SidebarNav`, or studio-nav merge changes were made.

Files changed:
- `docs/navigation-shell-audit.md`.

Config stabilization result:
- No extraction regression was found in the local config adapter or `SitewideNav` wiring.
- No runtime app behavior changes were required.
- Focused SitewideNav/config tests were rerun and passed.
- The browser QA run used only local Playwright fixtures for AudAiX auth probes: signed-out `/api/ecosystem/session` returned JSON `null`, signed-in `/api/ecosystem/session` returned a local fake ecosystem session, and `/v1/auth/logout` returned a local 204 response. No production credentials or hosted services were used.

Routes checked:
- Signed-out desktop: `/`, `/product`, `/ecosystem`, `/pricing`, `/docs`, `/security`.
- Signed-out mobile: `/product` drawer open, Escape close, and internal route click to `/pricing`.
- Signed-in desktop fixture: `/product`.
- Signed-in mobile fixture: `/product` drawer open and Escape close.
- Signed-in mobile route-click close handler: `/dashboard?section=operations`.

Signed-out behavior verified:
- Public nav groups render: Product, How it works, Ecosystem, Pricing, Security, Docs.
- Founder, Sign in, and Get started CTAs remain present.
- Ecosystem/version links preserve the expected external destinations.
- Signed-in account controls remain absent.
- No horizontal scroll was detected in the checked desktop/mobile states.

Signed-in behavior verified:
- Workspace shortcuts render: Overview, Launchpad, Operations, Ecosystem, Architect, Architecture Doctor, RiskRadar, Community.
- Local fixture account chip renders `sitewide-nav-qa@example.local`.
- Sign out action renders.
- Public dropdown groups remain absent in the signed-in shortcut state.
- The signed-in dashboard shortcut close assertion confirmed the local drawer click handler closes the drawer and routes to `/dashboard?section=operations` without waiting for the destination studio shell.

Mobile drawer behavior verified:
- Mobile drawer opens from the labelled hamburger button.
- Escape closes public and signed-in drawers.
- Public internal route click closes the drawer.
- Signed-in route click close handler closes the drawer.
- Drawer screenshots were captured for public and signed-in states.

Browser QA result:
- Accepted.
- Required result file: `output/playwright/audaix-sitewide-nav-qa/browser-qa-results.json`.
- Evidence folder: `output/playwright/audaix-sitewide-nav-qa/`.
- Screenshots captured: `public-desktop-product.png`, `public-mobile-drawer-open.png`, `signed-in-desktop-product.png`, `signed-in-mobile-drawer-open.png`, plus focused probe screenshots for public/signed-in desktop/mobile.

Known issues:
- None blocking for SitewideNav config extraction.
- Signed-in SitewideNav browser checks intentionally use a local ecosystem-session fixture on public pages. Dashboard section active matching remains unit-tested because dashboard/studio routes mount the studio shell rather than the public `SitewideNav`.

Future shared route-list decision:
- Shared route-list renderer evaluation remains optional and should be a separate pass.
- Do not move SitewideNav auth/account controls, ecosystem links, branding, mobile drawer state, or marketing-specific drawer content into the shared package unless the product intentionally redesigns the sitewide navigation system.

## Master Navigation Sidebar Closeout

Date:
- 2026-06-21.

Scope:
- Final master closeout for the shared navigation/sidebar rollout.
- No runtime app behavior, backend, auth, database, payment, business logic, dependency install, lockfile rewrite, route invention, new nav surface wiring, or evidence deletion was performed in this pass.

Final accepted surfaces:

| App | Accepted surface | Status | Evidence |
| --- | --- | --- | --- |
| RatAiFy | Authenticated shell | Accepted | `output/playwright/rataify-local-disposable-qa/browser-qa-results.json` and screenshots in `output/playwright/rataify-local-disposable-qa/` |
| XFlow | Authenticated shell | Accepted | `output/playwright/xflow-local-disposable-qa/browser-qa-results.json` and screenshots in `output/playwright/xflow-local-disposable-qa/` |
| Crevux | Authenticated shell and mobile wrapper | Accepted | `output/playwright/crevux-local-disposable-qa/browser-qa-results.json` and screenshots in `output/playwright/crevux-local-disposable-qa/` |
| Verixet | Authenticated shell and mobile wrapper | Accepted | `output/playwright/verixet-local-disposable-qa/browser-qa-results.json` and screenshots in `output/playwright/verixet-local-disposable-qa/` |
| AudAiX | Studio desktop/sidebar | Accepted | `output/playwright/navigation-shell-authenticated-qa/results.json` and AudAiX screenshots in `output/playwright/navigation-shell-authenticated-qa/` |
| AudAiX | Studio mobile wrapper | Accepted | `output/playwright/audaix-studio-mobile-wrapper-qa/browser-qa-results.json` and screenshots in `output/playwright/audaix-studio-mobile-wrapper-qa/` |
| AudAiX | SitewideNav local config extraction and browser QA | Accepted | `output/playwright/audaix-sitewide-nav-qa/browser-qa-results.json` and screenshots in `output/playwright/audaix-sitewide-nav-qa/` |

Partial surfaces:

| App | Surface | Status | Evidence |
| --- | --- | --- | --- |
| WordGeni | Authenticated shell | Partial accepted | `output/playwright/navigation-shell-authenticated-qa/results.json` plus `/dashboard` and `/dashboard/projects` screenshots in `output/playwright/navigation-shell-authenticated-qa/` |

Deferred or separate projects:
- WordGeni full browser QA remains optional if 100% route coverage is required beyond `/dashboard` and `/dashboard/projects`.
- Dependency/lockfile cleanup remains a separate project. See `docs/dependency-resolution-audit.md`.
- Root Git metadata repair remains a separate repository maintenance project. The dependency audit records that `K:\XFlow-Ecosystem Workspace\.git` exists as an empty directory and root `git status`/`git rev-parse --show-toplevel` fail.
- Optional future shared route-list renderer evaluation for AudAiX `SitewideNav` remains separate. Do not start it as part of this navigation runtime rollout.

Browser evidence inventory:
- RatAiFy local disposable QA: `output/playwright/rataify-local-disposable-qa/`.
- XFlow local disposable QA: `output/playwright/xflow-local-disposable-qa/`.
- Crevux local disposable QA: `output/playwright/crevux-local-disposable-qa/`.
- Verixet local disposable QA: `output/playwright/verixet-local-disposable-qa/`.
- AudAiX studio mobile wrapper QA: `output/playwright/audaix-studio-mobile-wrapper-qa/`.
- AudAiX SitewideNav QA: `output/playwright/audaix-sitewide-nav-qa/`.
- WordGeni/shared authenticated QA: `output/playwright/navigation-shell-authenticated-qa/`.

Automated verification summary:
- Shared package typecheck and tests have passed repeatedly throughout the rollout.
- App-level checks were run in the app-specific migration and stabilization passes and are recorded in the preceding sections of this audit.
- This master closeout pass only reruns shared package verification because it does not change runtime app code.

Package/dependency known issues:
- XFlow has mixed npm/pnpm lock metadata and previously recorded npm/arborist package-lock-only concerns.
- RatAiFy, Verixet, AudAiX, WordGeni, and Crevux have documented stale or local `@xflow-ecosystem/ecosystem-assistant-ui` copies or installed-link caveats.
- Do not run broad installs or lockfile rewrites as part of navigation work. Use `docs/dependency-resolution-audit.md` as the starting point for a dedicated cleanup pass.

Stop-point recommendation:
- Stop runtime navigation/sidebar work here.
- The shared navigation/sidebar rollout is complete enough for the accepted authenticated shells, mobile wrappers, and AudAiX SitewideNav config extraction.
- Further work should move to dependency/lockfile cleanup, root Git metadata repair, or optional WordGeni full browser QA as separate projects.
- Dependency cleanup is now tracked separately in `docs/dependency-resolution-audit.md`; runtime navigation work remains closed and should not be reopened for package-manager or root Git repair tasks.
