import test from "node:test";
import assert from "node:assert/strict";

import { appRouteContracts, routesForPersonaApp } from "./authenticated-persona-security-simulation.mjs";

const audAix = { app: "AudAiX", slug: "audaix" };
const wordGeni = { app: "WordGeni", slug: "wordgeni" };
const verixet = { app: "Verixet", slug: "verixet" };
const crevux = { app: "CreVux", slug: "crevux" };
const xflow = { app: "XFlow", slug: "xflow" };

test("XFlow route contract uses real XFlow routes and keeps platform-only aliases denied", () => {
  assert.deepEqual(appRouteContracts.xflow.normal_user.expectedAllowed, ["/overview", "/account/security", "/api/ecosystem/session"]);
  assert.ok(appRouteContracts.xflow.normal_user.expectedDenied.includes("/api/auth/me"));
  assert.deepEqual(appRouteContracts.xflow.workspace_admin.expectedAllowed, ["/overview", "/account/billing", "/settings"]);
  assert.ok(appRouteContracts.xflow.workspace_admin.expectedDenied.includes("/api/workspaces/active"));
  assert.deepEqual(appRouteContracts.xflow.app_admin.expectedAllowed, ["/overview"]);
  assert.ok(appRouteContracts.xflow.app_admin.expectedDenied.includes("/admin"));
  assert.ok(appRouteContracts.xflow.superadmin.expectedDenied.includes("/platform"));
  assert.ok(appRouteContracts.xflow.superadmin.expectedDenied.includes("/api/platform/v1/subscriptions/summary"));
});

test("AudAiX route contract uses real product routes instead of generic admin/platform expectations", () => {
  assert.deepEqual(appRouteContracts.audaix.normal_user.expectedAllowed, ["/dashboard", "/v1/auth/session"]);
  assert.ok(appRouteContracts.audaix.normal_user.expectedDenied.includes("/api/auth/me"));
  assert.ok(appRouteContracts.audaix.workspace_admin.expectedAllowed.includes("/v1/workspaces"));
  assert.ok(!appRouteContracts.audaix.workspace_admin.expectedAllowed.includes("/v1/workspaces/{workspaceId}/plan-usage"));
  assert.ok(appRouteContracts.audaix.workspace_admin.expectedDenied.includes("/api/workspaces/active"));
  assert.deepEqual(appRouteContracts.audaix.superadmin.expectedAllowed, []);
  assert.ok(appRouteContracts.audaix.superadmin.expectedDenied.includes("/platform"));
  assert.ok(appRouteContracts.audaix.support_admin.expectedDenied.includes("/api/admin/support/conversations"));
  assert.ok(appRouteContracts.audaix.security_admin.expectedDenied.includes("/api/admin/system-status"));
});

test("AudAiX route contract overrides generic persona routes without changing other apps", () => {
  const genericPersona = {
    key: "normal_user",
    expectedAllowed: ["/dashboard", "/account", "/api/auth/me", "/api/ecosystem/session"],
    expectedDenied: ["/admin"],
  };

  const audAixRoutes = routesForPersonaApp(genericPersona, audAix);
  assert.deepEqual(audAixRoutes.expectedAllowed, ["/dashboard", "/v1/auth/session"]);
  assert.ok(audAixRoutes.expectedDenied.includes("/api/auth/me"));

  const xflowRoutes = routesForPersonaApp(genericPersona, xflow);
  assert.deepEqual(xflowRoutes.expectedAllowed, ["/overview", "/account/security", "/api/ecosystem/session"]);
  assert.ok(xflowRoutes.expectedDenied.includes("/api/auth/me"));
});

test("WordGeni route contract uses real dashboard routes and keeps admin/platform denied", () => {
  assert.deepEqual(appRouteContracts.wordgeni.normal_user.expectedAllowed, ["/dashboard"]);
  assert.ok(appRouteContracts.wordgeni.normal_user.expectedDenied.includes("/api/auth/me"));
  assert.ok(appRouteContracts.wordgeni.normal_user.expectedDenied.includes("/api/ecosystem/session"));
  assert.deepEqual(appRouteContracts.wordgeni.workspace_admin.expectedAllowed, ["/dashboard"]);
  assert.ok(appRouteContracts.wordgeni.workspace_admin.expectedDenied.includes("/settings/billing"));
  assert.ok(appRouteContracts.wordgeni.workspace_admin.expectedDenied.includes("/api/workspaces/active"));
  assert.deepEqual(appRouteContracts.wordgeni.support_admin.expectedAllowed, ["/dashboard"]);
  assert.ok(appRouteContracts.wordgeni.support_admin.expectedDenied.includes("/admin/support"));
  assert.deepEqual(appRouteContracts.wordgeni.superadmin.expectedAllowed, ["/dashboard"]);
  assert.ok(appRouteContracts.wordgeni.superadmin.expectedDenied.includes("/superadmin"));
});

