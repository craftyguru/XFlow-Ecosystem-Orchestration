# Railway Sentry Launch Checklist

Use this checklist while entering Sentry variables in Railway. Do not paste real values into this document.

| Railway service name | App slug | Runtime type | Sentry frontend project | Sentry backend project | Required DSN envs | Required source-map envs | Required release env | Present in Railway? | Verified after deploy? |
|---|---|---|---|---|---|---|---|---|---|
| XFlow web | `xflow` | fullstack | `xflow-frontend` | `xflow-backend` | `NEXT_PUBLIC_SENTRY_DSN=<xflow-frontend-dsn>`; `XFLOW_SENTRY_DSN=<xflow-backend-dsn>` | `SENTRY_ORG=<sentry-org-slug>`; `SENTRY_PROJECT=xflow-frontend`; `SENTRY_AUTH_TOKEN=<sentry-release-upload-token>` | `SENTRY_RELEASE=<railway-git-sha-or-release-name>` | manual | manual |
| Verixet web | `verixet` | fullstack | `verixet-frontend` | `verixet-backend` | `NEXT_PUBLIC_SENTRY_DSN=<verixet-frontend-dsn>`; `VERIXET_SENTRY_DSN=<verixet-backend-dsn>` | `SENTRY_ORG=<sentry-org-slug>`; `SENTRY_PROJECT=verixet-frontend`; `SENTRY_AUTH_TOKEN=<sentry-release-upload-token>` | `SENTRY_RELEASE=<railway-git-sha-or-release-name>` | manual | manual |
| RatAiFy frontend | `rataify` | frontend | `rataify-frontend` | none | `VITE_SENTRY_DSN=<rataify-frontend-dsn>` | none currently wired | `SENTRY_RELEASE=<railway-git-sha-or-release-name>` | manual | manual |
| RatAiFy API | `rataify` | API/backend | none | `rataify-backend` | `RATAIFY_SENTRY_DSN=<rataify-backend-dsn>` | none currently wired | `SENTRY_RELEASE=<railway-git-sha-or-release-name>` | manual | manual |
| AudAiX dashboard | `audaix` | frontend | `audaix-frontend` | none | `VITE_SENTRY_DSN=<audaix-frontend-dsn>` | none currently wired | `SENTRY_RELEASE=<railway-git-sha-or-release-name>` | manual | manual |
| AudAiX API/workers | `audaix` | backend/worker | none | `audaix-backend` | `AUDAIX_SENTRY_DSN=<audaix-backend-dsn>` | none currently wired | `SENTRY_RELEASE=<railway-git-sha-or-release-name>` | manual | manual |
| WordGeni web | `wordgeni` | fullstack | `wordgeni-frontend` | `wordgeni-backend` | `NEXT_PUBLIC_SENTRY_DSN=<wordgeni-frontend-dsn>`; `WORDGENI_SENTRY_DSN=<wordgeni-backend-dsn>` | `SENTRY_ORG=<sentry-org-slug>`; `SENTRY_PROJECT=wordgeni-frontend`; `SENTRY_AUTH_TOKEN=<sentry-release-upload-token>` | `SENTRY_RELEASE=<railway-git-sha-or-release-name>` | manual | manual |
| WordGeni API | `wordgeni` | API/backend | none | `wordgeni-backend` | `WORDGENI_SENTRY_DSN=<wordgeni-backend-dsn>` | none currently wired | `SENTRY_RELEASE=<railway-git-sha-or-release-name>` | manual | manual |
| WordGeni worker | `wordgeni` | worker | none | `wordgeni-backend` | `WORDGENI_SENTRY_DSN=<wordgeni-backend-dsn>` | none currently wired | `SENTRY_RELEASE=<railway-git-sha-or-release-name>` | manual | manual |
| CreVux image-gen | `crevux` | frontend | `crevux-frontend` | none | `VITE_SENTRY_DSN=<crevux-frontend-dsn>` | none currently wired | `SENTRY_RELEASE=<railway-git-sha-or-release-name>` | manual | manual |
| CreVux API | `crevux` | API/backend | none | `crevux-backend` | `CREVUX_SENTRY_DSN=<crevux-backend-dsn>` | none currently wired unless API source-map upload is added | `SENTRY_RELEASE=<railway-git-sha-or-release-name>` | manual | manual |

## Required Sampling And Environment Values

Add the matching environment and sample-rate variables beside each DSN:

- Next.js browser services: `NEXT_PUBLIC_SENTRY_ENVIRONMENT=production`, `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.05`, `NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0`, `NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=0.1`
- Vite browser services: `VITE_SENTRY_ENVIRONMENT=production`, `VITE_SENTRY_TRACES_SAMPLE_RATE=0.05`, `VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0`, `VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=0.1`
- Backend/API/worker services: `<APP>_SENTRY_ENVIRONMENT=production`, `<APP>_SENTRY_TRACES_SAMPLE_RATE=0.05`

## Manual Fields

`Present in Railway?` and `Verified after deploy?` are manual because this repo cannot verify Railway production variables without Railway access. Mark them yes only after checking the live Railway service configuration and confirming events land in the expected Sentry project after deploy.
