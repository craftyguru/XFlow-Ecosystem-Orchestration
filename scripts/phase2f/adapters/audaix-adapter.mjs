import { fixtureId, marker, requireMarked, result } from "./adapter-utils.mjs";

export const audaixAdapter = {
  name: "audaix",
  plan() {
    return [{ adapter: this.name, action: "plan", target: "stored audit/report/evidence" }];
  },
  provision(context) {
    const workspaceId = context.state.workspace.id;
    const audit = context.store.createOrReuse({
      table: "audaix.audits",
      lookup: (row) => row.workspaceId === workspaceId && row.targetUrl === "https://phase2f-audaix.invalid",
      create: () => ({ id: fixtureId("audaix", "audit"), workspaceId, targetUrl: "https://phase2f-audaix.invalid", status: "completed", fixtureMetadata: marker({ adapter: this.name }) }),
    });
    const report = context.store.createOrReuse({
      table: "audaix.audit_reports",
      lookup: (row) => row.auditId === audit.row.id,
      create: () => ({ id: fixtureId("audaix", "report"), workspaceId, auditId: audit.row.id, status: "published", report: marker({ adapter: this.name, fixture: "report" }), fixtureMetadata: marker({ adapter: this.name }) }),
    });
    const finding = context.store.createOrReuse({
      table: "audaix.audit_findings",
      lookup: (row) => row.auditId === audit.row.id && row.title === "Phase 2F stored evidence",
      create: () => ({ id: fixtureId("audaix", "finding"), workspaceId, auditId: audit.row.id, severity: "info", title: "Phase 2F stored evidence", fixtureMetadata: marker({ adapter: this.name }) }),
    });
    context.state.audaix = { auditId: audit.row.id, reportId: report.row.id, findingId: finding.row.id };
    return [result(this.name, audit.action, "audaix.audits", audit.row), result(this.name, report.action, "audaix.audit_reports", report.row), result(this.name, finding.action, "audaix.audit_findings", finding.row)];
  },
  verify(context) {
    const audit = requireMarked(context.store.findOne("audaix.audits", (row) => row.id === context.state.audaix.auditId), "audaix audit");
    if (audit.status !== "completed") throw new Error("AudAiX audit is not completed stored state");
    return [result(this.name, "verified", "audaix.audits", audit)];
  },
  cleanup(context) {
    const s = context.state.audaix ?? {};
    const count = context.store.deleteMarked("audaix.audit_findings", [s.findingId]) + context.store.deleteMarked("audaix.audit_reports", [s.reportId]) + context.store.deleteMarked("audaix.audits", [s.auditId]);
    return [{ adapter: this.name, action: "deleted", table: "audaix", count }];
  },
};
