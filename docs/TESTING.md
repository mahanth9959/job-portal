# Testing notes

Tested against the local Vite app and the production build in headless Chrome at 1440 × 900, 768 × 1024 and 390 × 844.

## Automated end-to-end run

| # | Flow | Result |
| --- | --- | --- |
| 1 | Recruiter demo loads with computed dashboard totals and pipeline | Pass |
| 2 | Add company, edit company, delete company | Pass |
| 3 | Create job, edit job, delete job | Pass |
| 4 | Candidate applies, views the application, withdraws and removes a saved job | Pass |
| 5 | Job search filters and pagination | Pass |
| 6 | Company search, industry filter and sort | Pass |
| 7 | Recruiter moves an application stage and gets a toast | Pass |
| 8 | Profile edit persists after reload | Pass |
| 9 | Registration, logout, login, candidate role guard | Pass |
| 10 | Protected route redirect and forgot-password success state | Pass |
| 11 | Dark theme toggle persists after reload | Pass |
| 12 | Mobile navigation sheet opens, navigates and closes | Pass |
| 13 | DummyJSON blocked: offline directory notice and usable table | Pass |

No console or page errors in the final end-to-end run.

## Design gate

The design-taste app inspector was run at 1440, 768 and 390 on:

- dashboard (recruiter)
- dashboard (candidate)
- jobs
- job detail
- new job form
- companies
- company detail
- candidates
- applications
- saved jobs
- reports
- profile
- login / register / forgot password

Every screen reported **0 FAIL**. The inspector's icon-chip warning was allowed because the counted marks are the product mark and company logos, which the app-screen rules explicitly permit as brand/identity tokens; they are not decorative feature icons. The only remaining lint notes are allowed: dates using zero-padding, floating-surface shadows, and the em dash used as a missing-value mark.

## Manual checks

- Login demo as recruiter and candidate.
- Show/hide password on login.
- Register validation: duplicate email, short password, mismatch confirmation, terms required.
- Protected route redirect and logout.
- Add/edit/delete a company with logo shape and tone.
- Add/edit/delete a job with skills, salary range, deadline and status.
- Job filters: location, type, experience, salary, search, sort, pagination.
- Company search, industry filter, sort and pagination.
- Apply, save, view applications, open the application sheet, withdraw.
- Advance an application stage as a recruiter.
- Profile edit, photo upload preview, resume attachment and profile strength.
- Reports period switch, print dialog, most-applied ranking.
- Light and dark themes, including mobile.
- Mobile menu, filters sheet and bottom-sheet modals.
- DummyJSON offline fallback and retry banner.

## Production build

```bash
pnpm lint
pnpm build
pnpm preview
```

The build succeeds. The inspector reports no failures on the app at 1440, 768 and 390. Run the inspector again against `pnpm preview` before launch to confirm the minified bundle. A chunk-size warning is present because the demo ships the route bundle as one file; it does not affect behaviour.

## Known demo limits

- No backend, no real session security, no email delivery, no payment, no file upload.
- Resume and photo UI store metadata or a resized preview in local storage only.
- Sample company profiles, salaries, roles and seeded applications must be replaced before any real use.
- Registered candidate accounts are not added to the DummyJSON directory count.
