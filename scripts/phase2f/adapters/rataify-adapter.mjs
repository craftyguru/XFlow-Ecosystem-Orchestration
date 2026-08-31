import { fixtureId, marker, requireMarked, result } from "./adapter-utils.mjs";

export const rataifyAdapter = {
  name: "rataify",
  plan() {
    return [{ adapter: this.name, action: "plan", target: "stored site/scan/report" }];
  },
  provision(context) {
    const workspaceId = context.state.workspace.id;
    const out = [];
    const org = context.store.createOrReuse({
      table: "rataify.orgs",
      lookup: (row) => row.ecosystemWorkspaceId === workspaceId,
      create: () => ({ id: fixtureId("rataify", "org"), ecosystemWorkspaceId: workspaceId, name: "Phase 2F Proof Org", planTier: "free", scansAllowed: 0, fixtureMetadata: marker({ adapter: this.name }) }),
    });
    const site = context.store.createOrReuse({
      table: "rataify.sites",
      lookup: (row) => row.orgId === org.row.id && row.domain === "phase2f-rataify.invalid",
      create: () => ({ id: fixtureId("rataify", "site"), orgId: org.row.id, domain: "phase2f-rataify.invalid", url: "https://phase2f-rataify.invalid", status: "verified", fixtureMetadata: marker({ adapter: this.name }) }),
    });
    const scan = context.store.createOrReuse({
      table: "rataify.scans",
      lookup: (row) => row.siteId === site.row.id && row.fixtureKey === "phase2f",
      create: () => ({ id: fixtureId("rataify", "scan"), siteId: site.row.id, status: "completed", pagesScanned: 1, summaryScore: 100, fixtureKey: "phase2f", fixtureMetadata: marker({ adapter: this.name }) }),
    });
    const report = context.store.createOrReuse({
      table: "rataify.report_export_requests",
      lookup: (row) => row.siteId === site.row.id && row.exportType === "evidence_summary",
      create: () => ({ id: fixtureId("rataify", "report"), siteId: site.row.id, orgId: org.row.id, exportType: "evidence_summary", requestedFormat: "metadata_only", status: "completed_metadata_only", fixtureMetadata: marker({ adapter: this.name }) }),
    });
    context.state.rataify = { orgId: org.row.id, siteId: site.row.id, scanId: scan.row.id, reportId: report.row.id };
    out.push(result(this.name, org.action, "rataify.orgs", org.row), result(this.name, site.action, "rataify.sites", site.row), result(this.name, scan.action, "rataify.scans", scan.row), result(this.name, report.action, "rataify.report_export_requests", report.row));
    return out;
  },
  verify(context) {
    const scan = requireMarked(context.store.findOne("rataify.scans", (row) => row.id === context.state.rataify.scanId), "rataify scan");
    if (scan.status !== "completed") throw new Error("RatAiFy scan fixture is not completed stored state");
    return [result(this.name, "verified", "rataify.scans", scan)];
  },
  cleanup(context) {
    const s = context.state.rataify ?? {};
    const count = context.store.deleteMarked("rataify.report_export_requests", [s.reportId]) + context.store.deleteMarked("rataify.scans", [s.scanId]) + context.store.deleteMarked("rataify.sites", [s.siteId]) + context.store.deleteMarked("rataify.orgs", [s.orgId]);
    return [{ adapter: this.name, action: "deleted", table: "rataify", count }];
  },
};
