# Home Perfect — Ops Command Center

An internal operations dashboard: Executive AR & Cash, Adjuster Defense, and Referral Leaderboard, in one responsive, tabbed view. Built with Next.js (App Router), TypeScript, and Tailwind CSS v4. All data is fetched client-side from a set of mock API routes (Next.js Route Handlers) backed by static fixtures — a real network round trip, not a synchronous import — so swapping the mock handlers for real backends is a self-contained change; see [Connecting real APIs](#connecting-real-apis).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| Testing | Jest + React Testing Library |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve a production build |
| `npm test` | Run the Jest suite once |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run lint` | ESLint |

## Project structure

```
src/
  app/
    layout.tsx          root layout, fonts, metadata
    page.tsx             renders <DashboardApp/> — no data passed in directly
    globals.css          design tokens (Tailwind @theme) ported from the original static sample
    api/
      profile/route.ts             GET → ProfileData (brand, location, notifications, avatar)
      executive/route.ts           GET → ExecutiveData (AR KPIs, aging, carriers, carrier insight)
      adjuster-cases/route.ts      GET → AdjusterCase[]
      referral-partners/route.ts   GET → ReferralData (partners + referral insight)
      health/route.ts              GET → HealthStatus (status/timestamp/uptime) — liveness probe, uncached,
                                    503 when the API is toggled off
      toggle/route.ts              GET/POST → ApiToggleState ({ enabled }) — GET reads the kill switch,
                                    POST flips it; the on/off simulation control
      */route.test.ts              each route handler tested directly (Node test environment; see below)
  components/
    DashboardApp                       fetches all four endpoints on mount, assembles DashboardData,
                                        renders a loading/error/ready state; the error state renders
                                        <ApiToggle/> + a "Try again" retry button so a toggled-off API
                                        is recoverable without leaving the page
    ApiToggle                          on/off kill-switch button — fetches real state from /api/toggle on
                                        mount (starts "checking", never assumes "on"), optimistically
                                        flips on click with rollback on failure
    TopBar, TabNav                     shell chrome — renders <ApiToggle/>; also links out to /api/health
                                        (plain <a>, opens in a new tab; not a live-polling widget)
    KpiCard, PeriodToggle              Executive tab primitives (KpiCard supports an optional freshness tag)
    AgingBar, CarrierItem
    FieldRow, Chip                     shared record-card primitives (FieldRow can render its value as a DeadLink)
    ResolvableSelect, FeeSelect        action dropdowns with resolve/settle logic (FeeSelect is fully controlled
                                        by its `status` prop, which is what makes undo work)
    AiInsightPanel                     collapsible AI suggestion panel; insertable insights delegate the
                                        "Copy to F9 Note" click to the parent instead of self-managing state
    NoteModal                          editable textarea overlay used before an AI-drafted note is copied
                                        to the clipboard
    ClaimDetailModal                   read-only claim detail overlay, opened from a case's title
    CarrierDetailModal                 read-only aging-bucket breakdown overlay, opened from a carrier's name
    ReferralPartnerDetailModal         read-only partner detail overlay (fields + fee status), opened from a
                                        partner's name
    Toolbar                            search input + optional carrier filter + optional status segments + export
    Toast, ToastProvider, DeadLink     click-a-value-to-preview-it affordance: DeadLink shows a toast naming what
                                        it would open, instead of a dead `href="#"`
    ChatWidget                         floating AI-assistant preview (FAB + canned suggested-question replies)
    AdjusterCaseCard, ReferralPartnerCard   composite record cards
    ExecutiveView, AdjusterDefenseView, ReferralLeaderboardView   one per tab
    DashboardShell                     top-level composition + cross-tab state; mounts ToastProvider/Toast/ChatWidget
    *.test.tsx                         co-located test for every component above
  lib/
    types.ts              domain types (AdjusterCase, ReferralPartner, DashboardData, ...), plus the four
                           per-endpoint slices (ProfileData, ExecutiveData, AdjusterCasesData, ReferralData),
                           HealthStatus, and ApiToggleState
    api-toggle.ts (+ .test.ts)   in-memory kill switch (isApiEnabled/setApiEnabled) that every route handler
                           checks, returning 503 when it's off — simulates the backend going down
    dashboard-logic.ts (+ .test.ts)   pure functions for cross-tab business rules
    csv.ts (+ .test.ts)   CSV builder (pure, thoroughly tested) + a thin browser-download side effect
    clipboard.ts (+ .test.ts)   one-line wrapper around navigator.clipboard.writeText()
    api-client.ts (+ .test.ts)   typed fetch() wrappers, one per endpoint — the only thing that knows the URLs
    mock-data.ts           the four fixtures the route handlers serve (profileData, executiveData,
                            adjusterCasesData, referralData) — the mock "backend"
```

Every component's test lives next to it (`Foo.tsx` / `Foo.test.tsx`), and every one was written test-first: the test was authored and run red before the component existed, then the component was implemented to turn it green. `npm test` runs the full suite. Route handler tests need the `Request`/`Response` globals `next/server` expects, which jsdom (the project's default test environment) doesn't provide — each `route.test.ts` opts into the Node environment per-file with a `/** @jest-environment node */` docblock rather than changing the global config.

## Architecture notes

**All data comes from the API layer — genuinely, over `fetch()`, not by import.** `DashboardApp` (mounted by `page.tsx`) is the only component that knows the data is fetched at all: on mount it calls the four `api-client.ts` functions in parallel, assembles their responses into one `DashboardData` object, and renders `DashboardShell` once every request has resolved (a loading state before that, an error state if any request rejects). Every other component — `DashboardShell` down to the leaf primitives — still just receives `DashboardData` as a prop, exactly as before; swapping the mock API for a real one only touches the four `src/app/api/*/route.ts` handlers, never a component.

**`/api/health` is a liveness probe, not a data source — it's outside the DashboardData contract entirely.** It's for external monitoring (uptime checks, a load balancer, `curl` in CI before hitting the other routes) and for a human to check manually: `TopBar` links out to it with a plain `<a href="/api/health" target="_blank">`, real navigation to the raw JSON, not a `fetch()` call. There's deliberately no live-polling status widget in the UI — an earlier version had a self-fetching `HealthIndicator` in the header, but that turned every test rendering `TopBar` into a test that also had to mock `fetchHealth` (three files did), for a feature whose actual value was "let someone check the API," not "narrate its status continuously in the header." A plain link gets the same job done for near-zero cost: `HealthStatus` (the response type) and the route itself are still real and tested (`route.test.ts`), just not wrapped in a client fetcher — `api-client.ts` only has wrappers for the four data endpoints the app actually needs to call from JS. `Cache-Control: no-store` on the route so a manual check always reflects the current process, not a cached response; `uptimeSeconds` comes from `process.uptime()`, which only means something meaningful once this becomes a real long-running server rather than a serverless function that cold-starts per request.

**The mock API has a real on/off kill switch, for simulating an outage.** `src/lib/api-toggle.ts` holds a module-level `enabled` flag (default `true`) behind `isApiEnabled()`/`setApiEnabled()`. `POST /api/toggle` flips it and `GET /api/toggle` reads it; all five other routes (the four data endpoints plus `/api/health`) check `isApiEnabled()` and return 503 when it's off. This is a single in-memory value — correct for `next dev` and a single-instance deployment, but it does **not** synchronize across multiple serverless instances, so it's a dev/demo tool, not a production feature flag. `ApiToggle` (rendered in `TopBar`, and again in `DashboardApp`'s error state) is the UI for it: on mount it calls `fetchApiToggleState()` and shows the *real* state — starting from a neutral "checking" label, never an assumed "on" — falling back to "off" (not a false "on") if that initial fetch itself fails; clicking it calls `toggleApi()` optimistically (flips immediately, rolls back on failure) and disables itself while the request is in flight. Because `ApiToggle` self-fetches on mount, every test that renders it (directly or via `TopBar`/`DashboardShell`/`DashboardApp`) needs `jest.mock("@/lib/api-client")` plus a `beforeEach` that defaults `fetchApiToggleState` to a never-resolving `Promise`, so unrelated tests don't get an unmocked-fetch crash or an `act()` warning — only the specific test that cares about the resolved value overrides it.

**Business logic lives in pure functions, not components.** `src/lib/dashboard-logic.ts` holds the rules for how state changes — `countOpenIssues`, `resolveChip`/`unresolveChip`, `settleFee`/`unsettleFee`, `sumPendingFees`, `filterCases`/`filterPartners`, `chipDisplayText`, `computeCustomRangeClosing`. These are unit-tested directly with plain Jest, no rendering required. Components stay presentational and call these functions from event handlers. Resolving/settling never mutates stored text — `chipDisplayText` derives what to show (base text vs. `okText`) from `status` at render time, which is what makes the undo pairs above trivial: undo just flips `status` back, nothing to reconstruct.

**Cross-tab state is lifted to `DashboardShell`.** Resolving a chip on the Adjuster Defense tab needs to update that tab's badge count; settling a referral fee needs to update the Executive tab's "Pending Referral Payouts" KPI. Rather than threading ad-hoc callbacks, each view (`AdjusterDefenseView`, `ReferralLeaderboardView`) owns its own list state locally and reports derived totals upward (`onIssueCountChange`, `onPendingChange`) via `useEffect`. `DashboardShell` holds those totals and passes them into `TabNav`'s badge and `ExecutiveView`'s KPI. All three tab panels stay mounted (toggled with the `hidden` attribute, not conditional rendering) so this state doesn't reset when switching tabs.

**Undo is "session-known," not a real history stack.** Each view tracks *which* chip ids / partner ids it resolved or settled *this session* (`resolvedChipIds`, `settledInSession` — plain `Set`s in state). The Undo affordance only renders for those ids, matching the original sample: a value that started the session already resolved/paid has no Undo link, since there's nothing in this session to undo.

**Every AI insight can be copied to the clipboard, with wording that matches what it's actually for.** `AiInsight` carries optional `copyLabel`/`modalTitle` fields (default: `"Copy to Clipboard"` / `"Edit Note"`); the two F9-note insights (DASH-4821, DASH-4789) set them to `"Copy to F9 Note"` / `"Edit F9 Note"` explicitly, since that suggested text really is meant for a claim's F9 form. Every other insight — the two per-case "suggested action" insights (DASH-4835, DASH-4840), the carrier-escalation insight (Executive tab), and the referral-prioritization insight (Referral tab) — uses the generic default, since "copy to F9 Note" would be a lie for a suggestion like "call Chase's Loss Draft department directly." `AiInsightPanel` no longer manages its own "inserted" state — an insertable insight's button calls `onRequestInsert`, and the owning view opens `NoteModal` (now parameterized by `title`/`copyLabel` instead of hardcoding F9 wording) with that insight's text pre-filled and editable. Clicking the button there calls `copyToClipboard` (`src/lib/clipboard.ts`, a one-line wrap of `navigator.clipboard.writeText`) with whatever the user edited, then `onSave`; a failed clipboard write (permission denied, insecure context) is swallowed so the flow still completes rather than getting stuck. The confirmed-state label is derived automatically via `confirmedCopyLabel` (`dashboard-logic.ts`) rather than hand-duplicated per insight — it turns `"Copy X"` into `"✓ Copied X"`. `ExecutiveView` and `ReferralLeaderboardView` each hold their own single-insight copy/editing state (`carrierInsightCopied`/`editingCarrierInsight`, `referralInsightCopied`/`editingReferralInsight`), the single-item analog of `AdjusterDefenseView`'s per-case `insertedNoteIds`/`editingCase`. Testing note: `@testing-library/user-event`'s `setup()` installs its own real in-memory clipboard stub on `navigator.clipboard` the moment it's called (silently replacing any earlier stub, including a `jest.fn()` set up globally) — so clipboard assertions in any test that calls `userEvent.setup()` spy on it *after* that call (`jest.spyOn(navigator.clipboard, "writeText")`), not before.

**Dead links preview a destination instead of doing nothing.** Adjuster names are wrapped in `DeadLink`, which calls a `notify()` from `ToastProvider` (mounted once, in `DashboardShell`) instead of navigating. `Toast` auto-dismisses after ~1.8s. This is deliberately honest UI for a still-unwired area — it tells you where a detail page will eventually live without faking navigation. Every other **title** in the app is the exception: real, not a preview, each opening a read-only detail modal owned by its view (the same `viewingX` state + `onOpenDetails` callback shape every time, one slot per list, plus a single `viewingCarrier` slot on the Executive tab since there's exactly one aging breakdown):
  - A case's title (`AdjusterDefenseView`, `viewingCase`) → `ClaimDetailModal` — full field/chip detail.
  - A carrier's name in the Carrier Aging Breakdown (`ExecutiveView`, `viewingCarrier`) → `CarrierDetailModal` — labels each of that carrier's four aging-bucket segments (`"0–30 days"` ... `"90+ days"`, paired with `CarrierAging.segments` by index) and its share of the balance, detail otherwise only visible as an unlabeled colored bar.
  - A partner's name (`ReferralLeaderboardView`, `viewingPartner`) → `ReferralPartnerDetailModal` — full field detail plus a derived "Fee status" row (`"$750 Pending"` or `"Paid — Check #1042"`) that isn't shown anywhere on the compact card.

**Design tokens carried over 1:1.** The color palette, spacing, and radius values from the original static HTML sample live in `src/app/globals.css` as Tailwind v4 `@theme` variables (`--color-panel`, `--color-amber`, `--radius-card`, ...), exposed as utility classes (`bg-panel`, `text-amber`, `rounded-card`). Dark/light theming follows the same `prefers-color-scheme` + `data-theme` override pattern as the original.

**Responsive by default, not by breakpoint patchwork.** The KPI grid and record-card grids use CSS Grid (`grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr]`, `grid-cols-[repeat(auto-fill,minmax(300px,1fr))]`) so cards reflow from 1 column on phones to multi-column on tablets and laptops without horizontal scrolling. Tabs scroll horizontally on narrow viewports instead of wrapping. Verified at 390px (mobile), 834px (tablet), and 1440px (laptop).

## Feature notes

- **Search / filter / export** (Adjuster Defense, Referral Leaderboard): `Toolbar` composes a free-text search, an optional carrier filter, and optional status segments (`All` / `Needs Attention` / `Resolved`); filtering runs through the pure `filterCases`/`filterPartners` functions. Export CSV builds the file from whatever's currently visible (post-filter) via `recordsToCsv`, not the full dataset.
- **Custom date range** (Executive tab): selecting "Custom" in the period toggle reveals a from/to date range; Apply runs `computeCustomRangeClosing`, a placeholder formula (`days × 2` signed, `days × 3` dispatched) standing in for a real reporting-period query once wired to live data.
- **Chat widget** is explicitly a UI preview: it answers with regex-matched canned replies (dev-team routing, export, generic fallback), not a real model call. See [Connecting real APIs](#connecting-real-apis) for how this slots into a Claude-backed endpoint.
- **Known gap:** the sample also turns the "Unbilled WIP" aging-legend entry into a dead link with an inline "not in AR total" tag; that one specific micro-interaction wasn't carried over, to avoid over-specializing the generic `AgingBar` component for a single caller.

## Connecting real APIs

The app already talks to `/api/profile`, `/api/executive`, `/api/adjuster-cases`, and `/api/referral-partners` over real HTTP — they just happen to be mock Route Handlers (`src/app/api/*/route.ts`) that return the static fixtures in `src/lib/mock-data.ts`. Swapping in real backends means replacing what's *inside* those four handlers, not how the app consumes them:

1. In each `route.ts`, replace the `NextResponse.json(fixtureData)` body with a call to the real source — AR/QuickBooks, claims/adjuster system, referral tracking — and shape the result to match that route's type in `src/lib/types.ts` (`ProfileData`, `ExecutiveData`, `AdjusterCasesData`, `ReferralData`).
2. If a real source needs a secret credential, keep it in the Route Handler (server-side already) — it never needs to reach `api-client.ts` or the browser.
3. Nothing downstream changes: `api-client.ts`, `DashboardApp`, `DashboardShell`, and every component below it only know the `DashboardData` shape, not where each slice came from. If you outgrow four parallel `fetch()` calls (e.g. you want caching, retries, or polling), that upgrade — e.g. to TanStack Query — also stays contained to `DashboardApp`.
4. For actions that currently only update local React state (resolving a chip, settling a fee), add a mutation call inside `AdjusterDefenseView`'s and `ReferralLeaderboardView`'s handlers so the change is persisted, not just reflected in the UI.
5. Search, filtering, and CSV export are already fully client-side against whatever `DashboardData` is loaded — no API changes needed there.

### Making the AI features real

Three pieces of UI already assume an AI backend and are shaped to receive one directly, with no component changes required:

- **Per-case insight** (`AdjusterCase.aiInsight`), **carrier-escalation insight** (`DashboardData.carrierInsight`), and **referral-prioritization insight** (`DashboardData.referralInsight`) all share the `AiInsight` type (`patternLabel`, `pattern`, `suggestedNoteLabel`, `suggestedNote`, `insertable`). Replace the static values in `mock-data.ts` with a server-side call to Claude (Anthropic Messages API, structured output via a Zod schema matching `AiInsight` 1:1) from a Next.js Route Handler, called on-demand when a user opens an insight panel rather than pre-generated for every case on load.
- **`ChatWidget`'s `cannedReply`** is the one function to replace with a real request to a chat Route Handler once you're ready to back it with a model call.
