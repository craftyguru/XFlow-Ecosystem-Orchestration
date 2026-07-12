import { fixtureId, marker, requireMarked, result } from "./adapter-utils.mjs";

export const wordgeniAdapter = {
  name: "wordgeni",
  plan() {
    return [{ adapter: this.name, action: "plan", target: "document/source/provenance/export" }];
  },
  provision(context) {
    const standardId = context.state.identities.standard.id;
    const workspace = context.store.createOrReuse({
      table: "wordgeni.workspaces",
      lookup: (row) => row.slug === "phase2f-wordgeni-proof",
      create: () => ({ id: fixtureId("wordgeni", "workspace"), slug: "phase2f-wordgeni-proof", name: "Phase 2F WordGeni Proof", ownerId: standardId, plan: "free", fixtureMetadata: marker({ adapter: this.name }) }),
    });
    const project = context.store.createOrReuse({
      table: "wordgeni.projects",
      lookup: (row) => row.workspaceId === workspace.row.id && row.name === "Phase 2F Source Proof",
      create: () => ({ id: fixtureId("wordgeni", "project"), workspaceId: workspace.row.id, name: "Phase 2F Source Proof", mode: "research", status: "active", fixtureMetadata: marker({ adapter: this.name }) }),
    });
    const source = context.store.createOrReuse({
      table: "wordgeni.sources",
      lookup: (row) => row.projectId === project.row.id && row.name === "Phase 2F static source",
      create: () => ({ id: fixtureId("wordgeni", "source"), projectId: project.row.id, name: "Phase 2F static source", type: "note", content: "Static source fixture for production proof.", status: "ready", metadata: marker({ adapter: this.name }) }),
    });
    const document = context.store.createOrReuse({
      table: "wordgeni.documents",
      lookup: (row) => row.projectId === project.row.id && row.title === "Phase 2F proof document",
      create: () => ({ id: fixtureId("wordgeni", "document"), projectId: project.row.id, title: "Phase 2F proof document", content: "{}", plainText: "Stored proof document.", fixtureMetadata: marker({ adapter: this.name }) }),
    });
    const provenance = context.store.createOrReuse({
      table: "wordgeni.provenance_events",
      lookup: (row) => row.documentId === document.row.id && row.sessionId === "phase2f",
      create: () => ({ id: fixtureId("wordgeni", "provenance"), documentId: document.row.id, eventType: "source-cited", actorType: "system", actorId: "phase2f", sessionId: "phase2f", sourceRefs: [source.row.id], fixtureMetadata: marker({ adapter: this.name }) }),
    });
    context.state.wordgeni = { workspaceId: workspace.row.id, projectId: project.row.id, sourceId: source.row.id, documentId: document.row.id, provenanceId: provenance.row.id };
    return [workspace, project, source, document, provenance].map((entry) => result(this.name, entry.action, "wordgeni", entry.row));
  },
  verify(context) {
    const source = requireMarked(context.store.findOne("wordgeni.sources", (row) => row.id === context.state.wordgeni.sourceId), "wordgeni source");
    if (source.status !== "ready") throw new Error("WordGeni source is not ready stored fixture");
    return [result(this.name, "verified", "wordgeni.sources", source)];
  },
  cleanup(context) {
    const s = context.state.wordgeni ?? {};
    const count = context.store.deleteMarked("wordgeni.provenance_events", [s.provenanceId]) + context.store.deleteMarked("wordgeni.documents", [s.documentId]) + context.store.deleteMarked("wordgeni.sources", [s.sourceId]) + context.store.deleteMarked("wordgeni.projects", [s.projectId]) + context.store.deleteMarked("wordgeni.workspaces", [s.workspaceId]);
    return [{ adapter: this.name, action: "deleted", table: "wordgeni", count }];
  },
};
