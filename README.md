# MedCare · Admin Portal (Vite + React + Bootstrap)

## Run it
```bash
npm install
cp .env.example .env     # then put in YOUR Supabase URL + anon key
npm run dev
```
Production build: `npm run build` (output in `dist/`). Host it with SPA fallback to `index.html`.
In Supabase → Authentication → URL Configuration add your site URL (password-reset emails link to `/update-password`).

## Pages
`/login` `/signup` `/forgot-password` `/update-password` (public) ·
`/` Dashboard · `/patients` · `/appointments` · `/doctors` · `/profile` (need an admin login)

## Tables used (same as the original)
| Table | Columns |
|---|---|
| `Admin_Portal_User` | name, specialty, email, number  (**no password column needed**) |
| `patientData` | id, patient_Name, email, contact_No, age, gender, reason, doctor_Name, date_time |

## Security notes
* Login also requires a row in `Admin_Portal_User` for that email, so patient accounts cannot open the portal.
  This is a UI check only: protect the tables with Row Level Security in Supabase for real enforcement.
* Passwords are never stored in your tables. If `Admin_Portal_User.password` exists and is NOT NULL, make it nullable
  or drop it (and delete any plain-text passwords already saved there).
