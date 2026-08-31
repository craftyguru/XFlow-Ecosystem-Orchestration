import fs from "node:fs";
import net from "node:net";
import path from "node:path";

export function listSqlMigrations(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

export function assertStrictMigrationOrder(files, label) {
  if (files.length === 0) throw new Error(`${label} has no SQL migrations.`);
  const sorted = [...files].sort((a, b) => a.localeCompare(b));
  if (files.some((file, index) => file !== sorted[index])) {
    throw new Error(`${label} migrations are not in strict filename order.`);
  }
  if (new Set(files).size !== files.length) {
    throw new Error(`${label} contains duplicate migration filenames.`);
  }
}

export function journalThroughTag(journal, tag) {
  const index = journal.entries.findIndex((entry) => entry.tag === tag);
  if (index < 0) throw new Error(`XFlow migration journal does not contain ${tag}.`);
  return { ...journal, entries: journal.entries.slice(0, index + 1) };
}

export async function reserveLoopbackPorts(count) {
  const servers = [];
  const ports = [];
  try {
    for (let i = 0; i < count; i += 1) {
      const server = net.createServer();
      await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", () => resolve());
      });
      servers.push(server);
      ports.push(server.address().port);
    }
    return ports;
  } finally {
    await Promise.all(
      servers.map((server) => new Promise((resolve) => server.close(() => resolve()))),
    );
  }
}

export function buildDisposableSupabaseConfig({ projectId, ports }) {
  const [api, db, shadow, studio, inbucket, analytics] = ports;
  return `project_id = "${projectId}"

[api]
enabled = true
port = ${api}
schemas = ["public", "graphql_public", "storage"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = ${db}
shadow_port = ${shadow}
major_version = 17

[db.pooler]
enabled = false

[db.migrations]
enabled = true
schema_paths = []

[db.seed]
enabled = false
sql_paths = []

[realtime]
enabled = false

[studio]
enabled = false
port = ${studio}

[inbucket]
enabled = false
port = ${inbucket}

[storage]
enabled = true
file_size_limit = "50MiB"

[auth]
enabled = true
site_url = "http://127.0.0.1:${api}"
additional_redirect_urls = []
enable_signup = false

[edge_runtime]
enabled = false

[analytics]
enabled = false
port = ${analytics}
`;
}

export function redactCommandOutput(output) {
  return String(output)
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[REDACTED_DATABASE_URL]")
    .replace(/(?:anon|service_role|secret) key:\s*\S+/gi, "[REDACTED_LOCAL_KEY]")
    .replace(/eyJ[A-Za-z0-9._-]+/g, "[REDACTED_LOCAL_JWT]");
}
