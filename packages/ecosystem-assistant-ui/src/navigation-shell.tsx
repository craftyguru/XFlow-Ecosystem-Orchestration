import * as React from "react";

export type NavigationRole = string;

export type NavigationBrandConfig = {
  appId: string;
  appName: string;
  homeHref: string;
  logo?: React.ReactNode;
  accent?: string;
  accentText?: string;
  sidebarGradient?: string;
  borderColor?: string;
  glowColor?: string;
};

export type NavigationUserContext = {
  roles?: NavigationRole[];
  displayName?: string | null;
  email?: string | null;
  avatar?: React.ReactNode;
  workspaceLabel?: string | null;
  statusLabel?: string | null;
};

export type NavItemConfig = {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  description?: string;
  activeMatchPrefixes?: string[];
  isActive?: (currentPath: string, item: NavItemConfig) => boolean;
  children?: NavItemConfig[];
  external?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  beta?: boolean;
  badge?: React.ReactNode;
  requiredRoles?: NavigationRole[];
  hidden?: boolean;
  dataAttributes?: Record<string, string | undefined>;
};

export type NavSectionConfig = {
  id: string;
  label: string;
  items: NavItemConfig[];
  requiredRoles?: NavigationRole[];
  hidden?: boolean;
};

export type NavigationShellState = {
  collapsed: boolean;
  mobileOpen: boolean;
};

export type NavigationRenderLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  "aria-current"?: "page";
  "aria-label"?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
  [dataAttribute: `data-${string}`]: string | undefined;
};

export type NavigationShellConfig = {
  brand: NavigationBrandConfig;
  sections: NavSectionConfig[];
  user?: NavigationUserContext | null;
  primaryAction?: {
    label: string;
    href?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  };
  quickAction?: {
    label: string;
    description?: string;
    icon?: React.ReactNode;
    href?: string;
    onClick?: () => void;
  };
  userCard?: React.ReactNode;
  workspaceCard?: React.ReactNode;
  accountFooter?: React.ReactNode;
};

export type NavigationLinkComponent = React.ComponentType<NavigationRenderLinkProps>;

type LinkRenderer = (props: NavigationRenderLinkProps) => React.ReactNode;

function DefaultLink(props: NavigationRenderLinkProps): React.ReactElement {
  const { href, children, onClick, ...rest } = props;
  return (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}

function normalizePath(path: string): string {
  const value = path.trim().split(/[?#]/, 1)[0] ?? "";
  if (!value) return "/";
  return value.length > 1 && value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getNavigationCollapseStorageKey(appId: string): string {
  return `xflow.navShell.${appId}.collapsed`;
}

export function isNavigationItemVisible(
  item: Pick<NavItemConfig, "hidden" | "requiredRoles">,
  roles: readonly NavigationRole[] = [],
): boolean {
  if (item.hidden) return false;
  if (!item.requiredRoles?.length) return true;
  return item.requiredRoles.some((role) => roles.includes(role));
}

export function isNavigationSectionVisible(
  section: Pick<NavSectionConfig, "hidden" | "requiredRoles" | "items">,
  roles: readonly NavigationRole[] = [],
): boolean {
  if (section.hidden) return false;
  if (section.requiredRoles?.length && !section.requiredRoles.some((role) => roles.includes(role))) {
    return false;
  }
  return section.items.some((item) => isNavigationItemVisible(item, roles));
}

export function isNavigationItemActive(currentPath: string, item: NavItemConfig): boolean {
  if (item.disabled || item.external) return false;
  const current = normalizePath(currentPath);
  if (item.isActive) return item.isActive(currentPath, item);
  const target = normalizePath(item.href);
  if (current === target) return true;
  if (target !== "/" && current.startsWith(`${target}/`)) return true;
  if (item.children?.some((child) => isNavigationItemActive(current, child))) return true;
  return Boolean(
    item.activeMatchPrefixes?.some((prefix) => {
      const normalized = normalizePath(prefix);
      return current === normalized || current.startsWith(`${normalized}/`);
    }),
  );
}

export function normalizeNavigationSections(
  sections: readonly NavSectionConfig[],
  roles: readonly NavigationRole[] = [],
): NavSectionConfig[] {
  return sections
    .filter((section) => isNavigationSectionVisible(section, roles))
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => isNavigationItemVisible(item, roles))
        .map((item) => ({
          ...item,
          children: item.children?.filter((child) => isNavigationItemVisible(child, roles)),
        })),
    }))
    .filter((section) => section.items.length > 0);
}

