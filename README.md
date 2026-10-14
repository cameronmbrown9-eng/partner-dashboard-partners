# Project Partner Dashboard — partners.uwo-drugchecking.ca

Partner-facing dashboard for the Health Canada SUAP-funded drug-checking network (Western University with Scatr Inc.). React + Vite + Tailwind, deployed to GitHub Pages.

## Where the content lives

Everything the page shows comes from `src/data/*.json`. Nothing is hard-coded in components.

| File | Contents | How it changes |
|---|---|---|
| `partners.json` | one record per organization: address, contacts, devices, exemption types, `status` (`active`, `planned-install`, `onboarding`, `closed`), notes | edit by hand |
| `news.json` | news items, newest first, with a `tag` (Network, Regulatory, Research, Training) | add an item at the top |
| `training_sessions.json` | the DCP training tracker rows | mirror the tracker spreadsheet |
| `exemptions.json` | one row per exemption letter (used by the research dashboard) | mirror `HealthCan-UWO/Legal & Regulatory` |
| `documents.json` | the document shelf (labels, paths in `public/`, versions) | edit when a document is replaced |
| `links.json` | related links | edit by hand |
| `metrics.json` | point-of-care scan counts (network, per site, per device, per month) | **generated** — see below |

Counts on the page (partner organizations, devices, provinces, cities, exemption types) are derived from `partners.json`; scan figures come from `metrics.json`. Each file carries a `lastUpdated` field and the page shows a "data as of" stamp.

### Refreshing scan metrics

```bash
bash ~/Desktop/Claude/scatr_full_pull/run.sh                 # canonical full pull (Nov 2022 → today)
python3 ~/Desktop/Claude/scatr_full_pull/make_dashboard_metrics.py   # writes src/data/metrics.json in both repos
```

### Keeping the research dashboard in step

`src/shared/` (components) and `src/data/` are the source of truth here; copy them to the research repo after any change:

```bash
bash _scripts/sync_shared.sh
```

## Building and deploying

Local: `npm ci`, then `npm run dev` or `npm run build`. Environment variables come from `.env.local` (see `.env.example`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_CUSTODY_PASSWORD`. The chain-of-custody password has no fallback in the source; an empty value locks the module.

Deploy: pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes `dist/` to the `gh-pages` branch (custom domain via `public/CNAME`). The three variables above must exist as repository secrets; until they do, the workflow validates the data files and skips the build and publish, so the live site is never replaced by a locked build. `npm run deploy` (gh-pages from a local build) still works as a fallback and is how the site was published on 14 Oct 2026.

## Conventions

- Backups of edited source files use `<file>.bak-YYYYMMDD-HHMMSS-purpose.<ext>` (gitignored under `src/`).
- Scan attribution follows the project Standard Work: a point-of-care scan is a record with a result; the organization is the operator login (`username`), never the device label.
