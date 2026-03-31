# vWaffle Demo Runbook

## Happy path

1. Start the app with `npm install` and `npm run dev`.
2. Show the repo-local Codex skill in `.codex/skills/vwaffle-demo/SKILL.md`.
3. Open the Figma source from the hero link. The starter file lives at `https://www.figma.com/design/AwFfD4RhxBCjE8OwR2htej/vWaffle-Demo?node-id=5-3`.
4. Send a new waffle and call out the repository seam that keeps future backend work isolated.
5. Mention the Vercel config, preview-deploy story, and the lightweight GitHub issues/board.

## Story beats

- Prototype-friendly architecture: one screen, one repository interface, minimal moving parts.
- Design round-trip: the UI is intentionally small enough to mirror in Figma and polish back into code.
- Team fun: the seed data and writing tone make the demo feel playful instead of generic.

## Manual acceptance checks

- The layout feels intentional on desktop and mobile widths.
- The feed shows seeded waffles on first load.
- Sending a waffle adds it to the top of the feed.
- The Figma source link opens the matching screen.
- `npm run build` passes before sharing a preview deploy.
