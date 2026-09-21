# QA R2 Report — Clinic Follow-Up Desk

**Date:** 2026-09-21 18:22 PKT (Asia/Karachi)  
**Project:** `/workspace/factory/projects/clinic-followup-desk`  
**Scope:** Re-verify CF-001–005 fixes.  
**Verdict:** **PASS**

## Automation

| Check | Result |
|---|---|
| `npm test` | **PASS — 6 files, 38/38 tests passed** |
| `npm run build` | **PASS — Next.js 15.5.25 production build completed** |

## R2 verification

Runtime smoke checks were performed against the existing ClinicDesk server on `127.0.0.1:3456` using the seeded owner and receptionist accounts. A temporary valid appointment created for PATCH validation was deleted after the check.

| Requirement | Evidence | Result |
|---|---|---|
| `requireOwner` on `GET /api/users` | Unauthenticated request: 401; receptionist session: 403 (`Forbidden — owners only`); owner session: 200 | **PASS** |
| `POST /api/users` rejects `role=owner` | Owner-authenticated request with `role: "owner"`: 400 (`Cannot create owner accounts via team API — receptionists only`) | **PASS** |
| Negative `duration_minutes` returns 400 | POST and PATCH with `duration_minutes: -5`: 400 (`duration_minutes must be a positive number`) | **PASS** |
| NaN/non-numeric `duration_minutes` returns 400 | POST and PATCH with JSON string `"NaN"`: 400; unit coverage also checks `Number.NaN` and `Infinity` | **PASS** |
| `csvEscape` leading tab/CR vectors | `csvEscape("\t=CMD")` prefixes `'`; `csvEscape("\r=CMD")` prefixes `'` and correctly CSV-quotes the CR cell | **PASS** |

## Reviewed implementation anchors

- `src/app/api/users/route.ts`: GET and POST both call `requireOwner()`.
- `src/lib/users-policy.ts`: only `receptionist` is accepted for team-created users; `owner` and unknown roles are rejected.
- `src/lib/duration.ts`: rejects non-finite, zero/negative, and over-cap values; wired into appointment POST/PATCH with 400 responses.
- `src/lib/csv.ts`: neutralizes formula prefixes after leading tab/CR characters.
- Tests: `tests/users-policy.test.ts`, `tests/duration.test.ts`, `tests/authz.test.ts`, and `tests/seed-smoke.test.ts` cover the requested fix set.

**No product source code was modified by QA.**
