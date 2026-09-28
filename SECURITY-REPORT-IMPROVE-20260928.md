# SECURITY REPORT — ClinicDesk IMPROVE (auth hygiene delta)

**Date:** 2026-09-28 ~16:26 PKT (Asia/Karachi)  
**Project:** `/workspace/factory/projects/clinic-followup-desk`  
**Prior:** SECURITY-REPORT.md — **PASS** (v0.1.0 authz/session/CSV/secrets)  
**Scope:** SE2 auth hygiene vs Raabta Desk v0.3 (`rate-limit.ts`, password min 10, DB 0600); regression of prior PASS controls; seed demo PWs; empty-state/search skim  
**Method:** Code + route review; `stat` on `data/*.db` before/after `getDb()` open; read `auth-hygiene` / users / login / register / seed / DEPLOYMENT. **No code edits. No push.**

## Verdict: **PASS_WITH_NOTES**

## Ship blockers

**none**

---

## Hygiene checklist

| Item | Verdict | Evidence |
|------|---------|----------|
| Password min 10 (register) | **PASS** | `register/route.ts` `MIN_PASSWORD=10` → 400; UI `minLength={10}`; `tests/auth-hygiene.test.ts` |
| Password min 10 (Team create) | **PASS** | `users/route.ts` POST `password.length < 10` → 400; `TeamForm` `minLength={10}` |
| Soft rate limit login → 429 | **PASS** | IP + email buckets; ≤10 fails / 15 min; `Retry-After`; test green |
| Soft rate limit register → 429 | **PASS** | IP bucket; failures recorded on closed-register / conflict |
| DB chmod 0600 on open | **PASS (on open)** | `db.ts` `chmodSync(0o600)` (skips `test-*`). Idle/seed file was `644`; after `getDb()` → **`600`**. WAL/SHM (when present) stay `644` |
| Prior authz (users owner-only) | **PASS** | GET/POST `/api/users` → `requireOwner()`; `normalizeCreateUserRole` rejects owner |
| Prior CSV sanitize | **PASS** | Export owner-only + `csvEscape` `/^[\t\r]*[=+\-@]/` |
| Prior session cookies | **PASS** | `httpOnly` + `sameSite=lax` + `secure` via `shouldUseSecureCookie` |
| Prior secrets gitignore | **PASS** | `.env`, `.env*.local`, `/data/*.db*` ignored |
| Seed demo short PWs | **NOTE** | `owner123` / `desk123` via seed insert (bypasses floor). Documented STATUS / DEPLOYMENT / GUIDE as local demo. No `NODE_ENV` prod guard on `scripts/seed.ts` — same posture as Raabta v0.3 (not a ship FAIL if ops change PWs before prod) |
| Empty-state / search | **PASS (low risk)** | Onboarding: static copy + `localStorage` key by `userId`. Search: parameterized `LIKE`/`?`; React text escape; no `dangerouslySetInnerHTML`. Shared-desk list by design (not staff↔staff IDOR) |

---

## Notes (non-blocking) — Raabta v0.3 parity

1. **Rate limit:** process-local `Map`; trusts `X-Forwarded-For` / `X-Real-Ip` as-is. Fine for single-node MVP; put edge limit + trusted proxy before multi-replica / internet prod. Documented in `DEPLOYMENT.md`.
2. **DB sidecars:** main file hardened on open; `-wal`/`-shm` may remain `644`. Keep `data/` private on host.
3. **Seed passwords:** short demo creds are intentional local fixtures; register/Team enforce ≥10. Ops: change before any shared/prod deploy (`DEPLOYMENT.md`).
4. **Seed script** has no production refuse guard — treat `npm run seed` as local-only tooling (documented).

---

## Sign-off

**Recommend CLEAR for Master / next gate.** Auth hygiene delta matches Raabta Desk v0.3 patterns. No security ship blockers.

**Signed:** Security review IMPROVE 20260928 — **PASS_WITH_NOTES**
