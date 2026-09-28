# QA Report — ClinicDesk IMPROVE delta (2026-09-28)

**Date:** 2026-09-28 16:28 PKT (Asia/Karachi)  
**Project:** `/workspace/factory/projects/clinic-followup-desk`  
**Prior ship:** QA-REPORT-R2.md **PASS** (v0.1.0)  
**Scope:** Post-ship IMPROVE (Unreleased) — empty-state checklist, auth hygiene, appointments search/filters  
**QA:** Report only — no product source changes; no GitHub push; no agent messages  
**Overall:** **PASS**  
**CLEAR for improve merge/publish from QA:** **yes**

---

## Summary

SE2 READY_FOR_QA claims hold for the scoped improve delta. Automated suite **46/46**, production build **green**. Live curl verification on `:3457` (`COOKIE_SECURE=false`) confirms all three Master-assign items. No new P0/P1 found in scope.

| Severity | Open residual |
|----------|--------------:|
| Critical / P0 | 0 |
| High / P1     | 0 |
| Medium        | 0 |
| Low / notes   | 2 (non-blocking) |

---

## Environment

| Item | Detail |
|------|--------|
| Runtime | `COOKIE_SECURE=false` · `next start -p 3457` |
| Creds | `owner@clinic.local` / `owner123` · `desk@clinic.local` / `desk123` |
| Methods | `npm test`, `npm run build`, curl + session cookies, RSC prop inspection, client-bundle inspect |
| Docs skimmed | STATUS.md, CHANGELOG Unreleased, FIX-NOTES.md, QA-REPORT-R2.md, IMPROVE inbox brief |

---

## Automation

| Check | Result |
|-------|--------|
| `npm test` | **46/46** passed (8 files; includes `auth-hygiene`, `appointments-filters`) |
| `npm run build` (`scripts/build-safe.sh`) | **success** (Next.js 15.5.25, ~16:26 PKT) |

---

## Scoped items

### 1) Empty-state 3-step checklist — **PASS**

| Check | Result | Evidence |
|-------|--------|----------|
| Shown when total = 0 | **PASS** | After API-delete of all appointments, dashboard RSC props: `show:true` for owner + desk; `GET /api/dashboard` → `total:0` |
| Hidden when data present | **PASS** | With appointments, checklist still wired; `show` flips with empty state (client initially SSR-null until hydrate — by design) |
| localStorage keyed by user id | **PASS** | Built JS: `"clinicdesk_onboarding_dismissed_".concat(userId)`; owner id `02ab6d4b-…` vs desk `f826011b-…` passed as distinct `userId` props |
| Team step owner-only | **PASS** | Bundle steps: step 3 `ownerOnly:!0`; filter `!e.ownerOnly\|\|isOwner`; RSC `isOwner:true` (owner) / `isOwner:false` (desk) |
| Surfaces | **PASS** | Wired on Dashboard, Board, Appointments (`OnboardingChecklist` + props in HTML/RSC) |

Note: Client component returns `null` until hydrate (`dismissed` starts `true`), so curl HTML does not contain “Get started…” text; props + bundle prove behavior.

### 2) Auth hygiene — **PASS**

| Check | Result | Evidence |
|-------|--------|----------|
| Password min 10 (register API) | **PASS** | `POST /api/auth/register` password `short` → **400** `Password must be at least 10 characters` |
| Password min 10 (Team create) | **PASS** | Owner `POST /api/users` password `shortpass` (9) → **400** same floor; `password12` → **200** (`qa-tenchars@clinic.local`) |
| UI minLength | **PASS** | `/register` and `/team`: label “Password (min 10)” + `minLength="10"` |
| Soft rate limit → 429 | **PASS** | 10× failed login (`x-forwarded-for: 198.51.100.77`, wrong password) → **401**; 11th → **429** `Too many failed login attempts…` + header `Retry-After: 900` |
| DB `chmod 0600` | **PASS** | After `getDb()` / server open: `stat` → mode **600** (`-rw-------`) on `data/clinic.db`. WAL/SHM remain 644 (main DB only hardened, as coded) |

Seed demo passwords remain `<10` by design (STATUS/README note).

### 3) `/appointments` q + doctor chips + status; SQL-safe — **PASS**

| Check | Result | Evidence |
|-------|--------|----------|
| `q` search | **PASS** | `GET /api/appointments?q=Omar` → 1 row `Omar Siddiqui`; page `?status=confirmed` shows Sana, not Omar |
| Doctor chips / filter | **PASS** | API `doctor=Dr. Ayesha Khan` → 2–3 rows, all that doctor; HTML has “Search patient / phone”, Doctor chip row, Clear |
| Status filter | **PASS** | API + page `status=confirmed` → only confirmed; invalid status rejected on API (**400**) |
| Parameterized / no SQLi | **PASS** | Source uses `LIKE ?` / `lower(?)` binds. Live payloads `'`, `OR 1=1--`, `' OR '1'='1`, `1; DROP TABLE…`, `%\' OR …LIKE '%` on `q` → **200**, `n=0` (not full dump); doctor `' OR '1'='1` → `n=0`; post-check table intact (`post_total` matched expected rows) |

---

## Smoke (delta)

| Check | Result |
|-------|--------|
| Owner login | **PASS** → 200, role `owner` |
| Receptionist login | **PASS** → 200, role `receptionist` |

---

## Residuals / new findings

1. **Low / docs-ops:** `-wal` / `-shm` stay mode 644; only primary `.db` is chmod’d. Acceptable for stated design; pilots should still protect `data/`.
2. **Low / UX note:** Checklist UI text is client-only after hydrate (no SSR flash of steps). Not a functional defect; empty-state props verified via RSC.
3. **Out of improve scope / unchanged:** Demo seed passwords `<10`; in-memory rate limit is single-node (documented in CHANGELOG/DEPLOYMENT).

No new P0/P1 in scoped improve work. Prior CF-001…005 not re-litigated beyond smoke logins.

---

## Recommendation

**PASS** — Scoped improve items hold. **CLEAR for improve merge/publish from QA.**  
No product code changes by QA. No GitHub push.
