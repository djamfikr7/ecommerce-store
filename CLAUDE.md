<!-- GSD:project-start source:.planning/PROJECT.md -->
## Project

**E-Commerce Web Store** — Full-featured e-commerce platform (~10K products) with dark gradient neomorphic design, 3D animated buttons, social media automation, and multi-currency localization.

**Stack:** Next.js 15 + React 19 + TypeScript + Tailwind CSS + Framer Motion + @react-three/fiber + Prisma + PostgreSQL + Stripe + Next-Auth + Vitest + Playwright

**VoltAgent:** This project uses VoltAgent multi-agent infrastructure (awesome-codex-subagents). See `.planning/VoltAgent_REGISTRY.md` for active subagents.
<!-- GSD:project-end -->

<!-- GSD:workflow-start -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.

**VoltAgent Integration:** When working on a phase, use the VoltAgent subagent registry (`.planning/VoltAgent_REGISTRY.md`) to determine which specialized subagents to spawn. Use the multi-agent-coordinator pattern for complex phases.
<!-- GSD:workflow-end -->

<!-- GSD:phase-start -->
## Current Phase

**Phase 1: Foundation & Infrastructure** — In Progress (Multi-Agent Execution)
See `.planning/phases/01-foundation-infrastructure/PLAN.md`
<!-- GSD:phase-end -->
