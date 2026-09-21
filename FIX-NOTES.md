# ClinicDesk — FIX NOTES

## QA FAIL CF-001…005 (2026-09-21)

Source: `QA-REPORT.md`, `/workspace/factory/inbox/QA-NOTE-clinic-followup-desk.md`

### CF-001 [High] — Receptionist GET /api/users
- **Fix:** `GET /api/users` uses `requireOwner()` (was `requireUser()`).
- **Test:** `tests/users-policy.test.ts` — `usersListAllowed("receptionist") === false`.

### CF-002 [High] — Owner role escalation via POST /api/users
- **Fix:** `normalizeCreateUserRole()` rejects `role: "owner"` (and unknown roles) with 400; only `receptionist` creatable via team API.
- **Register:** first user only becomes owner; closed thereafter (ignores crafted role body).
- **Test:** `tests/users-policy.test.ts`.

### CF-003/004 [Medium] — duration_minutes validation
- **Fix:** `parseDurationMinutes()` in `src/lib/duration.ts` — finite, `> 0`, max 480; wired in POST/PATCH appointments → **400** not 500.
- **Test:** `tests/duration.test.ts` (negative, NaN, `"abc"`, Infinity, over-cap).

### CF-005 [Medium] — csvEscape tab/CR formula vectors
- **Fix:** `csvEscape` matches `/^[\t\r]*[=+\-@]/` and prefixes `'`.
- **Test:** `tests/authz.test.ts` + `tests/seed-smoke.test.ts`.

### Verify
- `npm test`: **38/38**
- `npm run build`: success
- No GitHub push

## Ship blocker — npm run build /_document (2026-09-21)

**Symptom:** `PageNotFoundError` `/_document` or `ENOENT` `.next/server/pages-manifest.json` during "Collecting page data".

**Cause:** Concurrent `next-server` / overlapping `next build` on the same tree (QA smoke on :3456 + another build) SIGTERM/races the `.next` output — App Router only; no `pages/_document` source bug.

**Fix applied:** Stopped clinic-followup-desk `next-server` processes, `rm -rf .next`, clean `next build` → success. Tests still **38/38**.

**Ops:** Do not run `next start`/`next build` in parallel on this project.
