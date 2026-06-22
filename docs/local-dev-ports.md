# Local Dev Ports

Each app-owned `dev` script pins its local port so a stale shell-level `PORT`
does not make two sites fight over the same listener.

| App | Command | Local URL |
| --- | --- | --- |
| XFlow | `cd apps/XFlow && npm run dev` | `http://localhost:3101` |
| Verixet | `cd apps/Verixet && npm run dev` | `http://localhost:3102` |
| WordGeni web | `cd apps/WordGeni && pnpm run dev` | `http://localhost:3103` |
| RatAiFy | `cd apps/RatAiFy && npm run dev` | `http://127.0.0.1:5000` |
| AudAiX | `cd apps/AudAiX && npm run dev` | `http://127.0.0.1:8787` |
| CreVux web | `cd apps/CreVux && pnpm run dev` | `http://127.0.0.1:3105` |

Notes:

- XFlow, Verixet, and WordGeni pass the port directly to Next.js, so a leftover
  `$env:PORT = "3001"` does not override the app's assigned port.
- CreVux uses `WEB_DEV_PORT` for intentional Vite overrides and ignores generic
  shell `PORT` in the web runner.
- RatAiFy and AudAiX set their API ports explicitly in the package script.
- If a port is still busy, another copy of that same app is probably already
  running. Stop that terminal or choose an intentional one-off override.
