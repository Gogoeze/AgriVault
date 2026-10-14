# AgriVault

Cold storage management for farm produce — inventory, climate monitoring,
withdrawals and payments, for a facility and the farmers who store with it.

React + TypeScript + Vite on the front, Supabase (Postgres, Auth, Realtime,
Edge Functions) on the back, Resend for mail.

---

## Running it

```bash
npm install
cp .env.example .env.local        # fill in the Supabase values
npm run db:start                  # local Postgres, Auth, Studio, mail catcher
npm run db:reset                  # apply the migration, then the seed
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on :5173 |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run typecheck` | Types only |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` | Prettier |
| `npm run db:reset` | Re-apply migration + seed to the local database |
| `npm run db:push` | Apply migrations to the linked hosted project |
| `npm run db:types` | Regenerate `src/types/database.ts` from the live schema |
| `npm run emails:auth` | Rebuild the Supabase Auth email templates |
| `npm run fn:serve` / `fn:deploy` | Edge functions, locally or deployed |

Local mail is caught at <http://localhost:54324> — nothing leaves the machine
and no Resend quota is spent.

### Seeded accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@agrivault.ng` | `AgriVault@2026` |
| Farmer | `amina@agrivault.ng` | `Farmer@2026` |
| Farmer | `kelechi@agrivault.ng` | `Farmer@2026` |
| Farmer | `damilare@agrivault.ng` | `Farmer@2026` |
| Farmer | `mubarak@agrivault.ng` | `Farmer@2026` |

These are confirmed in place so they sign in without an inbox. **Change them
before this is exposed to anyone.** Accounts that sign themselves up go through
the real Resend-backed verification flow instead.

---

## Layout

```
src/
  app/            entry, providers, router, route guards, navigation
  components/
    ui/           the design system — button, field, card, table, badge, modal
    layout/       app shell: sidebar, topbar
  features/
    auth/         context, provider, sign-in / sign-up / verify / reset
    account/      profile and password, shared by both roles
    admin/        dashboard, users, inventory, monitoring, payments, settings
    farmer/       dashboard, payments
    facility/     facility, settings, units, produce — queries
    inventory/    batches and the user directory — queries, QR tag
    monitoring/   readings, alerts, realtime, climate chart
    payments/     payments queries and the receipt PDF
    withdrawals/  request and decision queries
    notifications/ the bell and its panel
  lib/            supabase client, env, formatting, query keys, cn
  styles/         tokens.css (the design system) and index.css
  types/          database types

supabase/
  migrations/     one file: the entire schema
  seed.sql        facility, accounts, demo data
  templates/      generated Supabase Auth emails
  functions/
    _shared/      http, supabase clients, Resend, the email design system
    send-email/   renders a named template and sends it through Resend
    ingest-reading/ the endpoint the sensor rigs post to
```

Features own their own queries, components and pages. Anything two features
need lives in `components/` or `lib/`.

---

## Design rules

Three rules, in `src/styles/tokens.css`. The system reads as considered only
while they hold.

**Type.** Archivo throughout. IBM Plex Mono *only* for identifiers, money,
weights and sensor readings — never prose. Weights: 400 body, 500 emphasis,
600 headings, and nothing else. Icons are Material Symbols Rounded:
`<Icon name="check_circle" />`, names at
[fonts.google.com/icons](https://fonts.google.com/icons).

**Colour.** One brand hue plus neutral greys. The three status colours — `ok`,
`warn`, `critical` — mean state and are never decoration. Components use the
semantic aliases (`surface`, `ink`, `ink-muted`, `line`), not the raw ramp, so
a re-theme is one block of edits.

**Spacing.** 4, 8, 12, 16, 24, 32 — Tailwind steps `1 2 3 4 6 8`. Nothing in
between. If a gap seems to need 20px, one of the two neighbours is wrong.

Status never gets hand-rolled: `AccountBadge`, `BatchBadge`, `PaymentBadge`,
`WithdrawalBadge` and `SeverityBadge` in `components/ui/badge.tsx` are the only
place a domain state becomes a colour.

---

## Database

Everything is in `supabase/migrations/20261013090000_init.sql` — enums, tables,
constraints, indexes, triggers, views, RLS, storage and realtime.

**Authorisation is RLS, not the UI.** Admins see the facility; farmers see
their own rows. The route guards are a convenience; the policies are the
control. `public.is_admin()` and `public.auth_role()` are `security definer` so
policies can read `profiles` without recursing through its own policy.

**The database holds the rules, not the client.**

- A reading outside the configured band raises an alert, and the alert notifies
  every active admin — `evaluate_reading`, `notify_admins_of_alert`.
- A withdrawal request is checked against what is actually in the batch,
  *including requests already in flight*, before it is accepted.
- Stock only moves on collection, inside a `for update` lock, and the batch
  closes itself when it empties — `apply_withdrawal`.
- Payment status and balance are generated columns. They cannot drift from the
  amounts.
- `expire_due_batches()` flips batches past their date; run it on a schedule.

**Money is integer kobo.** It becomes naira in `lib/format.ts` and in the email
templates, and nowhere else. Weight is kilograms; tonnes are display only.

`sensor_readings` has no insert policy on purpose. Readings arrive through the
`ingest-reading` edge function under the service role, so nothing holding a
browser token can forge one.

---

## Mail

Both paths share one design — `supabase/functions/_shared/email/`.

**Auth mail** (confirm, recovery, magic link, invite, email change,
reauthentication) goes out through Supabase Auth over Resend SMTP, configured
in `supabase/config.toml`. The HTML lives in `supabase/templates/` and is
generated from the shared blocks:

```bash
npm run emails:auth
```

Those files are committed, so a fresh checkout works without running anything.
Re-run it after editing `blocks.ts` or `theme.ts` — never hand-edit the output.

**Application mail** goes through the `send-email` function, which renders a
named template, sends it with the Resend API, and records the attempt in
`email_log` whether it succeeds or not. Templates, with typed payloads:

| Template | Goes to | When |
| --- | --- | --- |
| `welcome` | farmer | email verified |
| `account_created` | farmer | an admin registered them |
| `batch_stored` | farmer | produce taken in |
| `booking_confirmed` | farmer | booking paid |
| `payment_receipt` | farmer | payment recorded |
| `payment_reminder` | farmer | balance outstanding |
| `withdrawal_requested` | admin | a request needs a decision |
| `withdrawal_decided` | farmer | approved or declined |
| `withdrawal_collected` | farmer | produce released |
| `storage_expiring` | farmer | storage period nearly up |
| `storage_expired` | farmer | period passed |
| `climate_alert` | admin | a room left its band |

`EmailPayloads` types each one, so a template and its caller cannot drift
apart.

### Resend setup

1. Verify your sending domain in Resend and create an API key.
2. Local: put `SMTP_*`, `RESEND_API_KEY` and `RESEND_FROM` in `.env`.
3. Hosted: SMTP under **Authentication → SMTP** (host `smtp.resend.com`, port
   `465`, user `resend`, password the API key), then
   `supabase secrets set --env-file supabase/.env` for the function secrets.

---

## Sensor ingest

```bash
curl -X POST "$SUPABASE_URL/functions/v1/ingest-reading" \
  -H "x-device-key: $DEVICE_INGEST_KEY" \
  -H "content-type: application/json" \
  -d '{"deviceId":"store_001","temperatureC":9.4,"humidityPct":71.2,"batteryPct":86}'
```

`deviceId` maps to a row in `storage_units`. Repeat posts for the same instant
are ignored rather than duplicated. Everything after that — alerting,
notifying, the live update in any open browser — happens in the database.
