# Hireline design system

Hireline is a hiring workspace for people who make decisions all day. The system is deliberately calm in the chrome and confident in the data: one raspberry line, rose-tinted paper, white working surfaces, DM Sans and a strict spacing rhythm.

The direction is **Accent ladder** (design-taste app direction, seed `1204276201`). The full-strength brand hue sits on small marks, active icons, primary actions and current data; pale tints do the area work.

## 1. Brand idea

- **Name:** Hireline, the line from an open role to a next hire.
- **Mark:** a rising line with a terminal dot, drawn on a raspberry tile.
- **Signature element:** the **Pipeline pulse** on the dashboard. The four live stages sit in one dark field with a finding and one action.
- **Voice:** direct, human, specific. No "Welcome back, superstar" and no generic dashboard nouns when a trade word exists.
- **Data honesty:** totals are computed from the rows in the workspace. The chart and pipeline sums agree. Empty states keep their frame.

## 2. Colour tokens

All components reference semantic variables from `src/index.css`; nothing downstream hard-codes a palette value.

### Light

| Role | Token | Value |
| --- | --- | --- |
| Page paper | `--ground` | `#FBF7F8` |
| Working surface | `--surface` | `#FFFFFF` |
| Raised well | `--raised` | `#F6F0F2` |
| Active nav | `--active` | `#F0E3E8` |
| Panel edge | `--border` | `#E9DEE2` |
| Row rule | `--rule` | `#F2EBEE` |
| Control edge | `--control` | `#D5C5CC` |
| Ink | `--text` | `#1B1418` |
| Secondary ink | `--muted` | `#6D5D65` |
| Meta ink | `--faint` | `#7D6D75` |
| Brand | `--accent` | `#B8336A` |
| Brand ink | `--accent-ink` | `#641B39` |
| Brand wash | `--accent-soft` | `#FBEEF4` |
| Brand track | `--accent-track` | `#F2D3E0` |
| Positive | `--positive` | `#1F7A54` |
| Negative | `--negative` | `#B3261E` |
| Warning | `--warning` | `#8A5A00` |
| Data hue | `--chart-1` | `#B8336A` |
| Data muted | `--chart-muted` | `#E7BDCE` |
| Pulse field | `--pulse-bg` | `#221821` |

### Dark

| Role | Token | Value |
| --- | --- | --- |
| Page paper | `--ground` | `#0F0C0F` |
| Working surface | `--surface` | `#171217` |
| Raised well | `--raised` | `#211A20` |
| Active nav | `--active` | `#2A2129` |
| Panel edge | `--border` | `#2F252E` |
| Row rule | `--rule` | `#251E24` |
| Control edge | `--control` | `#433640` |
| Ink | `--text` | `#FAF3F7` |
| Secondary ink | `--muted` | `#C0AFB8` |
| Meta ink | `--faint` | `#A08E98` |
| Brand | `--accent` | `#F07AA5` |
| Brand on dark | `--accent-ink` | `#FFD7E5` |
| Brand wash | `--accent-soft` | `#331A25` |
| Brand track | `--accent-track` | `#4B2637` |
| Positive | `--positive` | `#69D9A4` |
| Negative | `--negative` | `#FF8E9D` |
| Warning | `--warning` | `#F1C36B` |
| Data hue | `--chart-1` | `#F07AA5` |
| Data muted | `--chart-muted` | `#5A3344` |
| Pulse field | `--pulse-bg` | `#211921` |

The theme is written to `html[data-theme]`; the choice survives reloads in `localStorage`.

## 3. Type

**DM Sans** is the only typeface, bundled through Fontsource so it is present offline.

| Role | Size | Weight | Notes |
| --- | --- | --- | --- |
| Page title | 32px / 1.15 | 700 | 24px on phone, 28px on tablet |
| Section / panel | 18px / 1.3 | 600 | 16px in the right rail |
| KPI | 26px / 1.05 | 500 | tabular figures |
| Body | 14px / 1.5 | 400 | 16px in long prose |
| Labels | 13px / 1.35 | 600 | form labels, nav groups |
| Meta | 12–13px | 400–500 | captions, axis labels, table sublines |
| Pills | 12px | 600 | sentence case |