export function NavigationShellStyles(): React.ReactElement {
  return (
    <style>{`
.xflow-nav-shell {
  --xnav-accent: #22d3ee;
  --xnav-accent-text: #06111f;
  --xnav-sidebar-width: 18.25rem;
  --xnav-sidebar-collapsed-width: 5rem;
  --xnav-drawer-width: min(22rem, calc(100vw - 1rem));
  --xnav-header-height: 3.75rem;
  --xnav-sidebar-gradient: radial-gradient(circle at 18% 0%, color-mix(in srgb, var(--xnav-accent) 18%, transparent), transparent 28%), linear-gradient(180deg, rgba(10, 18, 35, 0.98), rgba(3, 7, 18, 0.99));
  --xnav-border: rgba(255, 255, 255, 0.1);
  --xnav-glow: rgba(34, 211, 238, 0.35);
  --xnav-active-bg: rgba(34, 211, 238, 0.13);
  --xnav-icon-bg: rgba(255, 255, 255, 0.07);
  --xnav-panel-bg: rgba(255, 255, 255, 0.045);
  --xnav-panel-hover: rgba(255, 255, 255, 0.07);
  min-height: 100dvh;
  min-width: 0;
  color: #f8fafc;
}
.xflow-nav-shell--embedded { min-height: 0; color: inherit; }
.xflow-nav-shell, .xflow-nav-shell * { box-sizing: border-box; }
.xflow-nav-shell__root { display: flex; min-height: 100dvh; width: 100%; overflow-x: hidden; background: #020617; }
.xflow-nav-shell__sidebar {
  position: sticky; top: 0; display: none; height: 100dvh; width: var(--xnav-sidebar-width);
  flex: 0 0 var(--xnav-sidebar-width); flex-direction: column; overflow: hidden;
  border-right: 1px solid var(--xnav-border); background: var(--xnav-sidebar-gradient);
  box-shadow: 20px 0 60px -48px var(--xnav-glow);
  scrollbar-color: color-mix(in srgb, var(--xnav-accent) 48%, rgba(148, 163, 184, 0.55)) transparent;
  scrollbar-width: thin;
}
.xflow-nav-shell[data-collapsed="true"] .xflow-nav-shell__sidebar {
  width: var(--xnav-sidebar-collapsed-width); flex-basis: var(--xnav-sidebar-collapsed-width);
}
.xflow-nav-shell__workspace { display: flex; min-width: 0; flex: 1; flex-direction: column; }
.xflow-nav-shell__main { min-width: 0; flex: 1; overflow-x: hidden; }
.xflow-nav-shell__mobile-header {
  display: flex; min-height: var(--xnav-header-height); align-items: center; justify-content: space-between;
  gap: 0.75rem; border-bottom: 1px solid var(--xnav-border); background: rgba(2, 6, 23, 0.9);
  padding: 0.625rem 1rem; backdrop-filter: blur(14px);
}
.xflow-nav-shell__brand { display: flex; min-width: 0; align-items: center; gap: 0.7rem; color: inherit; text-decoration: none; }
.xflow-nav-shell__brand-mark, .xflow-nav-shell__icon {
  display: inline-flex; min-width: 2.35rem; width: 2.35rem; height: 2.35rem; align-items: center; justify-content: center;
  overflow: hidden; border: 1px solid var(--xnav-border); border-radius: 0.72rem; background: var(--xnav-icon-bg);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.07), 0 10px 26px -22px var(--xnav-glow);
}
.xflow-nav-shell__brand-mark { border-color: color-mix(in srgb, var(--xnav-accent) 36%, var(--xnav-border)); background: color-mix(in srgb, var(--xnav-accent) 12%, var(--xnav-icon-bg)); }
.xflow-nav-shell__brand-text { min-width: 0; font-size: 1rem; font-weight: 800; line-height: 1.1; }
.xflow-nav-shell__brand-subtext { display: block; color: rgba(226, 232, 240, 0.66); font-size: 0.72rem; font-weight: 600; }
.xflow-nav-shell__panel { display: flex; min-height: 0; flex: 1; flex-direction: column; gap: 0.85rem; padding: 0.875rem; }
.xflow-nav-shell__slot { flex: 0 0 auto; }
.xflow-nav-shell__nav {
  min-height: 0; flex: 1; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain;
  padding: 0 0.35rem 0.65rem 0; mask-image: linear-gradient(to bottom, transparent 0, #000 0.8rem, #000 calc(100% - 0.8rem), transparent 100%);
}
.xflow-nav-shell__nav::-webkit-scrollbar { width: 0.45rem; }
.xflow-nav-shell__nav::-webkit-scrollbar-track { background: transparent; }
.xflow-nav-shell__nav::-webkit-scrollbar-thumb { border-radius: 999px; background: color-mix(in srgb, var(--xnav-accent) 38%, rgba(148, 163, 184, 0.48)); }
.xflow-nav-shell__section { margin-bottom: 0.9rem; }
.xflow-nav-shell__section-label {
  display: flex; align-items: center; gap: 0.42rem; margin: 0 0 0.38rem; padding: 0 0.35rem;
  color: rgba(226, 232, 240, 0.56); font-size: 0.65rem; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase;
}
.xflow-nav-shell__section-label::before {
  content: ""; width: 0.42rem; height: 0.42rem; flex: 0 0 auto; border-radius: 999px;
  background: color-mix(in srgb, var(--xnav-accent) 72%, white 8%); box-shadow: 0 0 16px color-mix(in srgb, var(--xnav-accent) 54%, transparent);
}
.xflow-nav-shell__list { display: flex; flex-direction: column; gap: 0.2rem; margin: 0; padding: 0; list-style: none; }
.xflow-nav-shell__item {
  position: relative; display: flex; min-height: 42px; width: 100%; align-items: center; gap: 0.62rem; border: 1px solid transparent;
  border-radius: 0.78rem; color: rgba(226, 232, 240, 0.78); padding: 0.38rem 0.48rem; text-decoration: none;
  transition: transform 150ms ease, background 150ms ease, border-color 150ms ease, color 150ms ease, box-shadow 150ms ease;
}
.xflow-nav-shell__item:hover, .xflow-nav-shell__item:focus-visible {
  transform: translateX(1px); border-color: var(--xnav-border); background: var(--xnav-panel-hover); color: #fff; outline: none;
  box-shadow: 0 10px 28px -24px rgba(0,0,0,0.8);
}
.xflow-nav-shell__item:focus-visible { box-shadow: 0 0 0 3px color-mix(in srgb, var(--xnav-accent) 25%, transparent); }
.xflow-nav-shell__item--active {
  border-color: color-mix(in srgb, var(--xnav-accent) 50%, transparent);
  background: linear-gradient(135deg, color-mix(in srgb, var(--xnav-accent) 19%, transparent), rgba(255,255,255,0.035));
  color: #fff; box-shadow: inset 3px 0 0 var(--xnav-accent), 0 14px 34px -28px var(--xnav-glow);
}
.xflow-nav-shell__item--disabled { cursor: not-allowed; opacity: 0.54; }
.xflow-nav-shell__item--has-children::after {
  content: ""; width: 0.42rem; height: 0.42rem; flex: 0 0 auto; border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor;
  opacity: 0.42; transform: rotate(-45deg); transition: transform 150ms ease, opacity 150ms ease;
}
.xflow-nav-shell__item--active.xflow-nav-shell__item--has-children::after { opacity: 0.76; transform: rotate(45deg); }
.xflow-nav-shell__item-label { min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.84rem; font-weight: 760; }
.xflow-nav-shell__badge { flex: 0 0 auto; border: 1px solid var(--xnav-border); border-radius: 999px; padding: 0.1rem 0.42rem; color: rgba(226, 232, 240, 0.78); font-size: 0.67rem; font-weight: 800; }
.xflow-nav-shell__children {
  position: relative; display: flex; flex-direction: column; gap: 0.14rem; margin: 0.18rem 0 0.28rem 1.1rem;
  padding: 0.18rem 0 0.18rem 0.72rem; list-style: none; border-left: 1px solid color-mix(in srgb, var(--xnav-accent) 22%, var(--xnav-border));
}
.xflow-nav-shell__child .xflow-nav-shell__item { min-height: 34px; border-radius: 0.68rem; padding: 0.28rem 0.42rem; gap: 0.5rem; }
.xflow-nav-shell__child .xflow-nav-shell__icon {
  min-width: 1.78rem; width: 1.78rem; height: 1.78rem; border-radius: 0.6rem; background: rgba(255,255,255,0.045);
}
.xflow-nav-shell__child .xflow-nav-shell__item-label { font-size: 0.78rem; font-weight: 720; }
.xflow-nav-shell__child .xflow-nav-shell__item--active { background: color-mix(in srgb, var(--xnav-accent) 17%, rgba(255,255,255,0.035)); }
.xflow-nav-shell__action {
  display: inline-flex; min-height: 44px; width: 100%; align-items: center; justify-content: center; gap: 0.55rem;
  border: 1px solid color-mix(in srgb, var(--xnav-accent) 58%, transparent); border-radius: 0.85rem;
  background: linear-gradient(180deg, color-mix(in srgb, var(--xnav-accent) 22%, transparent), rgba(255,255,255,0.03));
  color: #fff; padding: 0.65rem 0.8rem; text-decoration: none; font-weight: 850;
}
.xflow-nav-shell__quick {
  display: flex; min-height: 44px; width: 100%; align-items: center; gap: 0.65rem; border: 1px solid var(--xnav-border);
  border-radius: 0.85rem; background: rgba(255,255,255,0.045); color: rgba(226,232,240,0.82); padding: 0.65rem 0.75rem; text-align: left;
}
.xflow-nav-shell__quick strong { display: block; color: #fff; font-size: 0.82rem; }
.xflow-nav-shell__quick span { display: block; color: rgba(226,232,240,0.62); font-size: 0.74rem; }
.xflow-nav-shell__user, .xflow-nav-shell__account {
  border: 1px solid var(--xnav-border); border-radius: 0.95rem; background: var(--xnav-panel-bg); padding: 0.75rem;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.055);
}
.xflow-nav-shell__user { display: flex; align-items: center; gap: 0.7rem; }
.xflow-nav-shell__avatar { display: inline-flex; width: 2.25rem; height: 2.25rem; align-items: center; justify-content: center; border-radius: 999px; background: var(--xnav-accent); color: var(--xnav-accent-text); font-weight: 900; }
.xflow-nav-shell__user-copy { min-width: 0; }
.xflow-nav-shell__user-copy strong, .xflow-nav-shell__user-copy span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.xflow-nav-shell__user-copy span { color: rgba(226,232,240,0.58); font-size: 0.74rem; }
.xflow-nav-shell__icon-button {
  display: inline-flex; min-width: 44px; min-height: 44px; align-items: center; justify-content: center;
  border: 1px solid var(--xnav-border); border-radius: 0.75rem; background: rgba(255,255,255,0.055); color: #fff;
  transition: background 150ms ease, border-color 150ms ease, transform 150ms ease;
}
.xflow-nav-shell__icon-button:hover, .xflow-nav-shell__icon-button:focus-visible { border-color: color-mix(in srgb, var(--xnav-accent) 40%, var(--xnav-border)); background: rgba(255,255,255,0.09); outline: none; }
.xflow-nav-shell__collapse { position: absolute; right: -22px; top: 50%; transform: translateY(-50%); min-width: 38px; min-height: 38px; border-radius: 999px; }
.xflow-nav-shell__drawer { position: fixed; inset: 0; z-index: 1000; display: none; }
.xflow-nav-shell__drawer[data-open="true"] { display: block; }
.xflow-nav-shell__scrim { position: absolute; inset: 0; border: 0; background: rgba(0,0,0,0.62); backdrop-filter: blur(4px); }
.xflow-nav-shell__drawer-panel {
  position: absolute; inset-block: 0; left: 0; display: flex; width: var(--xnav-drawer-width); max-width: 100%;
  flex-direction: column; overflow: hidden; border-right: 1px solid var(--xnav-border); background: var(--xnav-sidebar-gradient);
  box-shadow: 24px 0 80px rgba(0,0,0,0.46);
}
.xflow-nav-shell__drawer-header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.85rem; }
.xflow-nav-shell[data-collapsed="true"] .xflow-nav-shell__desktop .xflow-nav-shell__brand-text,
.xflow-nav-shell.xflow-nav-shell__desktop[data-collapsed="true"] .xflow-nav-shell__brand-text,
.xflow-nav-shell[data-collapsed="true"] .xflow-nav-shell__desktop .xflow-nav-shell__brand-subtext,
.xflow-nav-shell.xflow-nav-shell__desktop[data-collapsed="true"] .xflow-nav-shell__brand-subtext,
.xflow-nav-shell[data-collapsed="true"] .xflow-nav-shell__desktop .xflow-nav-shell__section-label,
.xflow-nav-shell.xflow-nav-shell__desktop[data-collapsed="true"] .xflow-nav-shell__section-label,
.xflow-nav-shell[data-collapsed="true"] .xflow-nav-shell__desktop .xflow-nav-shell__item-label,
.xflow-nav-shell.xflow-nav-shell__desktop[data-collapsed="true"] .xflow-nav-shell__item-label,
.xflow-nav-shell[data-collapsed="true"] .xflow-nav-shell__desktop .xflow-nav-shell__badge,
.xflow-nav-shell.xflow-nav-shell__desktop[data-collapsed="true"] .xflow-nav-shell__badge,
.xflow-nav-shell[data-collapsed="true"] .xflow-nav-shell__desktop .xflow-nav-shell__children,
.xflow-nav-shell.xflow-nav-shell__desktop[data-collapsed="true"] .xflow-nav-shell__children,
.xflow-nav-shell[data-collapsed="true"] .xflow-nav-shell__desktop .xflow-nav-shell__slot-label { display: none; }
.xflow-nav-shell.xflow-nav-shell__desktop[data-collapsed="true"] .xflow-nav-shell__slot-label { display: none; }
.xflow-nav-shell[data-collapsed="true"] .xflow-nav-shell__desktop .xflow-nav-shell__item,
.xflow-nav-shell.xflow-nav-shell__desktop[data-collapsed="true"] .xflow-nav-shell__item,
.xflow-nav-shell[data-collapsed="true"] .xflow-nav-shell__desktop .xflow-nav-shell__brand,
.xflow-nav-shell.xflow-nav-shell__desktop[data-collapsed="true"] .xflow-nav-shell__brand { justify-content: center; }
.xflow-nav-shell[data-collapsed="true"] .xflow-nav-shell__desktop .xflow-nav-shell__item--has-children::after,
.xflow-nav-shell.xflow-nav-shell__desktop[data-collapsed="true"] .xflow-nav-shell__item--has-children::after { display: none; }
@media (min-width: 768px) {
  .xflow-nav-shell__sidebar { display: flex; }
  .xflow-nav-shell__mobile-header { display: none; }
}
`}</style>
  );
}

