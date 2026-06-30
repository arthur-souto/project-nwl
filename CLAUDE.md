# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Vite dev server
npm run build    # tsc -b (typecheck) && vite build — always run this before considering a change done
npm run lint      # eslint .
npm run preview   # preview the production build
```

There is no test suite in this project. `npm run build` is the closest thing to a correctness check (it runs the TypeScript project build and will fail on type errors); `npm run lint` catches React-hooks correctness issues (see "Hooks gotchas" below) in addition to style.

## Tech stack

- React 19 + React Router 7 (client-side only, no SSR/meta-framework)
- Vite 8, TypeScript (project-references build via `tsc -b`)
- Tailwind CSS **v4**, wired via `@tailwindcss/vite` (no PostCSS config)
- axios for HTTP
- `jwt-decode` for reading claims off the access token client-side
- `lucide-react` is the only icon library used — all icons are `size={16}` (or smaller, e.g. 14 in metric cards) with `strokeWidth={1.5}`. Do not hand-roll new inline SVG icons or pull in a second icon library.
- No UI component framework (no MUI/shadcn/etc.) — everything in `src/components/ui/` is hand-built on top of Tailwind utilities.

## Tailwind v4 setup — read this before touching styles

This repo uses Tailwind v4's CSS-first config, **not** a `tailwind.config.js` read automatically by the build. The wiring is:

- `src/styles/tokens.css` defines all design tokens as plain CSS variables (`--color-primary`, `--radius-md`, `--shadow-sm`, `--spacing-*`, etc.).
- `tailwind.config.js` maps those CSS variables into Tailwind's theme (`theme.extend.colors.primary = 'var(--color-primary)'`, etc.) so utilities like `bg-primary`, `text-text-muted`, `rounded-md` work.
- `src/index.css` is what actually connects them: `@import "tailwindcss"` → `@import "./styles/tokens.css"` → `@config "../tailwind.config.js"`. The `@config` directive is what makes Tailwind v4 read the JS config at all — without it, `tailwind.config.js` is dead and any color/radius name not in Tailwind's defaults will silently fail to generate.

When adding a new design token: add the CSS variable in `tokens.css`, then map it in `tailwind.config.js`. Adding it in only one place will look like it works in one of the two but not produce a usable utility class.

## Design system conventions

- **Border radius is capped at `rounded-md` (6px) everywhere except functional circles** (avatars, the spinner) which legitimately use `rounded-full`. Don't reach for `rounded-lg`/`rounded-xl`/`rounded-2xl` — the product direction is a dense, restrained "enterprise" look (Notion/Linear-ish), not a soft/rounded consumer look.
- **Shadows are subtle by design** — `shadow-sm`/`md`/`lg` map to the custom tokens in `tokens.css`, which are intentionally faint. Tailwind's own un-mapped scale (`shadow-xl`, `shadow-2xl`) is *not* overridden and will look inconsistently heavy if used — stick to `shadow-sm`/`md`/`lg`.
- Colors should be used with purpose: status colors (`success`/`warning`/`error`/`info`, each with a `-light` background variant) are reserved for things that actually represent a state. Don't decorate neutral content with brand green just because it's available.
- `Badge` variants: `success`, `warning`, `error`, `info`, `outline`. Rendered small and uppercase (11px) — this is a dense data-table/status-chip aesthetic, not a pill/marketing badge.

## Dark mode

Dark mode is implemented entirely at the token layer, not with Tailwind `dark:` variants scattered through components. `tokens.css` redeclares the color tokens under a `.dark` class on `<html>`; every component that reads a color via `bg-*`/`text-*`/`border-*` token classes gets dark mode for free, with zero component-level changes. This only works because **every surface in the app reads color from a token, never a literal Tailwind color** (`bg-white`, `bg-gray-100`, `bg-[#f9fafb]`, etc.) — if you add a new component, use `bg-surface`/`bg-background`/`border-border`/etc., not a literal color, or it'll stay light-mode-only and look broken once a user switches to dark.

Two tokens exist *specifically* for dark mode correctness, not just style:
- `--color-on-primary` is the text/icon color used on top of a `bg-primary` surface (e.g. the primary `Button` variant, its loading `Spinner`). It's deliberately **not** `--color-text` and deliberately **not redefined in `.dark`** — the primary button's background doesn't change between themes (it's always the bright brand green), so the text sitting on it needs to stay a fixed dark color in both themes. Using `--color-text` here was an actual bug caught while building dark mode: in `.dark`, `--color-text` becomes light (for reading against the dark page background), which would have made primary-button text unreadable against the still-bright-green button.
- `--color-border-subtle` and `--color-skeleton` exist because `DataTable`'s dense row dividers/hover and `Skeleton`'s placeholder fill were originally literal hex (`#f3f4f6`, `bg-gray-100`) picked to look right specifically on a white background — they needed their own tokens rather than reusing `--color-border`/`--color-background`, since "a little lighter than the border" and "a neutral loading-placeholder fill" are each their own shade, not an existing token's value.