Numbers are tabular throughout the app. Headlines are sentence case and left-aligned. Display tracking is `-0.025em`; body tracking is normal. A 32px page title, 18px section and 26px figure do most of the hierarchy work.

## 4. Spacing and geometry

| Token | Value | Use |
| --- | --- | --- |
| `--page-pad` | 32px desktop / 20px tablet / 16px phone | outer canvas |
| `--gap` | 24px | section and grid gap |
| `--card-pad` | 24px | panel padding |
| `--control-height` | 38px | inputs and buttons |
| `--nav-row` | 34px | sidebar item |
| `--row-height` | 52px | table row |
| `--radius-card` | 8px | panels, modals, sheets |
| `--radius-control` | 6px | inputs and buttons |

The dashboard grid is 12 columns of 72px with 11 gaps of 24px: `12 × 72 + 11 × 24 = 1128`. The main column is 8 columns (744px), the rail is 4 columns (360px), and `744 + 24 + 360 = 1128`.

Cards do not carry shadows at rest. A single 1px edge separates surfaces. Shadows are reserved for floating menus, modals, sheets and toasts. Focus is a 2px accent ring or a 3px soft ring on inputs.

## 5. Components

- **Buttons:** 38px tall, 6px radius, 13/600. One filled primary per screen. Secondary is white with a control edge. Soft is a brand wash. Ghost and danger are text actions.
- **Fields:** label above, 40px control, 1px control edge, 6px radius. Hint and error sit under the field and are linked with `aria-describedby`.
- **Role cards:** custom radio cards with a 32px icon disc, selected border and wash.
- **Status pills:** 22px tall, pale tint with dark ink of the same hue, one status mark per row.
- **Tabs:** underline with a 2px accent indicator; counts in a quiet suffix.
- **Tables:** 12–13px muted headers, 1px rules, no zebra, tabular figures, right-aligned numeric columns and mobile card rows with the action visible.
- **Rail sections:** the right rail uses headings and rules on the page ground, not a stack of floating cards.
- **Pipeline pulse:** a dark ink field with the active application count, four stage bars, a weekly/offer strip, one finding and one action.
- **Menus and dialogs:** portals with focus trapping, Escape handling, body scroll lock and focus restoration.
- **Empty states:** a dashed frame, one sentence, one useful action. No illustrations or decorative shapes.
- **Skeletons:** flat bars at the real sizes of the final layout, no shimmer gradient.

## 6. Responsive behaviour

- **1440:** fixed 248px labelled sidebar, 1128px canvas, 8/4 dashboard columns.
- **1024 and below:** sidebar folds into a 56px top bar with a full-screen menu sheet.
- **768:** quick actions become two columns, KPI strip becomes three columns.
- **390:** one-column sections, two-column KPI strip, quick actions 2×2, tables become two-line rows with the stage and action visible, modals become bottom sheets, filters move into a sheet.
- Mobile margins are 16px; touch targets are at least 44px where they carry an action.
- The theme toggle is available in the sidebar and the mobile bar.

## 7. Motion

Motion is feedback, not entrance choreography:

- 120ms press, 150ms hover, 220ms menus and sheets.
- Modal and sheet focus/fade, menu rise, toast slide.
- Skeleton pulse, reduced to no animation under `prefers-reduced-motion`.
- Transform and opacity only. No parallax, colour cycling or scroll-jacking.

## 8. Accessibility

- Every page has one `h1`; every section has a heading.
- All inputs have visible labels or explicit accessible names, error messages use alert roles where appropriate and descriptions are linked.
- Modal and sheet focus is trapped; Escape closes; focus returns to the trigger.
- Status is not carried by colour alone: every pill has its stage word.
- Charts include a screen-reader list of values and a text summary.
- The mobile menu is a dialog with an accessible name and closes on route change.
- Focus rings remain visible in both themes.
