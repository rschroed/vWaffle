# vWaffle

vWaffle is a playful lunch-and-learn demo app for showing how Codex can help scaffold a prototype, keep the architecture tidy, and round-trip with Figma without turning a tiny idea into a giant project.

## Stack

- Vite + React + TypeScript
- `waffleRepository` seam with mock and hosted adapters
- Vercel Function + Postgres-backed shared feed for deployed environments
- Vitest + Testing Library
- Vercel-ready static deployment

## Quick start

```bash
npm install
npm run dev
```

Then open the local URL from Vite. Run checks with:

```bash
npm run lint
npm run test:run
npm run build
```

## Codex workflow

- Repo skill: `.codex/skills/vwaffle-demo/SKILL.md`
- Figma workflow: use the bundled `figma` and `figma-use` skills to keep a single primary screen in sync with the app
- Vercel workflow: use the Vercel plugin when available; otherwise rely on `vercel.json` plus the normal Vercel project import flow
- GitHub workflow: keep issues, labels, and the project board intentionally light so the demo stays fun

Figma source:
[vWaffle Demo screen](https://www.figma.com/design/AwFfD4RhxBCjE8OwR2htej/vWaffle-Demo?node-id=5-3)

## Project shape

- `src/domain/waffles.ts`: domain contract and seeded waffles
- `src/lib/waffleRepository.ts`: repository interface plus mock/API-backed implementations
- `src/features/home/*`: page sections for hero, composer, and feed
- `src/ui/*`: reusable design-system-ready primitives
- `docs/demo-runbook.md`: happy-path walkthrough for the lunch-and-learn
- `docs/product-vision.md`: narrative product vision for `vvaffle`
- `api/waffles.ts`: Vercel Function for the shared persisted feed

## Figma and environment setup

Copy `.env.example` to `.env.local` if you want to change the tagline or wire in the Figma source file:

```bash
cp .env.example .env.local
```

The included `.env.example` already points to the starter Figma file. Override `VITE_FIGMA_FILE_URL` if you want the hero button to point somewhere else.

## Shared persistence

The app now supports a real shared feed through a small Vercel Function backed by Postgres.

- Local development defaults to the mock repository so `npm run dev` still works without backend setup.
- Deployed environments default to the hosted API repository.
- To force a mode locally:
  - `VITE_WAFFLE_REPOSITORY=mock`
  - `VITE_WAFFLE_REPOSITORY=api`

### Database setup

Set `DATABASE_URL` in Vercel to any lightweight Postgres instance you want to use for the shared feed. A managed Vercel Marketplace Postgres provider such as Neon is a good fit.

The API function creates the single `waffles` table automatically on first request using this flat shape:

- `id`
- `sender_name`
- `recipient_name`
- `flavor`
- `message`
- `created_at`

For local API testing against a real database, provide `DATABASE_URL` and either run through Vercel dev tooling or point `VITE_WAFFLE_API_BASE_URL` at a deployed environment.

## Vercel

The repo includes `vercel.json` for a minimal static deployment. Import the GitHub repo into Vercel, keep the default Vite build settings, and use preview deploys for demo branches.

## PR convention

Keep PRs small, include one sentence about the story you are improving, and attach either a screenshot or the matching Figma node/file when the UI changes.
