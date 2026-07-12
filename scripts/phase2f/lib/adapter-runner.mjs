import { adapters } from "../adapters/index.mjs";
import { MemoryFixtureStore, summarizeActions } from "./fixture-store.mjs";
import { buildPlan, IDENTITIES, validatePlan, validateRuntime } from "./provisioner-core.mjs";

export function buildContext({ args, store = new MemoryFixtureStore(), state = {}, env = {} }) {
  return {
    args,
    env,
    store,
    state: {
      identities: {},
      ...state,
    },
    identities: IDENTITIES.filter((identity) => identity.required || args.includeOptional),
    workspaceSlug: env.PHASE2F_PROOF_WORKSPACE_SLUG || "ecosystem-production-proof-local-validation",
  };
}

export function validateAdapterInterface(adapterList = adapters) {
  const errors = [];
  for (const adapter of adapterList) {
    for (const method of ["plan", "provision", "verify", "cleanup"]) {
      if (typeof adapter[method] !== "function") errors.push(`${adapter.name ?? "(unknown)"}.${method} missing`);
    }
  }
  return errors;
}

export async function runAdapters(context, phase) {
  const results = [];
  const order = phase === "cleanup" ? [...adapters].reverse() : adapters;
  for (const adapter of order) {
    results.push(...(await adapter[phase](context)));
  }
  return results;
}

export async function runLocalValidation({ args, env = {} }) {
  const runtimeErrors = validateRuntime(args, env);
  const plan = buildPlan({ includeOptional: args.includeOptional });
  const planErrors = validatePlan(plan);
  const interfaceErrors = validateAdapterInterface();
  if (runtimeErrors.length || planErrors.length || interfaceErrors.length) {
    return { ok: false, runtimeErrors, planErrors, interfaceErrors };
  }

  const context = buildContext({ args, env });
  const baseline = context.store.counts();
  const firstProvision = await runAdapters(context, "provision");
  const firstVerify = await runAdapters(context, "verify");
  const secondProvision = await runAdapters(context, "provision");
  const secondVerify = await runAdapters(context, "verify");
  const cleanupDryRun = adapters.map((adapter) => ({ adapter: adapter.name, action: "cleanup-dry-run" }));
  const cleanup = await runAdapters(context, "cleanup");
  const afterCleanup = context.store.counts();
  const unrelatedRowsUnchanged = Object.entries(baseline).every(([table, count]) => (afterCleanup[table] ?? 0) === count);

  return {
    ok: unrelatedRowsUnchanged,
    environment: args.environment,
    productionMutation: false,
    firstProvision: summarizeActions(firstProvision),
    firstVerify: summarizeActions(firstVerify),
    secondProvision: summarizeActions(secondProvision),
    secondVerify: summarizeActions(secondVerify),
    cleanupDryRun: summarizeActions(cleanupDryRun),
    cleanup: summarizeActions(cleanup),
    unrelatedRowsUnchanged,
    state: context.state,
  };
}
