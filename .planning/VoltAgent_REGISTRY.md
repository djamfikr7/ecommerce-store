# VoltAgent Subagent Registry

This project uses VoltAgent multi-agent infrastructure for coordinated development.

## Agent Source
Reference: `https://github.com/VoltAgent/awesome-codex-subagents`

## Active Subagents (Phase 1)

| Agent | TOML Definition | Domain | Model | Sandbox |
|-------|----------------|--------|-------|---------|
| multi-agent-coordinator | multi-agent-coordinator.toml | Delegation planning, parallel execution design | gpt-5.4 | read-only |
| fullstack-developer | fullstack-developer.toml | Next.js scaffold, configs, project structure | gpt-5.4 | workspace-write |
| frontend-developer | frontend-developer.toml | Design system, UI components, responsive layout | gpt-5.4 | workspace-write |
| backend-developer | backend-developer.toml | Prisma schema, database models, business logic | gpt-5.4 | workspace-write |
| devops-engineer | devops-engineer.toml | GitHub Actions CI/CD, deployment pipelines | gpt-5.4 | workspace-write |
| tooling-engineer | tooling-engineer.toml | Vitest, Playwright, TDD infrastructure | gpt-5.3 | workspace-write |
| reviewer | reviewer.toml | Code review, quality gates | gpt-5.4 | read-only |

## Phase 2+ Subagents (Reserved)

| Agent | Purpose | Phase |
|-------|---------|-------|
| auth-specialist | NextAuth setup, OAuth flows, MFA | Phase 2 |
| api-designer | tRPC API contracts, endpoints | Phase 2-4 |
| security-auditor | Security review, vulnerability scanning | Phase 2 |
| react-specialist | Complex React patterns, state management | Phase 3+ |
| payment-engineer | Stripe integration, webhooks | Phase 4 |
| email-developer | Notification templates, email service | Phase 5 |
| reviewer | Code review, quality gates | All phases |
| performance-engineer | Performance optimization | Phase 11 |

## Coordination Pattern

```
multi-agent-coordinator (planning)
    │
    ├── fullstack-developer (scaffold)
    ├── frontend-developer (design system)
    ├── backend-developer (schema)
    ├── devops-engineer (CI/CD)
    └── tooling-engineer (testing)
            │
            └── reviewer (quality gate)
                    │
                    └── knowledge-synthesizer (integration)
```

## Agent Execution Rules

1. Each agent owns a disjoint write scope — no file conflicts
2. Read-only agents (reviewer, coordinator) don't modify source
3. All agents report completion with output summary
4. knowledge-synthesizer merges findings before integration
5. Agent-installer handles adding new agents from repo

## Agent Prompt Template

Each subagent prompt follows this structure (from TOML):
- **Working mode**: Step-by-step execution approach
- **Focus on**: Domain-specific priorities
- **Quality checks**: Validation criteria
- **Return**: Output contract
- **Do not**: Explicit scope-limiting disclaimer

---

*Registry managed by multi-agent-coordinator*