Theme state lives in `ThemeContext`/`ThemeProvider`/`useTheme` (`src/contexts/`, same 3-file split as `AuthContext` for the same fast-refresh-lint reason). It only stores `theme` and `toggleTheme` — it does not own *applying* the initial theme. That happens via an inline `<script>` in `index.html` that runs before the app mounts (reads `localStorage`, falls back to `prefers-color-scheme`, toggles the `dark` class on `<html>`), which avoids a flash-of-wrong-theme on load. `ThemeProvider`'s initial state just reads that already-applied class back (`document.documentElement.classList.contains('dark')`) — it doesn't set it. `toggleTheme` is the only thing that mutates the class + `localStorage`, and it does so from an explicit user action (a click), not from render or an effect, so there's no purity/`set-state-in-effect` concern here.

## Component conventions (`src/components/ui/`)

- All components accept `className` and merge it via `cn()` (`src/lib/cn.ts` — a minimal `classnames`-style helper, not a dependency). There is no `tailwind-merge`, so **avoid passing a className that conflicts with a class already baked into the component** (e.g. both `p-6` and `p-0`) — the resulting CSS cascade order is not guaranteed. Components that need to suppress a baked-in class expose a prop for it instead (see `Card`'s `padded` boolean, used by table-wrapping cards that need to own their own cell padding).
- `Card`, `Modal`, `Badge`, `Button`, `Input`, `Select` are generic primitives reused across both the public (Login/AuthCallback) and authenticated (Dashboard/Assets/Profile) parts of the app.
- `DataTable<T>` (generic) + `Pagination` + `Skeleton` + `MetricCard` are the building blocks for any data-table page. `Pagination` is intentionally text-only (`← Anterior | Página X de Y | Próximo →`), not numbered buttons.
- `src/components/layout/` (`Sidebar`, `Topbar`, `AppLayout`) is the authenticated app shell — see below.

## Authenticated app shell

Every authenticated page is a thin wrapper around `AppLayout`:

```tsx
export default function SomePage() {
  return <AppLayout title="Some Page">{/* page content */}</AppLayout>
}
```

`AppLayout` (`src/components/layout/AppLayout.tsx`) is where all the cross-cutting authenticated-page concerns live, so individual pages don't repeat them:
- Auth guard via `useRequireAuth()` (redirects to `/` if there's no access token) — pages never need to check this themselves.
- Renders `Sidebar` (desktop: fixed 220px left rail; mobile: off-canvas drawer) and `Topbar`.
- Owns the account-verification gate: reads `isVerified` from `AuthContext` (see below) and auto-opens `VerificationModal` when the account isn't verified yet, on **any** authenticated page, not just one. The modal's open/closed state itself is still local to each `AppLayout` instance (recomputed as `!isVerified` on mount) — that's fine *because* `isVerified` itself now lives in `AuthContext`, not in `AppLayout`. Don't move `isVerified` back into `AppLayout`'s own state: `AppLayout` is re-instantiated by every page (`Dashboard`/`Assets`/`Profile` each render their own `<AppLayout>`), so state that lives there resets on every navigation — that was the original bug (verifying successfully, then navigating to another page silently popped the modal back open with an already-used activation code, because the per-page `AppLayout` re-derived `isVerified` from the still-stale JWT claim).

Sidebar nav only lists routes that actually exist (`Início` → `/dashboard`, `Ativos` → `/assets`). Don't add nav items for pages that don't exist yet — add the page first.

## Auth flow

1. `Login` redirects to `GOOGLE_AUTH_URL` (backend-initiated Google OAuth2).
2. Google redirects back to `/auth/callback?code=...`. `AuthCallback` exchanges the code via `authService.exchangeAuthCode`, stores the resulting `{ accessToken, refreshToken }` via `tokenService.setTokens`, then calls `loadCurrentUser()` (populates `AuthContext`) before navigating to `/dashboard`.
3. `httpClient` (`src/api/httpClient.ts`) is a shared axios instance with a request interceptor that attaches `Authorization: Bearer <token>` from `tokenService.getAccessToken()` automatically — services never set this header manually.
4. `AuthContext` (`src/contexts/`) holds the current user (`/v1/api/auth/me` response) **only in memory**. It's populated right after login, and `AuthProvider` also fetches it once on mount if an access token already exists in `localStorage` (so a hard page refresh doesn't leave the avatar/profile UI empty) — see the mount `useEffect` in `AuthProvider.tsx`. That mount effect calls `fetchCurrentUser()` and handles `setUser`/`setIsLoadingUser` only inside `.then()/.catch()/.finally()`, deliberately *not* through the shared `loadCurrentUser()` helper — calling `loadCurrentUser()` directly from the effect body trips `react-hooks/set-state-in-effect`, because the linter's data-flow analysis sees through the `useCallback` into the synchronous `setIsLoadingUser(true)` at its top. `isLoadingUser`'s initial value is itself computed via a lazy `useState(() => Boolean(getAccessToken()))` so there's no flash of "no user" before the mount fetch resolves.
5. `isVerified` lives in `AuthContext` as its own field (not derived from `user.isVerified` on every read). It's seeded synchronously from the JWT claim (`tokenService.getAccessTokenPayload`) so it's available before the `/me` round-trip resolves, then kept in sync with the server's value whenever `/me` actually loads (both in the mount-hydration effect and in `loadCurrentUser`). `VerificationModal`'s success path calls `markVerified()` (from `AuthContext`) to flip it to `true` immediately — activating an account doesn't reissue a JWT, so the *only* source of truth for "verified" after that point is this in-memory flag, which is why it must live in `AuthContext` (app-lifetime) and not in `AppLayout` (per-page-lifetime).
6. Logout (`useLogout`) clears tokens, clears `AuthContext`, and navigates to `/`.

`AuthContext` is split across three files (`AuthContext.ts`, `AuthProvider.tsx`, `useAuth.ts`) purely because `eslint-plugin-react-hooks`'s fast-refresh rule rejects a file that exports both a component and a hook. Don't recombine them.

## Role-based access (`role` / `isAdmin`)

`role` (`'USER' | 'ADMIN'`) follows the exact same dual-source pattern as `isVerified`: seeded synchronously from the JWT claim in `AuthProvider`, then kept in sync with `/me`'s `role` field whenever it loads. `isAdmin` is a derived boolean (`role === 'ADMIN'`) computed once in `AuthContext`'s value — read `isAdmin` from `useAuth()` at the call site rather than re-comparing `role === 'ADMIN'` inline.

Admin-only actions (editing an asset, adding/deleting an indication) are gated **client-side for UX only** — the backend is the real authorization boundary (those endpoints reject non-admins regardless of what the UI shows). The pattern used in `Assets.tsx` / `AssetDetailModal.tsx`:
- The row action that opens `AssetDetailModal` swaps icon + label based on `isAdmin` (`Pencil`/"Editar" vs `Eye`/"Ver detalhes") to set the right expectation before the modal even opens.
- `AssetDetailModal` has no separate view/edit mode — it's one form whose fields all get `disabled={!isAdmin}`, and the footer swaps between Cancelar+Salvar (admin) and a single Fechar button (non-admin) so there's no submit path at all for non-admins.
- The indications "Adicionar" input/button and each item's delete button are wrapped in `{isAdmin && (...)}` and don't render at all for non-admins — viewing the indications list itself stays available to everyone (`GET .../indications` has no role restriction).

## Service layering

`src/api/client.ts` — base URL + endpoint URL constants (overridable via `VITE_*` env vars) and shared response/entity types. `src/api/httpClient.ts` — the one axios instance everything goes through. `src/services/*.ts` — one file per domain (`authService`, `tokenService`, `assetService`), each a thin set of functions over `httpClient`; no business logic in components or pages beyond calling these.

When the backend returns a field that the OpenAPI/Swagger doc claims is always present but isn't (e.g. `Asset.supplier` can be `null` in practice), trust the runtime behavior over the doc — type it as nullable and render defensively (`'—'` fallback), don't assume the contract is accurate.

Contracts handed over for implementation have also been *incomplete*, not just imprecise about nullability — a later "expanded `AssetResponse`" contract omitted `supplier` entirely (it wasn't renamed to `manufacturer`, both fields are real and coexist) until an actual response body surfaced it. If a field disappears from a new contract that an existing feature already renders, don't assume it was intentionally removed — flag it and ask, rather than deleting the working column/field outright.

**Don't assume every paginated endpoint shares one page shape.** `Page<T>` (search, indications) is flat — `{ content, totalElements, totalPages, size, number, first, last, empty }` at the root. `/v1/api/assets/favorites` returns a *different* flat shape missing `first`/`last`/`empty` (type `FlatPage<T>`, see `client.ts`) — it wasn't part of the contract update that introduced `Page<T>`'s current shape, so don't assume it picked up those three fields too. Check the actual response shape per-endpoint before reusing a pagination type; this has already changed once (search used to nest pagination under a `page: {...}` sub-object).

401s reaching a feature's own `.catch()` are not "session expired" — `httpClient`'s interceptor already tried (and gave up on) refreshing the token before the error propagates that far, so a surviving 401 means something else (e.g. an unverified account). `src/lib/httpError.ts`'s `getErrorMessage()` encodes this and is the place to extend if new 401 sub-cases show up.

**There is no "get asset by id" endpoint.** `AssetDetailModal` (`src/components/AssetDetailModal.tsx`) only ever receives an already-loaded `Asset` object as a prop from whatever list fetched it (`Assets.tsx`'s table) — it never fetches by id itself. This is why the asset detail/edit UI is a modal fed from in-memory list data rather than a routable `/assets/:id` page: a dedicated page would have no way to load its data on a fresh navigation or refresh. If a get-by-id endpoint is added later, revisit this.

`AssetDetailModal` doubles as both the "view details" and "edit" UI — there's no separate read-only mode. It diffs its form state against the original `Asset` prop (`buildUpdatePayload`) and only sends fields that actually changed in the `PATCH`, per the backend's partial-update contract. After a successful save, it calls `onAssetUpdated(updated)` so the caller can patch its own list state in place — it does not refetch the list.

The `concentration*` fields are numeric but stored as strings in form state (like every other field), parsed back to numbers only at diff/submit time via `parseOptionalNumber`. That helper treats an empty or invalid string as "unchanged," not "clear this field" — there's no documented way to null out a previously-set concentration value through this PATCH contract (only set/overwrite), so the UI doesn't pretend to support clearing one. The "Verificar concentração" quick-check input is unrelated to those edit fields — it hits `GET .../concentration-check` directly (debounced 500ms via the same `useDebouncedValue` hook used in `Assets.tsx`'s search) and only renders at all when the asset already has concentration data, since checking against an asset with none would just always come back `NO_DATA`.

## Hooks gotchas (already hit these — don't reintroduce)

- **Don't add a `setState` call that runs synchronously in the body of a `useEffect`.** `eslint-plugin-react-hooks`'s `react-hooks/set-state-in-effect` rule forbids this (it causes a cascading extra render). When you need to reset/derive state in response to something changing (e.g. close a menu when the route changes, debounce a value), either (a) do it in the event handler that caused the change, or (b) use the render-time "adjust state during render" pattern already used in `Sidebar`/`AppLayout`/`Topbar`'s mobile-menu-close logic:
  ```tsx
  const [lastPathname, setLastPathname] = useState(location.pathname)
  if (location.pathname !== lastPathname) {
    setLastPathname(location.pathname)
    setIsMenuOpen(false)
  }
  ```
  `setState` calls inside a `.then()/.catch()/.finally()` or a `setTimeout` callback are fine — the rule only targets the synchronous part of the effect body. This tracing isn't limited to literal `setX(...)` calls written inline in the effect — it sees through a same-component `useCallback` too. Calling a helper like `loadCurrentUser()` (whose body starts with a synchronous `setIsLoadingUser(true)`) directly from an effect body trips the rule just as if the `setState` were written inline. If you need an effect to run that same kind of "set loading, await, set result" logic on mount, don't call the shared helper from the effect — inline the fetch with `.then()/.catch()/.finally()` directly in the effect instead (see `AuthProvider`'s mount-hydration effect).
- **A network call that consumes a single-use value (e.g. an OAuth `code`) must be guarded against firing twice**, because React's `<StrictMode>` (enabled in `main.tsx`) intentionally double-invokes effects in dev. Guard with a `useRef` flag that's set before the call starts (see `AuthCallback`), and don't *also* wrap the call in an `ignore`/`cancelled` flag pattern — combining both means the real request's own cleanup fires synchronously before the response arrives and the response gets silently dropped. The `ignore`-flag pattern (used in `Assets.tsx`'s search effect) is for the opposite case — a call that's safe and *expected* to fire more than once (e.g. on every debounced keystroke), where only the latest response should win.
