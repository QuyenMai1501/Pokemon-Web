<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

| Command                  | What                                           |
| ------------------------ | ---------------------------------------------- |
| `npm run dev`            | Dev server                                     |
| `npm run build`          | Production build (Turbopack default)           |
| `npm run start`          | Start production server                        |
| `npm run lint`           | ESLint only — run `npx tsc --noEmit` separately for typecheck |

## Next.js 16 quirks

- **`params`/`searchParams` must be `await`ed** — synchronous access is removed. Codebase already follows this.
- **`middleware.ts` deprecated** — use `proxy.ts` with a `proxy` export instead. This file already exists at root (not yet activated).
- **Turbopack** is the default build tool.
- **`next lint` removed** — ESLint is invoked directly; typecheck is separate.

## List loading strategies

### Pokédex grid (`app/pokedex/page.tsx`)
- **Mechanism**: Infinite scroll via IntersectionObserver
- **Page size**: `PAGE_SIZE = 40` (initial load + scroll increment)
- **Data**: Client → POST `/api/pokedex/batch` → server fetches from PokeAPI with `CONCURRENCY = 15`
- **Search**: Filters `allPokemon` array locally by name/id instantly → only fetches details for matching IDs via `effectiveIds` — avoids 150+ PokeAPI calls
- **Optimizations applied**: concurrency limiter (15), local search filter, PAGE_SIZE=40, cache TTL=86400

### Moves list (`components/pokemon/MovesList.tsx`)
- **Mechanism**: "Xem thêm" button, incremental batch
- **Batch size**: `BATCH_SIZE = 10`
- **Data**: Client → `getMoveDetail(url)` direct to PokeAPI (sequential within batch)
- **Optimization needed**: fetch moves in parallel within each batch

## Key conventions

- **Path alias**: `@/*` → project root.
- **Auth**: NextAuth v5 beta, credentials-only, JWT sessions. Exports from `auth.ts`: `{ handlers, signIn, signOut, auth }`. Route handler at `app/api/auth/[...nextauth]/route.ts`.
- **DB**: Prisma 7 + MariaDB adapter. Schema at `prisma/schema.prisma`. Connection URL from `DATABASE_URL` env var. Singleton client in `lib/db.ts`.
- **External API**: PokéAPI v2 via `lib/pokeApi.ts`. Uses `next: { revalidate: 86400 }` for fetch caching.
- **Translations**: Vietnamese UI. PokéAPI Vietnamese entries used when available, otherwise English fallback.
- **Styling**: Tailwind v4 — `@import "tailwindcss"` in `globals.css`, `@theme inline` for design tokens.
- **Implemented API routes**: `app/api/register` (signup), `app/api/test-db` (healthcheck), `app/api/pokedex/batch` (batch detail fetch), `app/api/pokedex/abilities/batch`.
- **Stubbed areas** (implement before use):
  - API routes: `app/api/battle/`, `app/api/team-builder/`
  - Components: `components/pokemon/PokemonCard.tsx`, `components/pokemon/PokemonDetail.tsx`
  - `lib/socket.ts`
- `proxy.ts` is a middleware helper for Next.js 16 (already uses correct name/export).
- `types/index.ts` augments NextAuth `Session` with `user.id`.

## Stack

Next.js 16 App Router · React 19 · TypeScript 5 · Tailwind v4 · Prisma 7 + MariaDB · NextAuth 5 beta · Socket.IO · SWR · Zustand · axios · bcryptjs · lucide-react
