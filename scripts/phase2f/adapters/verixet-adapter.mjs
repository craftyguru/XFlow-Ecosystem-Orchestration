import { fixtureId, marker, requireMarked, result } from "./adapter-utils.mjs";

export const verixetAdapter = {
  name: "verixet",
  plan() {
    return [{ adapter: this.name, action: "plan", target: "billing-account/entitlement-denial" }];
  },
  provision(context) {
    const workspaceId = context.state.workspace.id;
    const out = [];
    const account = context.store.createOrReuse({
      table: "verixet.billing_accounts",
      lookup: (row) => row.workspaceId === workspaceId && row.name === "Phase 2F non-billable test account",
      create: () => ({
        id: fixtureId("verixet", "billing_account"),
        workspaceId,
        name: "Phase 2F non-billable test account",
        provider: "manual_test",
        stripeCustomerId: null,
        status: "active",
        fixtureMetadata: marker({ adapter: this.name, fixture: "billing_account" }),
      }),
    });
    context.state.verixet = {
      billingAccountId: account.row.id,
      billingAccountAction: context.state.verixet?.billingAccountAction === "created" ? "created" : account.action,
    };
    out.push(result(this.name, account.action, "verixet.billing_accounts", account.row));
    return out;
  },
  verify(context) {
    const account = requireMarked(context.store.findOne("verixet.billing_accounts", (row) => row.id === context.state.verixet.billingAccountId), "verixet billing account");
    if (account.stripeCustomerId) throw new Error("Verixet test billing account has Stripe customer id");
    const deniedUserId = context.state.identities.denied.id;
    const activeGrant = context.store.findOne("verixet.entitlement_grants", (row) => row.userId === deniedUserId && !row.revokedAt);
    if (activeGrant) throw new Error("denied user unexpectedly has active Verixet entitlement");
    return [result(this.name, "verified", "verixet.billing_accounts", account)];
  },
  cleanup(context) {
    const id = context.state.verixet?.billingAccountId;
    return [{ adapter: this.name, action: "deleted", table: "verixet.billing_accounts", count: context.store.deleteMarked("verixet.billing_accounts", id ? [id] : []) }];
  },
};
