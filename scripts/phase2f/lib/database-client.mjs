export function redactConnectionString(value) {
  if (!value) return "";
  return String(value).replace(/:\/\/([^:@/]+):([^@/]+)@/, "://[REDACTED]:[REDACTED]@");
}

export function validateDatabaseTarget({ environment, url, expectedProjectRef }) {
  if (environment === "production") {
    if (!expectedProjectRef) return ["production execution requires PHASE2F_EXPECTED_SUPABASE_PROJECT_REF"];
    if (!url || !url.includes(expectedProjectRef)) return ["database target does not match expected production project ref"];
  }
  if (environment !== "production" && environment !== "local") return [`unsupported environment ${environment}`];
  return [];
}

export class SupabaseRestClient {
  constructor({ url, serviceRoleKey, schema = "public", fetchImpl = globalThis.fetch }) {
    if (!url) throw new Error("SupabaseRestClient requires url");
    if (!serviceRoleKey) throw new Error("SupabaseRestClient requires service role key");
    this.url = url.replace(/\/$/, "");
    this.serviceRoleKey = serviceRoleKey;
    this.schema = schema;
    this.fetch = fetchImpl;
  }

  async request(path, init = {}) {
    const response = await this.fetch(`${this.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: this.serviceRoleKey,
        authorization: `Bearer ${this.serviceRoleKey}`,
        "content-type": "application/json",
        "accept-profile": this.schema,
        "content-profile": this.schema,
        ...(init.headers ?? {}),
      },
      signal: AbortSignal.timeout(10_000),
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Supabase REST ${response.status}: ${text.slice(0, 240)}`);
    }
    return text ? JSON.parse(text) : null;
  }
}
