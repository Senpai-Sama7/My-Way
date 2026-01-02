# Project Context

## Project Overview
A modern, production-ready web application scaffold powered by cutting-edge technologies, designed to accelerate development with AI-powered personalized learning. The application provides a robust foundation for building learning platforms with features like conversational learning, PDF analysis, quiz generation, and personalized content creation.

## Architecture
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript 5
- **Styling**: Tailwind CSS 4, shadcn/ui components, Framer Motion for animations
- **Backend**: Next.js API routes, Prisma ORM for database operations
- **Database**: SQLite (via Prisma) with support for other databases via DATABASE_URL
- **State Management**: Zustand for client state, TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Authentication**: NextAuth.js for secure authentication flows
- **AI Integration**: Flexible AI client supporting Ollama, OpenAI, Gemini, and OpenRouter
- **Testing**: Playwright for end-to-end tests
- **Build Tool**: Bun for package management and development workflows
- **Deployment**: Standalone output for containerized deployments

## Conventions
- **Language**: TypeScript + React (default for all new code)
- **Indentation**: 2 spaces
- **File Naming**: kebab-case for files (e.g., `learning-view.tsx`), PascalCase for React components
- **JSX/Tailwind**: Keep classes readable, break long lines appropriately
- **Linting**: ESLint configured with `next/core-web-vitals` + TypeScript rules
- **Commits**: Conventional Commits format (`feat(scope): ...`, `fix: ...`, `chore: ...`, etc.)
- **Testing**: E2E tests in `e2e/` directory with `.spec.ts` extension
- **Environment**: Never commit secrets; use `.env.local` for local configuration

## Common Commands
- `bun install`: Install all dependencies
- `bun run dev`: Start development server on port 3000 (logs to dev.log)
- `bun run build`: Create production build with standalone output
- `bun start`: Run production server from standalone build
- `bun run lint`: Run ESLint checks
- `bun run test:e2e`: Execute Playwright E2E tests (requires system browser)
- `bun run db:push`: Push Prisma schema changes to database
- `bun run db:migrate`: Create and apply database migrations
- `bun run db:generate`: Generate Prisma client from schema
- `bun run db:reset`: Reset database and reapply all migrations