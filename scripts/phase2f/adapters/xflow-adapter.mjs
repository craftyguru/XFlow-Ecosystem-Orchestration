import { fixtureId, marker, requireMarked, result } from "./adapter-utils.mjs";

const APP_SLUGS = ["xflow", "verixet", "rataify", "audaix", "crevux", "wordgeni"];

export const xflowAdapter = {
  name: "xflow",
  plan() {
    return [{ adapter: this.name, action: "plan", target: "workspace/memberships/catalog" }];
  },
  provision(context) {
    const out = [];
    const workspace = context.store.createOrReuse({
      table: "xflow.workspaces",
      lookup: (row) => row.slug === context.workspaceSlug,
      create: () => ({
        id: fixtureId("xflow", "workspace"),
        slug: context.workspaceSlug,
        name: "Ecosystem Production Proof Workspace",
        fixtureMetadata: marker({ adapter: this.name, fixture: "workspace" }),
      }),
    });
    context.state.workspace = {
      id: workspace.row.id,
      slug: workspace.row.slug,
      action: context.state.workspace?.action === "created" ? "created" : workspace.action,
    };
    out.push(result(this.name, workspace.action, "xflow.workspaces", workspace.row));

    for (const identityKey of ["standard", "denied"]) {
      const user = context.state.identities[identityKey];
      const membership = context.store.createOrReuse({
        table: "xflow.workspace_members",
        lookup: (row) => row.workspaceId === workspace.row.id && row.userId === user.id,
        create: () => ({
          id: fixtureId("xflow_member", identityKey),
          workspaceId: workspace.row.id,
          userId: user.id,
          role: "member",
          fixtureMetadata: marker({ adapter: this.name, identityKey }),
        }),
      });
      out.push(result(this.name, membership.action, "xflow.workspace_members", membership.row));
    }

    for (const appSlug of APP_SLUGS) {
      const app = context.store.createOrReuse({
        table: "xflow.apps",
        lookup: (row) => row.workspaceId === workspace.row.id && row.slug === appSlug,
        create: () => ({
          id: fixtureId("xflow_app", appSlug),
          workspaceId: workspace.row.id,
          slug: appSlug,
          name: appSlug,
          status: "active",
          fixtureMetadata: marker({ adapter: this.name, appSlug }),
        }),
      });
      out.push(result(this.name, app.action, "xflow.apps", app.row));
    }
    return out;
  },
  verify(context) {
    const workspace = requireMarked(context.store.findOne("xflow.workspaces", (row) => row.slug === context.workspaceSlug), "xflow workspace");
    const outsiderId = context.state.identities.outsider.id;
    if (context.store.findOne("xflow.workspace_members", (row) => row.workspaceId === workspace.id && row.userId === outsiderId)) {
      throw new Error("outsider unexpectedly has XFlow workspace membership");
    }
    for (const appSlug of APP_SLUGS) {
      requireMarked(context.store.findOne("xflow.apps", (row) => row.workspaceId === workspace.id && row.slug === appSlug), `xflow app ${appSlug}`);
    }
    return [result(this.name, "verified", "xflow.workspaces", workspace)];
  },
  cleanup(context) {
    const workspaceId = context.state.workspace?.id;
    const deleted = [
      context.store.deleteMarked("xflow.apps", context.store.findMany("xflow.apps", (row) => row.workspaceId === workspaceId).map((row) => row.id)),
      context.store.deleteMarked("xflow.workspace_members", context.store.findMany("xflow.workspace_members", (row) => row.workspaceId === workspaceId).map((row) => row.id)),
      context.store.deleteMarked("xflow.workspaces", workspaceId ? [workspaceId] : []),
    ];
    return [{ adapter: this.name, action: "deleted", table: "xflow", count: deleted.reduce((sum, value) => sum + value, 0) }];
  },
};
