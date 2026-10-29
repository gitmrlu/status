# Bot Status · Office

Live app: **https://gitmrlu.github.io/status/app/**

Supabase-authenticated 3D office for Max’s bot status board (realtime `items`, usage HUD, Ack/Decline). After sign-in, the header also has **Haskell Exit** and **Jovia Go-Live** tabs. Those planners load from a private Supabase table (`private_docs`) and render in a sandboxed iframe — their HTML/data are **never** in this public repo or on public Pages paths.

## Develop

```bash
npm install
npm run dev          # Vite at http://localhost:5173/app/
npm run build        # writes dist/ (Pages layout)
npm run preview      # preview dist
npm run check:privacy
```

One-command build: `npm run build`.

## Deploy (GitHub Pages)

Every push to `main` runs `.github/workflows/deploy-pages.yml`:

1. `npm ci && npm run build`
2. Privacy grep on `dist/`
3. Upload artifact → **Deploy GitHub Pages**

Site URL stays `https://gitmrlu.github.io/status/` (app at `/status/app/`).

### First-time Pages setup

Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.  
Or via API after the workflow file is on `main`:

```bash
gh api repos/gitmrlu/status/pages -X PUT \
  -f build_type=workflow
```

Until Actions is selected, the legacy “Deploy from branch / main / /” source also works if you commit built files under `app/` on `main` (this repo keeps `app/` as the source of truth the workflow copies into `dist/`).

## Private planners (box only)

Planners live in private repo `gitmrlu/claude-export`. Sync to Supabase from the box:

```bash
python3 /workspace/status-data/planners_sync.py
# optional: --export-dir /path/to/claude-export  --dry-run
```

Uses `/workspace/.supabase_service_key` (never commit or print). Upserts:

- Table `public.private_docs` (RLS: JWT email = the owner's login only)
- Storage bucket `private-planners` (same auth rule)

## Auth

Email OTP to the owner's login email (signups disabled). Same session unlocks Office data and planners.