test("WordGeni route contract overrides generic allowed routes for WordGeni only", () => {
  const genericPersona = {
    key: "expired_user",
    expectedAllowed: ["/account", "/billing/manage", "/settings/billing"],
    expectedDenied: ["/api/platform/v1/entitlements/evaluate"],
  };

  const wordGeniRoutes = routesForPersonaApp(genericPersona, wordGeni);
  assert.deepEqual(wordGeniRoutes.expectedAllowed, ["/dashboard"]);
  assert.ok(wordGeniRoutes.expectedDenied.includes("/billing/manage"));
  assert.ok(wordGeniRoutes.expectedDenied.includes("/settings/billing"));

  const crevuxRoutes = routesForPersonaApp(genericPersona, crevux);
  assert.deepEqual(crevuxRoutes.expectedAllowed, ["/app/upgrade"]);
  assert.ok(crevuxRoutes.expectedDenied.includes("/billing/manage"));
  assert.ok(crevuxRoutes.expectedDenied.includes("/settings/billing"));
});

test("Verixet route contract uses real billing/dashboard routes and keeps platform APIs API-key gated", () => {
  assert.deepEqual(appRouteContracts.verixet.normal_user.expectedAllowed, ["/dashboard", "/account/billing"]);
  assert.ok(appRouteContracts.verixet.normal_user.expectedDenied.includes("/api/auth/me"));
  assert.ok(appRouteContracts.verixet.normal_user.expectedDenied.includes("/api/ecosystem/session"));
  assert.ok(appRouteContracts.verixet.workspace_admin.expectedAllowed.includes("/dashboard/billing"));
  assert.ok(appRouteContracts.verixet.workspace_admin.expectedDenied.includes("/settings/billing"));
  assert.ok(appRouteContracts.verixet.workspace_admin.expectedDenied.includes("/api/workspaces/active"));
  assert.deepEqual(appRouteContracts.verixet.support_admin.expectedAllowed, ["/dashboard"]);
  assert.ok(appRouteContracts.verixet.support_admin.expectedDenied.includes("/api/admin/support/conversations"));
  assert.deepEqual(appRouteContracts.verixet.superadmin.expectedAllowed, ["/dashboard"]);
  assert.ok(appRouteContracts.verixet.superadmin.expectedDenied.includes("/api/platform/v1/subscriptions/summary"));
});

test("Verixet route contract overrides generic routes without changing unrelated apps", () => {
  const genericPersona = {
    key: "workspace_admin",
    expectedAllowed: ["/dashboard", "/settings/billing", "/api/workspaces/active"],
    expectedDenied: ["/superadmin"],
  };

  const verixetRoutes = routesForPersonaApp(genericPersona, verixet);
  assert.deepEqual(verixetRoutes.expectedAllowed, ["/dashboard", "/account/billing", "/dashboard/billing"]);
  assert.ok(verixetRoutes.expectedDenied.includes("/settings/billing"));
  assert.ok(verixetRoutes.expectedDenied.includes("/api/workspaces/active"));

  const xflowRoutes = routesForPersonaApp(genericPersona, xflow);
  assert.deepEqual(xflowRoutes.expectedAllowed, ["/overview", "/account/billing", "/settings"]);
  assert.ok(xflowRoutes.expectedDenied.includes("/api/workspaces/active"));
});

test("CreVux route contract uses app studio routes and keeps admin/platform APIs denied", () => {
  assert.deepEqual(appRouteContracts.crevux.normal_user.expectedAllowed, ["/app", "/app/account/security"]);
  assert.ok(appRouteContracts.crevux.normal_user.expectedDenied.includes("/api/auth/me"));
  assert.ok(appRouteContracts.crevux.normal_user.expectedDenied.includes("/api/ecosystem/session"));
  assert.deepEqual(appRouteContracts.crevux.workspace_admin.expectedAllowed, ["/app", "/app/upgrade"]);
  assert.ok(appRouteContracts.crevux.workspace_admin.expectedDenied.includes("/settings/billing"));
  assert.ok(appRouteContracts.crevux.workspace_admin.expectedDenied.includes("/api/workspaces/active"));
  assert.deepEqual(appRouteContracts.crevux.support_admin.expectedAllowed, ["/app"]);
  assert.ok(appRouteContracts.crevux.support_admin.expectedDenied.includes("/api/admin/support/conversations"));
  assert.deepEqual(appRouteContracts.crevux.security_admin.expectedAllowed, ["/app"]);
  assert.ok(appRouteContracts.crevux.security_admin.expectedDenied.includes("/api/admin/system-status"));
  assert.deepEqual(appRouteContracts.crevux.superadmin.expectedAllowed, ["/app"]);
  assert.ok(appRouteContracts.crevux.superadmin.expectedDenied.includes("/api/platform/v1/subscriptions/summary"));
  assert.deepEqual(appRouteContracts.crevux.expired_user.expectedAllowed, ["/app/upgrade"]);
  assert.ok(appRouteContracts.crevux.expired_user.expectedDenied.includes("/billing/manage"));
});
