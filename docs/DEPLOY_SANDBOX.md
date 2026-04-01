# Deploy a sandbox at `test.slxai.org`

The codebase is **one repo**. A “clone” for testing means: **build the same app again** and host it on a **second URL** with its own env vars (optional separate Supabase project for safe experiments).

This document cannot create DNS or servers for you. You (or your host) complete those steps.

---

## Current references (update as needed)

| What | Value |
|------|--------|
| **Vercel sandbox URL** | [https://slxai-3v7a.vercel.app/](https://slxai-3v7a.vercel.app/) |
| **Custom domain (goal)** | `test.slxai.org`: add in Vercel **Domains** and DNS when ready |
| **MySQL / MariaDB port** | **3306** (default). Use on your **server** (PHP, API, SSH tunnel)—never paste DB passwords into the frontend or this repo. The browser does not connect to port 3306 directly. |

---

## 1. DNS

At your DNS provider (where `slxai.org` is managed):

| Type  | Name | Value |
|-------|------|--------|
| **CNAME** | `test` | Your hosting target (see below) |

Examples:

- **Vercel**: after adding the domain in the project, they show a target like `cname.vercel-dns.com`.
- **Cloudflare Pages / Netlify**: use the hostname they give you for the project.
- **Your own VPS (nginx)**: point `test` to the server IP or use an A record.

Propagation can take a few minutes to 48 hours.

---

## 2. Same Git repo, second deployment

### Option A: Vercel (matches existing `vercel.json`)

1. [Vercel Dashboard](https://vercel.com) → **Add New** → **Project** → Import **the same GitHub repo** as production.
2. Name it e.g. `slxai-test` so it’s clearly the sandbox.
3. **Settings → Environment Variables**: copy from production, then adjust:
   - Same `VITE_SUPABASE_*` **or** a **separate Supabase project** (recommended for a real sandbox).
   - Set **`VITE_SANDBOX=true`** so the UI shows the amber “Sandbox” bar (see below).
4. **Settings → Domains** → add `test.slxai.org` and complete DNS as Vercel instructs.
5. Redeploy after env changes.

### Option B — Duplicate project on any static host

1. `npm ci && npm run build` → upload `dist/` or connect CI to deploy `dist`.
2. Serve **SPA**: all routes must fall back to `index.html` (same idea as `vercel.json` rewrites).
3. Attach `test.slxai.org` in that host’s UI.

---

## 3. Sandbox vs production data

| Approach | Pros |
|----------|------|
| **Same Supabase as prod** | Fast to set up; **risky**: test data and emails affect real users. |
| **Second Supabase project** | Safer default: clone schema/migrations, use new URL + anon key only on `test`. |

Never commit real keys. Use the host’s **Environment Variables** UI only.

---

## 4. Optional: visible “Sandbox” banner

If you set:

```env
VITE_SANDBOX=true
```

on the **test** deployment only, the app shows a small fixed banner so you don’t confuse test and production.

Production should **not** set `VITE_SANDBOX` (or set it to `false`).

---

## 5. Checklist

- [ ] DNS `test.slxai.org` → hosting
- [ ] Second deploy from same repo
- [ ] Env vars set on **test** project only
- [ ] `VITE_SANDBOX=true` on test (optional)
- [ ] HTTPS enabled (most hosts do this automatically)

---

## 6. Local “test” build

```bash
npm run build
npm run preview
```

Preview is local only; it does not create `test.slxai.org`. Use the steps above for a public sandbox URL.
