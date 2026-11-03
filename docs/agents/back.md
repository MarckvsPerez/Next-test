# Back: team-playground addendum

Rules for this repo. They override the generic ones in `team:back`.

## Stack and scope

- Next.js 16.4.4 (App Router), TypeScript strict. There's no database and no external services: data lives in memory or in static files unless the spec says otherwise.
- Before using any Next API, read the relevant guide in `node_modules/next/dist/docs/01-app/` (Route Handlers: `01-getting-started/15-route-handlers.md`).

## Where things go

- Route Handlers: `src/app/api/<route>/route.ts`. Always `.ts`, never `.tsx`: front owns `src/app/*.tsx`, and a `.tsx` under `api/` would have two owners.
- Server logic, data access and Server Actions: `src/server/`. Every file that's only used on the server starts with `import "server-only"` if the package is installed. If it isn't, ask `front` to add it (front owns `package.json`).
- Server Actions go in their own files with `"use server"` at the top (for example `src/server/actions/<domain>.ts`), never inline inside pages.

## Next 16 rules

- `cacheComponents` is active: `GET` Route Handlers prerender like pages. If a handler reads the request or data that changes, make it dynamic as the guide explains. Cache with `use cache` plus `cacheLife`, never with `export const revalidate`.
- Type the context with the global helper `RouteContext<'/api/...'>` and `await ctx.params`.
- Validate all external input (body, query, params) at the edge of the handler and answer 400 with a clear message. Never return internal stack traces.

## Quality

- Before closing a task: `npx next typegen && npx tsc --noEmit && npm run lint`.
- There's no test runner yet. If you add logic in `src/server/`, write it as pure functions so it can be tested once Vitest exists.
