# Crevux local PostgreSQL 16 cleanup inventory

Status: **PRESERVE; CLEANUP NOT AUTHORIZED**

Root: `C:\Users\robsc\Documents\Codex\2026-11-06\work-locally-on-my-crevux-project\work\local-pg16`

This is the existing zero-cost, workspace-local Crevux and Verixet qualification environment. It registers no Windows service, changes no system PATH, and listens only on `127.0.0.1:55491` when explicitly started. It was stopped after inspection.

## Runtime and storage

| Item | Location | Inventory |
| --- | --- | --- |
| Cluster data | `local-pg16\data` | 107,568,478 bytes; preserve intact |
| PostgreSQL runtime | `local-pg16\runtime\pgsql` | PostgreSQL server/client 16.15; runtime tree 875,067,514 bytes |
| Downloaded archive | `local-pg16\download\postgresql-16.15-1-windows-x64-binaries.zip` | 332,441,502 bytes |
| Server log | `local-pg16\postgres.log` | Approximately 240 KB; contains local server diagnostics only |
| Credential file | `local-pg16\test-secrets.ps1` | 73 bytes; password value not inventoried or exposed |

The root and data directory have inheritance disabled and grant full control only to the current Windows user and `SYSTEM`. The credential file inherits those restricted root permissions. No credential content is included in this document.

## Cluster identities and databases

- Host: `127.0.0.1`
- Port: `55491`
- Primary test database: `crevux_verixet_test` (10,715,663 bytes at inspection)
- Existing repeatability database: `crevux_mobile8_repeat_a` (11,076,111 bytes)
- Existing repeatability database: `crevux_mobile8_repeat_b` (10,699,279 bytes)
- Maintenance database: `postgres` (8,035,351 bytes)
- Login role: `cvx_test_runner`, local-cluster superuser/createdb/createrole for disposable testing only
- No-login fixture roles: `anon`, `authenticated`, `service_role`

The two repeatability databases already existed from the completed dual-clone catalog qualification. They were not created during this closeout and are preserved with the primary test database.

## Operational scripts

| Script | Purpose | SHA-256 |
| --- | --- | --- |
| `common.ps1` | Fixed paths, loopback port, credentials loading, start/stop helpers, ACL helper | `e5f37d484de7048159dc3bd6a6cd01b49f3782c8fb8b29b062e5b8b12a08e4d6` |
| `provision.ps1` | One-time cluster/database provisioning | `d54750aceb381910a31ca7cb3212aa11176e1841c452a4669bd55ca069f86776` |
| `start.ps1` | Start existing cluster | `654ca4b0ab2cd2740d13681fc8bc6c865ff1062a4ffe4efba227ca9df42fee28` |
| `stop.ps1` | Checkpointed fast shutdown | `4f6296039c276d2dece42e1494259addaa783a575656ddd4803004595082eff3` |
| `reset.ps1` | Drop/recreate only `crevux_verixet_test` | `1b51271453580840e16d117147265060332ccdeeffdd11f51aea517f9f2d6d89` |
| `cleanup.ps1` | Stop cluster and remove data, credentials, and log while retaining portable binaries | `c8b8baf837b1858accbdee1bc3ef48a5a04c5266df4b8707cfe7a1786c65b4cd` |

## Deferred cleanup procedure

Do not execute this procedure until Crevux release qualification is complete and the owner explicitly authorizes destructive cleanup.

1. Confirm no test process is using port `55491` and preserve any required test reports.
2. Reconfirm the resolved cleanup target is exactly the `local-pg16` root above.
3. Run `stop.ps1` and verify the server is stopped.
4. If full cleanup is approved, run the reviewed `cleanup.ps1`; it removes the complete cluster data directory, credential file, and log, but retains runtime binaries and the downloaded archive.
5. If binary/archive removal is also desired, obtain a separate explicit scope naming `local-pg16\runtime` and `local-pg16\download`; the current cleanup script intentionally preserves both.
6. Report what was removed and whether any retained artifact remains.

Until then, do not reset databases, rotate the local password, delete logs, remove binaries, or modify the cluster.