function getRoles(config: NavigationShellConfig): readonly NavigationRole[] {
  return config.user?.roles ?? [];
}

function renderVia(renderer: LinkRenderer, props: NavigationRenderLinkProps): React.ReactNode {
  return renderer(props);
}

export function CollapseToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      className="xflow-nav-shell__icon-button xflow-nav-shell__collapse"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!collapsed}
      onClick={onToggle}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <span aria-hidden>{collapsed ? ">" : "<"}</span>
    </button>
  );
}

export function SidebarUserCard({ user }: { user: NavigationUserContext }): React.ReactElement {
  const initial = (user.displayName ?? user.email ?? "U").trim().charAt(0).toUpperCase() || "U";
  return (
    <div className="xflow-nav-shell__user">
      <span className="xflow-nav-shell__avatar" aria-hidden>
        {user.avatar ?? initial}
      </span>
      <span className="xflow-nav-shell__user-copy">
        <strong>{user.displayName ?? "Signed in"}</strong>
        {user.email ? <span>{user.email}</span> : null}
        {user.workspaceLabel ? <span>{user.workspaceLabel}</span> : null}
      </span>
    </div>
  );
}

export function SidebarAccountFooter({ children }: { children: React.ReactNode }): React.ReactElement {
  return <div className="xflow-nav-shell__account">{children}</div>;
}

