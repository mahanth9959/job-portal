# Hireline

**Hiring, in clear view.** A responsive job portal system for recruiters and candidates, built with React, Vite, Tailwind CSS, Context API and a third-party directory API.

Hireline pairs a calm hiring workspace with a candidate job-search flow: shared companies, open roles, applications, saved jobs, reports and a profile that keeps the next step visible.

## Run it

```bash
pnpm install
pnpm dev
```

Open the printed local URL. Build the production bundle with:

```bash
pnpm build
pnpm preview
```

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Recruiter | `alex@hireline.dev` | `hireline123` |
| Candidate | `maya@hireline.dev` | `hireline123` |

The login page also has one-click demo buttons for both accounts.

## Modules

1. **Authentication** - login, register, forgot-password UI, role selection, password show/hide, form validation, protected routes, logout and persisted session.
2. **Dashboard** - role-aware overview with total companies, jobs, active postings, candidates, applications, saved jobs, recent activity, quick actions, pipeline statistics and a monthly applications chart.
3. **Company management** - DummyJSON-seeded directory, company logos, add/edit/delete, detail pages, search, industry filter, name/employee sort, pagination, loading skeletons and an offline fallback.
4. **Job posting** - create/edit/delete roles, company, category, employment type, experience, salary range, location, work mode, skills, deadline, open/closed status and a live candidate preview.
5. **Job search** - search, location/type/experience/salary filters, latest/salary/deadline/title sort, pagination, saved roles and detailed role pages.
6. **Candidate profile** - personal details, skills, experience, education, bio, profile photo preview, resume attachment UI, validation and a live profile-strength meter.
7. **Applications and saved jobs** - apply, application statuses, application sheet with stage timeline, withdraw, save/remove, saved-jobs search and empty states.
8. **Reports** - totals, active jobs, offers, monthly application chart, live pipeline mix, most-applied roles, top companies by interest, print and a 6/12-month switch.

## Stack

- React 19 + Vite 8
- Tailwind CSS 4 with a custom token-driven design system
- Context API for auth, theme and workspace state
- React Router 7
- React Hook Form
- React Toastify
- Axios for the DummyJSON directory
- Local Storage for the static demo workspace
- Lucide outline icons
- DM Sans, bundled locally through Fontsource

## Data and API

Companies and candidates are seeded from the public **DummyJSON** users endpoint. The candidate directory uses candidate names, contact details, departments and cities from the API; the UI deliberately uses the candidate initials and the Hireline identity palette instead of the API's abstract avatar images.

Company brand profiles, job descriptions, salary bands and seeded applications are believable sample content for this build. They are not real openings. If DummyJSON cannot be reached, the app labels the fallback and keeps the workspace usable with an offline directory.

All writes are local. The demo does not include a backend, real file upload, email delivery or payment flow. Auth is intentionally static: passwords are stored in the browser for demonstration only and must never be handled this way in production.

## Design system

The visual direction is **Accent ladder** from the design-taste study, seed `1204276201`, adapted to a hiring product:

- one raspberry hue (`#B8336A`) at full strength on small marks and data;
- pale raspberry tints carrying action cards, filters and selected states;
- rose-tinted paper (`#FBF7F8`) with white working surfaces;
- 8px cards, 6px controls, square geometry on data;
- DM Sans for the whole system;
- a **Pipeline pulse** signature block on the dashboard;
- light and dark themes from one token contract.

See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) for the token tables, type scale, spacing, component rules and responsive behaviour.

## Project structure

```text
src/
  components/
    charts/         Monthly bars, pipeline pulse, stage mix, application progress
    companies/      Company form and logo picker
    jobs/           Shared job row
    layout/         App shell, sidebar, mobile sheet, auth layout
    ui/             Buttons, fields, modal, sheet, pagination, tabs, menu
  context/          Auth, theme and workspace providers
  data/             Seed data, DummyJSON adapter and selectors
  lib/              Formatting, storage, image resizing and constants
  pages/            Auth, dashboard, jobs, companies, candidates, applications, reports, profile
  routes/           Protected and role routes
  App.jsx           Route map and toasts
  index.css         Design tokens and component styles
  main.jsx          Providers and font imports
docs/               Design system and testing notes
```

## Verification

- `pnpm lint` passes with no errors.
- `pnpm build` succeeds.
- The design-taste app inspector reports **0 FAIL** on the dashboard, jobs, companies, reports, profile, applications, candidates, saved jobs, company detail, job detail, job form and login at 1440, 768 and 390 px.
- The end-to-end flows for registration, demo login, company CRUD, job CRUD, apply/save/withdraw, filters, profile persistence, theme persistence, mobile navigation and the offline directory fallback pass in a Chrome run.

See [docs/TESTING.md](docs/TESTING.md) for the test matrix and results.

## Publishing

The repository is committed locally with the requested 20-commit history. To publish it to GitHub:

```bash
git remote add origin https://github.com/mahanth9959/hireline-job-portal.git
git push -u origin main
```

Replace the remote URL if the repository uses a different name.

## License

MIT. See [LICENSE](LICENSE).
