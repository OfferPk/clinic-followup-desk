# ClinicDesk — Product overview

## What it is

A shared front-desk **appointment follow-up** tool. Capture patient appointments, move them through statuses, run confirm/remind/no-show queues, leave notes, and open WhatsApp via `wa.me`. Human sends the message — no WhatsApp Business API.

## What it is not

- Not an Electronic Medical Record (EMR)
- Not a Hospital Management System (HMS)
- Not an insurance or billing product
- No Meta Cloud API / template messaging in MVP

## Roles

| Role | Can |
|------|-----|
| Owner | Everything + create users + CSV export |
| Receptionist | Appointments, queues, notes, day list (shared desk — sees all appointments) |

## Statuses

`requested` → `confirmed` → `completed` · also `no_show` · `cancelled`

## Queues

1. **Confirm today** — requested + slot today
2. **Remind 24h** — confirmed + slot within next 24 hours
3. **No-show** — status no_show

## Phone

Pakistan local `03XXXXXXXXX` auto-rewrites to `92XXXXXXXXX` for storage and WhatsApp.
