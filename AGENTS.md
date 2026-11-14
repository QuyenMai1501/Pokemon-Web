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

- **`params`/`searchParams` must be `await`ed** — synchronous access is removed. Codebase already follows this everywhere.
- **`middleware.ts` deprecated** — use `proxy.ts` with a `proxy` export instead. File exists at root (not yet activated).
- **Turbopack** is the default build tool.
- **`next lint` removed** — ESLint invoked directly; typecheck is separate.

## Architecture

- **Auth**: NextAuth v5 beta, credentials-only, JWT sessions. Exports from `auth.ts`: `{ handlers, signIn, signOut, auth }`. Route handler at `app/api/auth/[...nextauth]/route.ts`. Sign-in page at `/auth/signin`. Homepage (`/`) redirects unauthenticated users to sign-in.
- **DB**: Prisma 7 + MariaDB via `@prisma/adapter-mariadb`. Config in `prisma.config.ts` (Prisma 7 uses this instead of `datasource` block in schema). Singleton client in `lib/db.ts`. Connection URL from `DATABASE_URL` env var.
- **External API**: PokéAPI v2 via `lib/pokeApi.ts`. Revalidate values vary: pokemon detail/abilities/items = 86400; species/evolution/moves/type relations = 3600; `getPokemonList` uncached. Server components use React `cache()` wrappers (`getPokemonDetailCached`, `getAbilityDetailCached`).
- **Battle state**: In-memory (`Map<string, BattleState>` in `lib/battle.ts`), not persisted. Both teams at level 50; AI team = 3 random mons from first 151, moves auto-chosen from level-up learnset ≤ 50.
- **Styling**: CSS Modules only (`*.module.css`), global CSS vars in `app/globals.css`. **No Tailwind** — `tailwindcss` is only a transitive dep in the lockfile.
- **Translations**: Vietnamese UI. PokéAPI Vietnamese entries used when available, otherwise English fallback. **Items have no Vietnamese data** — always English.
- **Image domains**: `raw.githubusercontent.com`, `pokeapi.co`, `*.githubusercontent.com` (in `next.config.ts`).
- **Path alias**: `@/*` → project root.
- **`types/index.ts`** augments NextAuth `Session` with `user.id`.
- **`proxy.ts`** is a middleware helper for Next.js 16 (not yet activated).
- **Password registration**: min 8 chars, must include uppercase + lowercase + digit + special char.
- **Max 4 teams** per user (enforced in `/api/team-builder` POST).
- **`crypto.randomUUID()`** used for IDs (battle, etc.).
- **Concurrency=15** pattern used in `/api/pokedex/batch` and `/api/items/list`. `/api/pokedex/abilities/batch` does **not** limit concurrency (fires `Promise.allSettled` over all URLs at once).

## API routes

| Route | Method | Purpose | Auth |
| ----- | ------ | ------- | ---- |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler | — |
| `/api/register` | POST | User registration | No |
| `/api/test-db` | GET | DB connection healthcheck | No |
| `/api/pokedex/batch` | POST | Batch fetch Pokemon details (concurrency 15) | No |
| `/api/pokedex/abilities/batch` | POST | Batch fetch ability descriptions (prefers Vietnamese) | No |
| `/api/items/list` | GET | List battle-relevant items from PokéAPI (concurrency 15) | No |
| `/api/team-builder` | GET | List user teams | Yes |
| `/api/team-builder` | POST | Create team (max 4 per user) | Yes |
| `/api/team-builder/[id]` | PUT | Update team (deletes + recreates PokemonInstances) | Yes |
| `/api/team-builder/[id]` | DELETE | Delete team | Yes |
| `/api/battle` | POST | Start battle (builds player + AI team) | Yes |
| `/api/battle/[id]` | POST | Execute turn (in-memory state) | Yes |

## Stubbed areas (implement before use)

- `components/pokemon/PokemonCard.tsx` (empty, unused)
- `components/pokemon/PokemonDetail.tsx` (empty, unused — the real detail UI is the server component page `app/pokedex/[id]/page.tsx`)
- `lib/socket.ts` (empty)

## List loading strategies

### Pokédex grid (`app/pokedex/page.tsx`)
- Infinite scroll via IntersectionObserver, `PAGE_SIZE = 40`
- Data: Client → POST `/api/pokedex/batch` → server fetches from PokeAPI with `CONCURRENCY = 15`
- Search filters `allPokemon` locally by name/id; fetches details only for matching IDs via `effectiveIds`
- Gen selector + type filter + debounced search (150ms)

### Moves list (`components/pokemon/MovesList.tsx`)
- "Xem thêm" button, batch size 10, sequential fetches within batch
- **Optimization needed**: fetch moves in parallel within each batch

### Items list (`app/items/page.tsx`)
- Page load → GET `/api/items/list` → server fetches 16 battle-relevant categories (`held-items`, `choice`, `type-enhancement`, `plates`, `species-specific`, `in-a-pinch`, `bad-held-items`, `training`, `jewels`, `effort-training`, `type-protection`, `mega-stones`, `z-crystals`, `memories`, `nature-mints`, `stat-boosts`) with `CONCURRENCY = 15`
- Dedup via `Set` on item URLs (items can appear in multiple categories, e.g. `roseli-berry`)
- **Sprite fallback**: when `sprites.default` is null, tries `gen9/{name}.png` then `gen8/{name}.png` in the PokeAPI sprites repo via HEAD check. `nature-mints` have no sprite anywhere → show "?"
- Local search + category filter

## Stack

Next.js 16 App Router · React 19 · TypeScript 5 · Prisma 7 + MariaDB · NextAuth 5 beta (@auth/prisma-adapter) · bcryptjs · lucide-react

**Unused deps** (in `package.json` but not imported anywhere): SWR, axios, zustand, socket.io, socket.io-client
