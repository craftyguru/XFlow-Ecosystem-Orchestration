import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const contractsDir = path.join(rootDir, "ecosystem-contracts");
const packageDir = path.join(rootDir, "packages", "ecosystem-contracts");
const srcDir = path.join(packageDir, "src");

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(contractsDir, fileName), "utf8"));
}

function stableJson(value) {
  return JSON.stringify(value, null, 2);
}

function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, "utf8");
}

const apps = readJson("apps.json");
const env = readJson("env-contract.json");
const routes = readJson("routes.json");
const tokenTypes = readJson("token-types.json");

writeFile(
  path.join(packageDir, "package.json"),
  `${stableJson({
    name: "@xflow-ecosystem/contracts",
    version: "0.1.0",
    private: true,
    type: "module",
    main: "./dist/index.js",
    types: "./dist/index.d.ts",
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
      },
    },
    sideEffects: false,
    files: [
      "dist",
      "package.json",
    ],
    scripts: {
      build: "tsc -p tsconfig.json",
      typecheck: "tsc -p tsconfig.json --noEmit",
    },
    devDependencies: {
      typescript: "^5.7.0",
    },
  })}\n`,
);

writeFile(
  path.join(packageDir, "tsconfig.json"),
  `${stableJson({
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "Bundler",
      declaration: true,
      emitDeclarationOnly: false,
      outDir: "dist",
      rootDir: "src",
      strict: true,
      noUncheckedIndexedAccess: true,
      exactOptionalPropertyTypes: true,
      skipLibCheck: true,
    },
    include: ["src/**/*.ts"],
  })}\n`,
);

const content = `// GENERATED FILE. Do not edit by hand.
// Source: ecosystem-contracts/*.json

export * from "./crevux-mobile-v1.js";

export type CanonicalAppSlug = ${apps.apps.map((app) => JSON.stringify(app.slug)).join(" | ")};
export type TokenTypeId = ${tokenTypes.tokenTypes.map((token) => JSON.stringify(token.id)).join(" | ")};
export type ContractEnvironment = "local" | "staging" | "production" | "all";

export interface EcosystemAppContract {
  slug: CanonicalAppSlug;
  displayName: string;
  folderName: string;
  domain: string;
  role: string;
  ownsIdentity: boolean;
  ownsBilling: boolean;
  ownsEntitlements: boolean;
  ownsUsageMetering: boolean;
  dependsOn: CanonicalAppSlug[];
  legacyAliases: string[];
}

export interface EcosystemEnvContract {
  app: CanonicalAppSlug;
  name: string;
  required: boolean;
  environment: ContractEnvironment;
  secret: boolean;
  safePlaceholderAllowed: boolean;
  purpose: string;
  sourceOfTruth: string;
  usedBy: string[];
  notes: string;
  alias?: boolean;
}

export interface EcosystemRouteContract {
  ownerApp: CanonicalAppSlug;
  consumerApps: Array<CanonicalAppSlug | "browser" | "stripe">;
  method: string;
  path: string;
  purpose: string;
  requiredHeaders: string[];
  requiredBodyFields: string[];
  authType: "public" | "service" | "ucl" | "usage-ingest" | "oauth-client" | "oauth-user" | "webhook" | "none";
  tokenType: TokenTypeId | null;
  responseEnvelope: string;
  productionFailureMode: string;
  notes: string;
  public?: boolean;
}

export interface EcosystemTokenTypeContract {
  id: TokenTypeId;
  owner: CanonicalAppSlug | "cloudflare" | "sendgrid" | "database-provider" | "sentry";
  allowedConsumers: Array<CanonicalAppSlug>;
  allowedUse: string;
  forbiddenUse: string;
  exampleHeaderName: string;
  shouldBeAppScoped: boolean;
  shouldBeWorkspaceScoped: boolean;
  rotationNotes: string;
}

export const canonicalAppSlugs = ${stableJson(apps.canonicalSlugs)} as readonly CanonicalAppSlug[];

export const ecosystemApps = ${stableJson(apps.apps)} as const satisfies readonly EcosystemAppContract[];

export const ecosystemEnv = ${stableJson(env.env)} as const satisfies readonly EcosystemEnvContract[];

export const ecosystemRoutes = ${stableJson(routes.routes)} as const satisfies readonly EcosystemRouteContract[];

export const ecosystemTokenTypes = ${stableJson(tokenTypes.tokenTypes)} as const satisfies readonly EcosystemTokenTypeContract[];

export function isCanonicalAppSlug(value: string): value is CanonicalAppSlug {
  return (canonicalAppSlugs as readonly string[]).includes(value);
}

export function getEcosystemApp(slug: CanonicalAppSlug): EcosystemAppContract {
  const app = ecosystemApps.find((entry) => entry.slug === slug);
  if (!app) {
    throw new Error(\`Unknown ecosystem app slug: \${slug}\`);
  }
  return app;
}

export function getRoutesForOwner(ownerApp: CanonicalAppSlug): readonly EcosystemRouteContract[] {
  return ecosystemRoutes.filter((route) => route.ownerApp === ownerApp);
}

export function getEnvForApp(app: CanonicalAppSlug): readonly EcosystemEnvContract[] {
  return ecosystemEnv.filter((entry) => entry.app === app);
}
`;

writeFile(path.join(srcDir, "index.ts"), content);

console.log(`Generated ${path.relative(rootDir, path.join(srcDir, "index.ts"))}`);