export function PrimaryActionButton({
  action,
  renderLink = DefaultLink,
  onNavigate,
}: {
  action: NonNullable<NavigationShellConfig["primaryAction"]>;
  renderLink?: LinkRenderer;
  onNavigate?: () => void;
}): React.ReactElement {
  const content = (
    <>
      {action.icon ? <span aria-hidden>{action.icon}</span> : null}
      <span className="xflow-nav-shell__slot-label">{action.label}</span>
    </>
  );
  if (action.href) {
    return <>{renderVia(renderLink, { href: action.href, className: "xflow-nav-shell__action", onClick: onNavigate, children: content })}</>;
  }
  return (
    <button type="button" className="xflow-nav-shell__action" onClick={action.onClick}>
      {content}
    </button>
  );
}

export function QuickActionCard({
  action,
  renderLink = DefaultLink,
  onNavigate,
}: {
  action: NonNullable<NavigationShellConfig["quickAction"]>;
  renderLink?: LinkRenderer;
  onNavigate?: () => void;
}): React.ReactElement {
  const content = (
    <>
      {action.icon ? <span aria-hidden>{action.icon}</span> : null}
      <span className="xflow-nav-shell__slot-label">
        <strong>{action.label}</strong>
        {action.description ? <span>{action.description}</span> : null}
      </span>
    </>
  );
  if (action.href) {
    return <>{renderVia(renderLink, { href: action.href, className: "xflow-nav-shell__quick", onClick: onNavigate, children: content })}</>;
  }
  return (
    <button type="button" className="xflow-nav-shell__quick" onClick={action.onClick}>
      {content}
    </button>
  );
}

