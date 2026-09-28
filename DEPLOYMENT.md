# ClinicDesk — Deployment notes

## Build / run

```bash
npm install
npm run seed   # optional demo data
npm run build  # wraps scripts/build-safe.sh (flock + clean .next)
npm start
```

Use `scripts/build-safe.sh` (or `npm run build`) — never bare `next build` while other agents may race `.next`.

## Environment

See `.env.example`. Notable:

- `DATABASE_PATH` — SQLite file (default `data/clinic.db`)
- `COOKIE_SECURE` — set `false` for local HTTP; production defaults to secure when proto is HTTPS

## Database file mode

On open/create the app attempts `chmod 0600` on the DB file (ignored if the FS does not support it). Keep the data directory private on the host as well. Restoring = stop app, replace DB files, start app (schema migrates on open).

## Auth rate limit (single-node)

- Login + register: soft **in-memory** rate limit ≤**10** failures / **15** minutes per IP (and per-email for login) → HTTP **429** with `Retry-After`
- Not shared across processes/replicas — put a reverse-proxy limit in front for multi-instance deploys
- Password minimum **10** characters on register and Team user create

## Demo seed passwords

Seed inserts demo users directly (bypasses register floor). Production: change passwords or re-register with ≥10 chars.
