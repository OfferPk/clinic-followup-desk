# ClinicDesk — Istemaal Guide (Roman Urdu)

> Factory rule: har published project mein yeh file `GUIDE-roman-urdu.md` ke naam se zaroori hai.

## 1. Yeh project kya hai?

ClinicDesk chhoti clinics (dental, physio, aesthetic, lab) ke liye **appointment confirm / remind / no-show** desk hai. WhatsApp pe `wa.me` se message khulta hai — aap khud bhejte ho. Yeh **EMR / medical record system nahi** — sirf appointment follow-up.

## 2. Kahan se download karein?

- Local factory path: `/workspace/factory/projects/clinic-followup-desk`
- GitHub / ZIP: Master / GitHub Manager publish ke baad (abhi push mat karo)

## 3. Pehle kya chahiye? (requirements)

- Node.js 18+ (box pe pehle se)
- npm
- Modern browser (Chrome / Edge)

## 4. Install + Run (step-by-step)

1. Folder kholo: `cd /workspace/factory/projects/clinic-followup-desk`
2. Optional: `cp .env.example .env`
3. Packages: `npm install`
4. Demo data: `npm run seed`
5. Dev server: `npm run dev`
6. Browser: http://localhost:3000

Production check: `npm test` phir `npm run build`

## 5. Demo login

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@clinic.local | owner123 |
| Receptionist (desk) | desk@clinic.local | desk123 |

## 6. Features — har ek kya karta hai

### Login / Register
- Kahan: `/login`, `/register`
- Pehla user **owner** banta hai. Baqi staff Team se add hote hain.
- Result: Dashboard khulta hai.

### Dashboard
- Kahan: `/dashboard`
- Counts: confirm today, remind 24h, no-show, status breakdown.
- Result: aaj ka kaam turant dikhta hai.

### Status board (Kanban)
- Kahan: `/board`
- Columns: requested | confirmed | completed | no_show | cancelled
- Status dropdown se badlo.
- Result: pipeline clear.

### Appointments list + new
- Kahan: `/appointments`, `/appointments/new`
- Patient name, phone (03… ya 92…), optional reason, optional doctor, slot, duration.
- Result: naya appointment save.

### Appointment detail + notes
- Kahan: `/appointments/[id]`
- Edit, delete, WhatsApp Confirm / Remind buttons, append-only notes.
- Result: history desk pe rehti hai.

### Day list
- Kahan: `/day`
- Date picker se us din ke appointments.
- Result: aaj / kisi din ka schedule list.

### Queues — Confirm / Remind / No-show
- Kahan: `/queues/confirm`, `/queues/remind`, `/queues/no-show`
- Prefilled WhatsApp text ke sath button.
- Result: follow-up queue khali karo.

### Team (owner)
- Kahan: `/team`
- Receptionist account banao.
- Result: shared desk — sab appointments sab staff ko dikhte hain.

### Export CSV (owner)
- Kahan: `/export` ya `/api/export/appointments.csv`
- Formula-safe CSV download.
- Result: Excel / Sheets mein backup.

## 7. Common masail (troubleshooting)

- **Login fail:** `npm run seed` dubara chalao (demo passwords reset).
- **Phone invalid:** 8+ digits; PK local `0300…` auto `92300…` ban jata hai.
- **Secure cookie / local HTTP:** `.env` mein `COOKIE_SECURE=false`
- **DB lock / weird data:** `npm run db:reset`
- **Build fail:** `rm -rf .next && npm run build`

## 8. Security / privacy tips

- Demo passwords change karo production se pehle.
- `data/*.db` git mein mat daalo (gitignore pe hai).
- Yeh medical EMR nahi — sensitive clinical notes yahan mat likho.
- Session cookie httpOnly hai; public PC pe logout karo.
- WhatsApp messages aapke phone se jate hain — Meta Business API use nahi.

## 9. Agla update

- Official WA template reminders (BSP) — baad mein
- Multi-clinic / Urdu UI toggle — planned, MVP mein nahi
