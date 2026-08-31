import { fixtureId, marker, requireMarked, result } from "./adapter-utils.mjs";

export const crevuxAdapter = {
  name: "crevux",
  plan() {
    return [{ adapter: this.name, action: "plan", target: "project/asset/export placeholder" }];
  },
  provision(context) {
    const standardId = context.state.identities.standard.id;
    const workspace = context.store.createOrReuse({
      table: "crevux.workspaces",
      lookup: (row) => row.name === "Phase 2F Crevux Proof Workspace",
      create: () => ({ id: fixtureId("crevux", "workspace"), name: "Phase 2F Crevux Proof Workspace", ownerUserId: standardId, fixtureMetadata: marker({ adapter: this.name }) }),
    });
    const project = context.store.createOrReuse({
      table: "crevux.projects",
      lookup: (row) => row.workspaceId === workspace.row.id && row.title === "Phase 2F Proof Project",
      create: () => ({ id: fixtureId("crevux", "project"), workspaceId: workspace.row.id, userId: standardId, title: "Phase 2F Proof Project", status: "active", fixtureMetadata: marker({ adapter: this.name }) }),
    });
    const asset = context.store.createOrReuse({
      table: "crevux.assets",
      lookup: (row) => row.projectId === project.row.id && row.filename === "phase2f-placeholder.png",
      create: () => ({ id: fixtureId("crevux", "asset"), workspaceId: workspace.row.id, userId: standardId, projectId: project.row.id, type: "image", filename: "phase2f-placeholder.png", metadata: JSON.stringify(marker({ adapter: this.name })), fixtureMetadata: marker({ adapter: this.name }) }),
    });
    const exp = context.store.createOrReuse({
      table: "crevux.asset_exports",
      lookup: (row) => row.sourceAssetId === asset.row.id && row.exportKind === "metadata_only",
      create: () => ({ id: fixtureId("crevux", "export"), workspaceId: workspace.row.id, userId: standardId, sourceAssetId: asset.row.id, assetType: "image", exportKind: "metadata_only", status: "completed", creditsCharged: 0, fixtureMetadata: marker({ adapter: this.name }) }),
    });
    context.state.crevux = { workspaceId: workspace.row.id, projectId: project.row.id, assetId: asset.row.id, exportId: exp.row.id };
    return [workspace, project, asset, exp].map((entry) => result(this.name, entry.action, "crevux", entry.row));
  },
  verify(context) {
    const exp = requireMarked(context.store.findOne("crevux.asset_exports", (row) => row.id === context.state.crevux.exportId), "crevux export");
    if (exp.creditsCharged !== 0) throw new Error("Crevux export charged credits");
    return [result(this.name, "verified", "crevux.asset_exports", exp)];
  },
  cleanup(context) {
    const s = context.state.crevux ?? {};
    const count = context.store.deleteMarked("crevux.asset_exports", [s.exportId]) + context.store.deleteMarked("crevux.assets", [s.assetId]) + context.store.deleteMarked("crevux.projects", [s.projectId]) + context.store.deleteMarked("crevux.workspaces", [s.workspaceId]);
    return [{ adapter: this.name, action: "deleted", table: "crevux", count }];
  },
};
