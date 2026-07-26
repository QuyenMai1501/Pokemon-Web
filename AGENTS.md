<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

| Command                  | What                                           |
| ------------------------ | ---------------------------------------------- |
| `npm run dev`            | Dev server                                     |
| `npm run build`          | Production build                               |
| `npm run start`          | Start production server                        |
| `npm run lint`           | ESLint only — run `npx tsc --noEmit` separately for typecheck |

## Key conventions

- **Path alias**: `@/*` → project root (e.g. `@/components/...`, `@/lib/...`)
- **Auth**: NextAuth v5 beta, credentials-only, JWT sessions. Exports from `auth.ts`: `{ handlers, signIn, signOut, auth }`. Route handler at `app/api/auth/[...nextauth]/route.ts`.
- **DB**: Prisma 7 + MariaDB adapter (`@prisma/adapter-mariadb`). Schema at `prisma/schema.prisma`. Connection URL from `DATABASE_URL` env var. Initialize via `lib/db.ts` (singleton pattern).
- **External API**: PokéAPI v2 via `lib/pokeApi.ts`. Uses `next: { revalidate: 3600 }` for fetch caching.
- **UI language**: Vietnamese.
- **Styling**: Tailwind v4 — `@import "tailwindcss"` in `globals.css`, `@theme inline` for design tokens.
- **Stubbed areas** (implement before use):
  - API routes: `app/api/battle/`, `app/api/pokedex/`, `app/api/team-builder/`
  - Components: `components/pokemon/PokemonCard.tsx`, `components/pokemon/PokemonDetail.tsx`
  - `lib/socket.ts`, `types/index.ts`
- `proxy.ts` is a middleware helper; to activate, rename to `middleware.ts` at project root.

## Stack

Next.js 16 App Router · React 19 · TypeScript 5 · Tailwind v4 · Prisma 7 + MariaDB · NextAuth 5 beta · Socket.IO · SWR · Zustand · axios · bcryptjs · lucide-react
