<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent team

This project uses the `team` plugin's agent team. Active roles: `front`, `back`, `designer` and `reviewer`. There's no `database` or `ai`: the project has no database and no LLM calls.

- The lead creates each teammate from the `agent` of its role in `.claude/team.json`, and **must load the `team:lead` skill** before creating the team.
- Each role only edits the files in its `owns`. `designer` proposes token changes and `front` applies them in `src/app/globals.css`.
- Per-role addenda: `docs/agents/front.md` and `docs/agents/back.md`.
- Changes go through `/team:run <change>` (or the `team:lead` skill), which sizes them first (S, M or L) so small changes don't create a team.
- Quality gate on every closed task (`gate.checks`): `npx next typegen && npx tsc --noEmit --incremental` and `npx eslint --cache --max-warnings=0` on the changed files only, plus an automatic review for tasks of 40+ changed lines (`gate.review`, `gate.reviewMinLines`).
- Whole-project checks (`gate.final`): `npm run build` and `npm test`, run once by `reviewer` when the change closes.
