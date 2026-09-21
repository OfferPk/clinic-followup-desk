# QA Report R2 — Clinic Follow-Up Desk MVP

**Date:** 2026-09-21 18:25 PKT (Asia/Karachi)  
**Project:** `/workspace/factory/projects/clinic-followup-desk`  
**Prior:** `QA-REPORT.md` (FAIL — 2 High, 3 Medium)  
**Fix notes:** `FIX-NOTES.md` (CF-001…005 claimed fixed)  
**QA:** R2 re-verify (report only — product source not modified; no GitHub push)  
**Overall:** **PASS**  
**CLEAR_FOR_SECURITY:** **yes** (Highs + Mediums CF-001…005 closed)

---

## Summary

Re-verified after Engineer fixes. Both **High** ship blockers (CF-001, CF-002) are fixed. All three **Medium** issues (CF-003, CF-004, CF-005) are also fixed. Automated suite **38/38**, production build **green**, smoke logins OK for owner and receptionist.

| Severity | Open residual |
|----------|--------------:|
| Critical | 0 |
| High     | 0 |
| Medium   | 0 |
| Low      | 0 |

---

## Environment

| Item | Detail |
|------|--------|
| Runtime | `COOKIE_SECURE=false` production `next start` on `:3456` |
| Creds | `owner@clinic.local` / `owner123` · `desk@clinic.local` / `desk123` |
| Methods | `npm test`, `npm run build`, curl + session cookies, `tsx` unit check of `csvEscape` |

---

## Automation

| Check | Result |
|-------|--------|
| `npm test` | **38/38** passed (6 files; includes `users-policy`, `duration`, CF-005 in `authz`) |
| `npm run build` | **success** (Next.js 15.5.25, ~18:25 PKT) |

---

## Smoke

| Check | Result |
|-------|--------|
| Owner login | **PASS** → 200, role `owner` |
| Receptionist login | **PASS** → 200, role `receptionist` |
| Owner `GET /api/users` | **PASS** → 200 |
| Owner create receptionist | **PASS** → 200 (`qa-r2-desk2@clinic.local`, role forced receptionist) |

---

## Findings re-verify (CF-001…005)

| ID | Severity | Claim | Live result | Evidence |
|----|----------|-------|-------------|----------|
| **CF-001** | High | Receptionist `GET /api/users` → 403 | **PASS** | desk session → **403** `{"error":"Forbidden — owners only"}`; GET uses `requireOwner()` |
| **CF-002** | High | Owner cannot mint `role=owner` | **PASS** | owner POST `role:"owner"` → **400** `Cannot create owner accounts via team API — receptionists only`; mint email absent from directory; only `owner@clinic.local` remains owner |
| **CF-003** | Medium | Negative `duration_minutes` → 400 | **PASS** | POST `duration_minutes:-5` → **400** `duration_minutes must be a positive number` (`parseDurationMinutes`) |
| **CF-004** | Medium | Non-numeric duration → 400 not 500 | **PASS** | POST `duration_minutes:"abc"` → **400** (not 500) same positive-number error |
| **CF-005** | Medium | `csvEscape` neutralize `\t`/`\r` formula vectors | **PASS** | `\t=CMD` → `'\t=CMD`; `\r=CMD` → `"'\\r=CMD"`; tests in `authz.test.ts` / `seed-smoke.test.ts`; regex `/^[\t\r]*[=+\-@]/` |

---

## Residual issues

None from CF-001…005. No new High/Critical found in this R2 scope.

**Note:** Live create of `qa-r2-desk2@clinic.local` left a test receptionist in local DB (intentional verification artifact; not a product defect).

---

## Recommendation

**PASS** — Highs and Mediums closed. **CLEAR_FOR_SECURITY.** Ready for Security review / next pipeline gate. No product code changes by QA. No GitHub push.
