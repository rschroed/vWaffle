---
name: vwaffle-demo
description: Use when working in the vWaffle prototype repo. Applies the lunch-and-learn guardrails: keep the stack lightweight, preserve the playful voice, prefer the repository seam over premature backend work, use Figma for a single-screen round-trip, and keep GitHub/Vercel workflows intentionally light.
---

# vWaffle Demo

This repo is a prototype for demonstrating agentic coding and design, not a production system.

## Core rules

1. Keep changes small, visible, and demo-friendly.
2. Preserve the playful product voice. This app should feel charming, not corporate.
3. Prefer extending the existing `waffleRepository` seam over introducing new infrastructure.
4. When design changes are involved, keep the Figma scope to one primary screen plus a tiny reusable component set.
5. Keep GitHub and Vercel workflows lightweight enough to explain live in a lunch-and-learn.

## Architecture defaults

- Frontend: Vite + React + TypeScript
- Data: mock repository first, backend later
- Scope: single-screen experience with a composer and a feed
- Auth: out of scope unless the user explicitly asks for it
- Performance/scalability: not a priority for this prototype

## Figma workflow

When a task touches design:

1. Use the bundled `figma` skill for design context and screenshots.
2. Use `figma-use` before any Figma write operation.
3. Keep the Figma file aligned to the shipped app instead of designing future states.
4. Prefer one polish pass back from Figma into code over inventing a large design system.

## Shipping workflow

- Run `npm run lint`, `npm run test:run`, and `npm run build` before calling a slice done.
- For deploys, prefer the Vercel plugin when available; otherwise rely on the minimal `vercel.json` flow.
- For GitHub management, favor a few starter issues, labels, and a simple board over heavy process.
