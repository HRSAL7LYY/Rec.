# Salahly Recruitment OS

Salahly Recruitment OS is a Cloudflare-first ATS for Salahly recruiting workflows. It uses a dependency-free responsive frontend scaffold, Cloudflare Pages Functions for the API, signed HTTP-only session cookies for authentication, and Google Sheets as the only database.

## Important files

- `src/main.js` contains the responsive ATS shell, login, dashboard, vacancies, candidates Kanban, approvals, reports, admin, and settings screens.
- `src/styles.css` contains the mobile-friendly design system, cards, tables, badges, progress bars, Kanban, loading, empty, and toast states.
- `functions/lib.ts` contains session signing, PBKDF2 password hashing, RBAC helpers, and the Google Sheets API wrapper.
- `functions/api/**` contains the Cloudflare Pages Functions endpoints.
- `seed/` contains safe CSV templates for Google Sheets setup.

## Local setup

```bash
npm install
npm run dev
npm run build
```

For local API testing with Cloudflare Pages Functions, use Wrangler after setting local secrets in a non-committed `.dev.vars` file. This repository intentionally avoids paid services and keeps the build dependency-free so it can run in restricted free-tier environments.

## Google Sheet structure

Create one Google Sheet with these tabs and columns in row 1:

1. `users`: `id, full_name, email, password_hash, active, created_at, updated_at, last_login_at`
2. `roles`: `id, name, description, protected, permissions_csv`
3. `user_roles`: `user_id, role_id`
4. `departments`: `id, name_en, name_ar, active`
5. `locations`: `id, name_en, name_ar, active`
6. `vacancies`: `id, vacancy_no, role_title, department_id, location_id, status, current_stage, progress_percentage, hiring_number, owner_id, start_date, target_end_date, created_at, updated_at`
7. `vacancy_recruitment_details`: `vacancy_id, start_date, end_date, actual_end_date, workload_planning_and_job_analysis, on_hand_number, hiring_number, company_department_strategy_json, department, location, budget_setup_amount, job_description, job_ads_writing, hiring_team_user_ids_json, selected_channels_json, updated_at, updated_by`
8. `candidates`: `id, full_name, role_title, stage, score, source, owner_id, created_at, updated_at`
9. `notifications`: `id, user_id, vacancy_id, message, read, created_at`

Copy `seed/roles.csv` into the `roles` tab and assign your first admin in `users` and `user_roles`.

## Google Cloud setup

1. Create a Google Cloud project.
2. Enable the Google Sheets API.
3. Create a service account.
4. Create a JSON key for that service account.
5. Share the Google Sheet with the service account email as Editor.
6. Put only the service account email, private key, and sheet ID into Cloudflare secrets. Never put these values in frontend code.

## Cloudflare secrets

Required bindings:

```bash
wrangler pages secret put GOOGLE_SERVICE_ACCOUNT_EMAIL --project-name salahly-recruitment-os
wrangler pages secret put GOOGLE_PRIVATE_KEY --project-name salahly-recruitment-os
wrangler pages secret put GOOGLE_SHEET_ID --project-name salahly-recruitment-os
wrangler pages secret put SESSION_SECRET --project-name salahly-recruitment-os
```

`SESSION_SECRET` should be a long random value, for example from `openssl rand -base64 48`.

## Creating the first Super Admin safely

1. Generate a PBKDF2 password hash using the same algorithm in `functions/lib.ts` from a temporary local script or one-time Worker route that you delete before deployment.
2. Insert one row into `users` with `active` set to `true`.
3. Insert `role-super-admin,Super Admin,...,*` from `seed/roles.csv` into `roles`.
4. Insert the user ID and `role-super-admin` into `user_roles`.
5. Delete any temporary helper used to generate the hash.

## Deploy to Cloudflare Pages

```bash
npm run build
npm run deploy:preview
npm run deploy:production
```

The project uses same-origin API calls under `/api`, so no CORS configuration is required by default.

## Security notes

- All protected endpoints call session/RBAC checks in the backend.
- Sessions use signed HTTP-only cookies with `SameSite=Lax` and `Secure`.
- Passwords are verified as PBKDF2 hashes with Web Crypto.
- Sensitive admin operations are intended to go through API endpoints only.
- Google Sheets is the single source of truth; no real ATS data is stored in `localStorage`.
