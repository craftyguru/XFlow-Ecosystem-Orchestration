import { IDENTITIES } from "../lib/provisioner-core.mjs";
import { fixtureId, marker, requireMarked, result } from "./adapter-utils.mjs";

export const authAdapter = {
  name: "auth",
  plan(context) {
    return context.identities.map((identity) => ({ adapter: this.name, action: "plan", identity: identity.label }));
  },
  provision(context) {
    const out = [];
    for (const identity of context.identities) {
      const emailLabel = identity.label;
      const created = context.store.createOrReuse({
        table: "auth.identities",
        lookup: (row) => row.emailLabel === emailLabel,
        create: () => ({
          id: fixtureId("auth", identity.key),
          emailLabel,
          role: identity.role === "workspace_admin" ? "workspace_admin" : "user",
          fixtureMetadata: marker({ adapter: this.name, identity: identity.label }),
        }),
      });
      const previous = context.state.identities[identity.key];
      context.state.identities[identity.key] = {
        id: created.row.id,
        label: identity.label,
        action: previous?.action === "created" ? "created" : created.action,
      };
      out.push(result(this.name, created.action, "auth.identities", created.row));
    }
    return out;
  },
  verify(context) {
    return context.identities.map((identity) => {
      const row = requireMarked(
        context.store.findOne("auth.identities", (candidate) => candidate.emailLabel === identity.label),
        `identity ${identity.label}`,
      );
      if (identity.role !== "workspace_admin" && row.role !== "user") throw new Error(`identity ${identity.label} has unsafe role`);
      return result(this.name, "verified", "auth.identities", row);
    });
  },
  cleanup(context) {
    const ids = Object.values(context.state.identities ?? {})
      .filter((entry) => entry.action === "created")
      .map((entry) => entry.id);
    return [{ adapter: this.name, action: "deleted", table: "auth.identities", count: context.store.deleteMarked("auth.identities", ids) }];
  },
};
