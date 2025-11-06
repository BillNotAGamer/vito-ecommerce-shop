## Quick context for AI coding agents

This is a Next.js app (App Router) located under `src/app/`. It's a TypeScript project using Next 15 and React 19, Tailwind CSS, and Turbopack for local dev/build.

Key files to read before making changes
- `package.json` — scripts: `npm run dev` (`next dev --turbopack`), `build` and `start`.
- `next.config.ts` — image remote patterns and other runtime settings.
- `src/app/layout.tsx` — global layout, fonts and global components (`SiteHeader`, `SiteFooter`).
- `src/lib/backend.ts` — central API client. Requires `NEXT_PUBLIC_API_BASE` and exposes `fetchBackend` and `parseJsonSafe`.
- `src/lib/auth.ts`, `src/lib/cookies.ts` — how auth tokens are parsed and stored in cookies. Cookie names: `access_token`, `refresh_token`.
- `src/components/` — UI primitives in `components/ui/` and feature components in `components/commerce/` and `components/layout/`.

Architecture and patterns
- App Router: the app is organized under `src/app/` with nested route folders (e.g. `account/`, `api/`, `products/[slug]/`). Update routes by editing the corresponding folder's `page.tsx`, `loading.tsx`, or `route.ts` files.
- Server vs Client: server-only APIs use Next server features (e.g. `cookies()` from `next/headers`) — those files run on the server. Components under `components/ui` are UI primitives and are intended to remain framework-agnostic; prefer editing or extending them there.
- API proxy & backend: frontend code uses `fetchBackend(path, init)` which prefixes requests with `NEXT_PUBLIC_API_BASE`. That env var is required at runtime — `src/lib/backend.ts` throws if missing.
- Auth flow: responses with tokens are parsed by `resolveAuthTokens` in `src/lib/auth.ts`. Use `setAuthCookies`/`getAuthCookies` in `src/lib/cookies.ts` for cookie operations. Token keys accepted: `accessToken` or `token`, and `refreshToken`.

Developer workflows & helpful commands
- Local dev: `npm run dev` (uses Turbopack). If you need classic webpack, adjust scripts in `package.json`.
- Build: `npm run build`; Start production server with `npm start`.
- Lint: `npm run lint` (ESLint configured). Run these before a PR.

Conventions to follow
- File naming: kebab-case for component files (e.g. `site-header.tsx`).
- UI primitives live in `src/components/ui/` — reuse these for styling and interactions.
- Keep data fetching logic in `src/lib/` (e.g. `backend.ts`, `auth.ts`) rather than embedding fetch calls widely.

Integration points & external dependencies
- External API base: runtime is provided by `NEXT_PUBLIC_API_BASE`. Changing API routes usually means adding a new `app/api/..` route or updating `fetchBackend` usage.
- Image hosting: `next.config.ts` allows `images.unsplash.com` — add other remote hosts there if needed.
- Main dependencies: Next 15, React 19, Tailwind v4, many Radix UI primitives and `sonner` for toasts.

Examples (where to change/inspect behavior)
- To add a server-side auth check, inspect or update `src/lib/cookies.ts` (cookie names & expiry) and the API routes under `src/app/api/auth/`.
- To change how the front end calls the backend, update `src/lib/backend.ts` to modify headers, auth injection, or error handling.
- To change layout or add global providers, edit `src/app/layout.tsx` — global fonts, header/footer and `Toaster` are wired here.

Notes for automated edits
- Preserve `NEXT_PUBLIC_API_BASE` usage and cookie names (`access_token`, `refresh_token`) unless migrating the whole auth system.
- Prefer updating or adding helpers in `src/lib/` over mass-editing components.

If anything above is unclear or you want a slightly different focus (tests, CI, or deployment rules), tell me which area to expand and I will iterate.
