import assert from "node:assert/strict";
import test from "node:test";
import {
  getNavigationCollapseStorageKey,
  isNavigationItemActive,
  isNavigationItemVisible,
  NavItem,
  normalizeNavigationSections,
} from "../dist/navigation-shell.js";

test("builds per-app collapse storage keys", () => {
  assert.equal(getNavigationCollapseStorageKey("wordgeni"), "xflow.navShell.wordgeni.collapsed");
  assert.equal(getNavigationCollapseStorageKey("xflow"), "xflow.navShell.xflow.collapsed");
});

test("filters items by role and hidden state", () => {
  assert.equal(isNavigationItemVisible({ requiredRoles: ["admin"] }, ["user"]), false);
  assert.equal(isNavigationItemVisible({ requiredRoles: ["admin"] }, ["admin"]), true);
  assert.equal(isNavigationItemVisible({ hidden: true }, ["admin"]), false);
});

test("matches active routes exactly, by child path, and by active prefixes", () => {
  assert.equal(isNavigationItemActive("/dashboard", { id: "home", label: "Home", href: "/dashboard" }), true);
  assert.equal(isNavigationItemActive("/dashboard/projects/1", { id: "projects", label: "Projects", href: "/dashboard/projects" }), true);
  assert.equal(isNavigationItemActive("/dashboard/projects/1?tab=notes#draft", { id: "projects", label: "Projects", href: "/dashboard/projects" }), true);
  assert.equal(
    isNavigationItemActive("/dashboard/connect", {
      id: "xflow",
      label: "XFlow",
      href: "/dashboard/xflow",
      activeMatchPrefixes: ["/dashboard/connect"],
    }),
    true,
  );
  assert.equal(
    isNavigationItemActive("/tools/chronicle/timeline", {
      id: "chronicle",
      label: "Chronicle",
      href: "/tools/chronicle",
      children: [{ id: "timeline", label: "Timeline", href: "/tools/chronicle/timeline" }],
    }),
    true,
  );
});

test("disabled and external items are never active", () => {
  assert.equal(isNavigationItemActive("/settings", { id: "settings", label: "Settings", href: "/settings", disabled: true }), false);
  assert.equal(isNavigationItemActive("/community", { id: "community", label: "Community", href: "/community", external: true }), false);
});

test("supports app-specific active route matchers", () => {
  const item = {
    id: "tools",
    label: "Tools",
    href: "/tools",
    isActive: (currentPath) => currentPath === "/tools" || currentPath.startsWith("/tools/groups/"),
  };

  assert.equal(isNavigationItemActive("/tools/groups/all?view=grid#top", item), true);
  assert.equal(isNavigationItemActive("/tools/chronicle", item), false);
});

test("passes the raw current path to app-specific active route matchers", () => {
  const item = {
    id: "video",
    label: "Video",
    href: "/app/create?view=animate",
    isActive: (currentPath) => currentPath === "/app/create?view=animate",
  };

  assert.equal(isNavigationItemActive("/app/create?view=animate", item), true);
  assert.equal(isNavigationItemActive("/app/create", item), false);
});

test("passes configured data attributes to rendered links", () => {
  const rendered = NavItem({
    item: {
      id: "apps",
      label: "Apps",
      href: "/apps",
      dataAttributes: {
        "data-nav-id": "apps",
        "data-tour-target": "nav-apps",
      },
    },
    currentPath: "/overview",
    renderLink: (props) => ({ kind: "link", props }),
  });

  const link = rendered.props.children[0];
  assert.equal(link.props["data-nav-id"], "apps");
  assert.equal(link.props["data-tour-target"], "nav-apps");
});

test("normalizes sections and children by visibility", () => {
  const sections = normalizeNavigationSections(
    [
      {
        id: "main",
        label: "Main",
        items: [
          { id: "home", label: "Home", href: "/" },
          { id: "admin", label: "Admin", href: "/admin", requiredRoles: ["admin"] },
          {
            id: "tools",
            label: "Tools",
            href: "/tools",
            children: [
              { id: "public", label: "Public", href: "/tools/public" },
              { id: "private", label: "Private", href: "/tools/private", requiredRoles: ["admin"] },
            ],
          },
        ],
      },
    ],
    ["user"],
  );

  assert.deepEqual(
    sections[0].items.map((item) => item.id),
    ["home", "tools"],
  );
  assert.deepEqual(
    sections[0].items.find((item) => item.id === "tools").children.map((item) => item.id),
    ["public"],
  );
});
