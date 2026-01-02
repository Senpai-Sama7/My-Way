# Repository Guidelines

This repository is a Next.js 15 + TypeScript scaffold with Tailwind CSS, shadcn/ui, Prisma, and Playwright. Use `bun` for local workflows.

## Project Structure & Module Organization
- `src/app/`: Next.js App Router routes, layouts, and pages.
- `src/components/`: Reusable React components; `src/components/ui/` holds shadcn/ui primitives.
- `src/hooks/`: Custom React hooks.
- `src/lib/`: Shared utilities, API clients, and configuration helpers.
- `public/`: Static assets served at the site root.
- `prisma/`: Database schema and Prisma tooling.
- `e2e/`: Playwright end-to-end tests (`*.spec.ts`).

## Architecture Overview
- App Router pages and layouts live in `src/app/` (see `src/app/layout.tsx`).
- API routes live in `src/app/api/` and call `src/lib/zai.ts` for LLM-backed generation.
- Persistence uses Prisma (`prisma/schema.prisma`) with `DATABASE_URL` in env; `public/` serves static files.

## Build, Test, and Development Commands
- `bun install`: Install dependencies.
- `bun run dev`: Start the dev server on port 3000 (logs to `dev.log`).
- `bun run build`: Production build; bundles the standalone output.
- `bun start`: Run the production server from the standalone build.
- `bun run lint`: Run Next.js/ESLint checks.
- `bun run test:e2e`: Execute Playwright E2E tests (expects a system browser).
- `bun run db:push` / `bun run db:migrate` / `bun run db:generate`: Prisma workflow for schema sync, migrations, and client generation.

## Coding Style & Naming Conventions
- TypeScript + React are the default; follow existing patterns in `src/`.
- Indentation is 2 spaces; keep JSX and Tailwind classes readable.
- File names are `kebab-case` (e.g., `learning-view.tsx`); React components are `PascalCase`.
- ESLint is configured but permissive (`next/core-web-vitals` + TS). Run `bun run lint` before PRs.

## Testing Guidelines
- E2E tests live in `e2e/` and use Playwright; name files `*.spec.ts`.
- Prefer adding E2E coverage for new user flows or API integrations.
- Test artifacts are written to `test-results/` during local runs.

## Commit & Pull Request Guidelines
- This checkout has no Git history, so no repo-specific convention is detectable. Use Conventional Commits: `feat(scope): ...`, `fix: ...`, `chore: ...`, `docs: ...`, `refactor: ...`, `test: ...`.
- PRs should include a clear summary, test commands run, and UI screenshots for visual changes. Link related issues and note any environment or schema changes.

## Configuration & Security Tips
- Local LLM settings live in `.env.local` (e.g., `LLM_BASE_URL`, `LLM_MODEL`, `LLM_API_KEY`). Never commit secrets.
- The `/api/tts` route expects `espeak-ng` on the host; document alternatives if you swap TTS backends.