export function NavItem({
  item,
  currentPath,
  renderLink = DefaultLink,
  onNavigate,
  depth = 0,
}: {
  item: NavItemConfig;
  currentPath: string;
  renderLink?: LinkRenderer;
  onNavigate?: () => void;
  depth?: number;
}): React.ReactElement {
  const active = isNavigationItemActive(currentPath, item);
  const className = [
    "xflow-nav-shell__item",
    active ? "xflow-nav-shell__item--active" : "",
    item.disabled ? "xflow-nav-shell__item--disabled" : "",
    item.children?.length ? "xflow-nav-shell__item--has-children" : "",
  ].filter(Boolean).join(" ");
  const label = item.beta ? `${item.label} beta` : item.label;
  const title = item.disabled ? item.disabledReason ?? `${item.label} is unavailable` : item.description ?? item.label;
  const content = (
    <>
      <span className="xflow-nav-shell__icon" aria-hidden>
        {item.icon ?? item.label.slice(0, 2).toUpperCase()}
      </span>
      <span className="xflow-nav-shell__item-label">{item.label}</span>
      {item.beta ? <span className="xflow-nav-shell__badge">Beta</span> : null}
      {item.badge ? <span className="xflow-nav-shell__badge">{item.badge}</span> : null}
    </>
  );
  const node = item.disabled ? (
    <span className={className} aria-disabled="true" title={title} aria-label={label} {...item.dataAttributes}>
      {content}
    </span>
  ) : (
    renderVia(renderLink, {
      href: item.href,
      className,
      title,
      "aria-current": active ? "page" : undefined,
      "aria-label": label,
      onClick: onNavigate,
      target: item.external ? "_blank" : undefined,
      rel: item.external ? "noreferrer" : undefined,
      children: content,
      ...item.dataAttributes,
    })
  );
  const visibleChildren = active ? item.children ?? [] : [];
  return (
    <li className={depth > 0 ? "xflow-nav-shell__child" : undefined}>
      {node}
      {visibleChildren.length > 0 ? (
        <ul className="xflow-nav-shell__children">
          {visibleChildren.map((child) => (
            <NavItem
              key={child.id}
              item={child}
              currentPath={currentPath}
              renderLink={renderLink}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function NavSection({
  section,
  currentPath,
  renderLink,
  onNavigate,
}: {
  section: NavSectionConfig;
  currentPath: string;
  renderLink?: LinkRenderer;
  onNavigate?: () => void;
}): React.ReactElement {
  return (
    <section className="xflow-nav-shell__section" aria-labelledby={`xnav-section-${section.id}`}>
      <p id={`xnav-section-${section.id}`} className="xflow-nav-shell__section-label">
        {section.label}
      </p>
      <ul className="xflow-nav-shell__list">
        {section.items.map((item) => (
          <NavItem key={item.id} item={item} currentPath={currentPath} renderLink={renderLink} onNavigate={onNavigate} />
        ))}
      </ul>
    </section>
  );
}

export function SidebarNav({
  config,
  currentPath,
  renderLink,
  onNavigate,
}: {
  config: NavigationShellConfig;
  currentPath: string;
  renderLink?: LinkRenderer;
  onNavigate?: () => void;
}): React.ReactElement {
  const sections = normalizeNavigationSections(config.sections, getRoles(config));
  return (
    <nav className="xflow-nav-shell__nav" aria-label={`${config.brand.appName} navigation`}>
      {sections.map((section) => (
        <NavSection key={section.id} section={section} currentPath={currentPath} renderLink={renderLink} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

function SidebarPanel({
  config,
  currentPath,
  renderLink,
  onNavigate,
}: {
  config: NavigationShellConfig;
  currentPath: string;
  renderLink: LinkRenderer;
  onNavigate?: () => void;
}): React.ReactElement {
  return (
    <div className="xflow-nav-shell__panel">
      {renderVia(renderLink, {
        href: config.brand.homeHref,
        className: "xflow-nav-shell__brand",
        onClick: onNavigate,
        "aria-label": `${config.brand.appName} home`,
        children: (
          <>
            <span className="xflow-nav-shell__brand-mark" aria-hidden>
              {config.brand.logo ?? config.brand.appName.slice(0, 2).toUpperCase()}
            </span>
            <span className="xflow-nav-shell__brand-text">
              {config.brand.appName}
              {config.user?.statusLabel ? <span className="xflow-nav-shell__brand-subtext">{config.user.statusLabel}</span> : null}
            </span>
          </>
        ),
      })}
      {config.userCard ? <div className="xflow-nav-shell__slot">{config.userCard}</div> : config.user ? <SidebarUserCard user={config.user} /> : null}
      {config.workspaceCard ? <div className="xflow-nav-shell__slot">{config.workspaceCard}</div> : null}
      <SidebarNav config={config} currentPath={currentPath} renderLink={renderLink} onNavigate={onNavigate} />
      {config.primaryAction ? <PrimaryActionButton action={config.primaryAction} renderLink={renderLink} onNavigate={onNavigate} /> : null}
      {config.quickAction ? <QuickActionCard action={config.quickAction} renderLink={renderLink} onNavigate={onNavigate} /> : null}
      {config.accountFooter ? <SidebarAccountFooter>{config.accountFooter}</SidebarAccountFooter> : null}
    </div>
  );
}

export function MobileHeader({
  config,
  onOpen,
  renderLink = DefaultLink,
  buttonRef,
  open,
}: {
  config: NavigationShellConfig;
  onOpen: () => void;
  renderLink?: LinkRenderer;
  buttonRef?: React.RefObject<HTMLButtonElement>;
  open: boolean;
}): React.ReactElement {
  return (
    <header className="xflow-nav-shell__mobile-header">
      {renderVia(renderLink, {
        href: config.brand.homeHref,
        className: "xflow-nav-shell__brand",
        "aria-label": `${config.brand.appName} home`,
        children: (
          <>
            <span className="xflow-nav-shell__brand-mark" aria-hidden>
              {config.brand.logo ?? config.brand.appName.slice(0, 2).toUpperCase()}
            </span>
            <span className="xflow-nav-shell__brand-text">{config.brand.appName}</span>
          </>
        ),
      })}
      <button
        ref={buttonRef}
        type="button"
        className="xflow-nav-shell__icon-button"
        aria-label="Open navigation"
        aria-expanded={open}
        aria-controls={`${config.brand.appId}-mobile-navigation`}
        onClick={onOpen}
      >
        <span aria-hidden>Menu</span>
      </button>
    </header>
  );
}

export function MobileNavDrawer({
  config,
  currentPath,
  open,
  onClose,
  renderLink = DefaultLink,
  returnFocusRef,
  drawerIntro,
}: {
  config: NavigationShellConfig;
  currentPath: string;
  open: boolean;
  onClose: () => void;
  renderLink?: LinkRenderer;
  returnFocusRef?: React.RefObject<HTMLElement>;
  drawerIntro?: unknown;
}): React.ReactElement {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const previousPathRef = React.useRef(currentPath);

  React.useEffect(() => {
    if (!open) {
      previousPathRef.current = currentPath;
      return;
    }
    if (previousPathRef.current !== currentPath) {
      previousPathRef.current = currentPath;
      onClose();
    }
  }, [currentPath, onClose, open]);

  React.useEffect(() => {
    if (!open) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousDocumentOverscroll = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.documentElement.style.overscrollBehavior = previousDocumentOverscroll;
      returnFocusRef?.current?.focus();
    };
  }, [onClose, open, returnFocusRef]);

  return (
    <div
      id={`${config.brand.appId}-mobile-navigation`}
      className="xflow-nav-shell__drawer"
      data-open={open ? "true" : "false"}
      role="dialog"
      aria-modal="true"
      aria-label={`${config.brand.appName} navigation`}
    >
      <button type="button" className="xflow-nav-shell__scrim" aria-label="Close navigation" onClick={onClose} />
      <aside className="xflow-nav-shell__drawer-panel">
        <div className="xflow-nav-shell__drawer-header">
          <span className="xflow-nav-shell__brand">
            <span className="xflow-nav-shell__brand-mark" aria-hidden>
              {config.brand.logo ?? config.brand.appName.slice(0, 2).toUpperCase()}
            </span>
            <span className="xflow-nav-shell__brand-text">{config.brand.appName}</span>
          </span>
          <button ref={closeRef} type="button" className="xflow-nav-shell__icon-button" aria-label="Close navigation" onClick={onClose}>
            <span aria-hidden>Close</span>
          </button>
        </div>
        {drawerIntro ? <div className="xflow-nav-shell__slot">{drawerIntro as React.ReactNode}</div> : null}
        <SidebarPanel config={config} currentPath={currentPath} renderLink={renderLink} onNavigate={onClose} />
      </aside>
    </div>
  );
}

export function AppShell({
  config,
  currentPath,
  children,
  renderLink,
  LinkComponent,
  topBar,
}: {
  config: NavigationShellConfig;
  currentPath: string;
  children: React.ReactNode;
  renderLink?: LinkRenderer;
  LinkComponent?: NavigationLinkComponent;
  topBar?: React.ReactNode;
}): React.ReactElement {
  const linkRenderer = React.useMemo<LinkRenderer>(() => {
    if (renderLink) return renderLink;
    if (LinkComponent) {
      return (props) => <LinkComponent {...props} />;
    }
    return (props) => <DefaultLink {...props} />;
  }, [LinkComponent, renderLink]);
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(getNavigationCollapseStorageKey(config.brand.appId)) === "true");
    } catch {
      setCollapsed(false);
    }
  }, [config.brand.appId]);

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(getNavigationCollapseStorageKey(config.brand.appId), String(next));
      } catch {
        // Storage can be unavailable in private browsing or restricted webviews.
      }
      return next;
    });
  }, [config.brand.appId]);

  const styleVars = {
    "--xnav-accent": config.brand.accent,
    "--xnav-accent-text": config.brand.accentText,
    "--xnav-sidebar-gradient": config.brand.sidebarGradient,
    "--xnav-border": config.brand.borderColor,
    "--xnav-glow": config.brand.glowColor,
  } as React.CSSProperties;

  return (
    <div className="xflow-nav-shell" data-collapsed={collapsed ? "true" : "false"} style={styleVars}>
      <NavigationShellStyles />
      <div className="xflow-nav-shell__root">
        <aside className="xflow-nav-shell__sidebar xflow-nav-shell__desktop" aria-label={`${config.brand.appName} sidebar`}>
          <SidebarPanel config={config} currentPath={currentPath} renderLink={linkRenderer} />
          <CollapseToggle collapsed={collapsed} onToggle={toggleCollapsed} />
        </aside>
        <div className="xflow-nav-shell__workspace">
          <MobileHeader config={config} onOpen={() => setMobileOpen(true)} renderLink={linkRenderer} buttonRef={menuRef} open={mobileOpen} />
          {topBar}
          <main className="xflow-nav-shell__main">{children}</main>
        </div>
      </div>
      <MobileNavDrawer
        config={config}
        currentPath={currentPath}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        renderLink={linkRenderer}
        returnFocusRef={menuRef}
      />
    </div>
  );
}
