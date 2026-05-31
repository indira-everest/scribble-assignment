<!--
  Sync Impact Report
  Version change: (template) → 1.0.0
  Modified principles: N/A (all new — first fill-in from template)
  Added sections: Core Principles I–V, Additional Constraints, Development Workflow & Quality Gates, Governance
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md       ✅ generic, no principle name changes needed
    - .specify/templates/spec-template.md        ✅ no constitution references
    - .specify/templates/tasks-template.md       ✅ no constitution references
    - .specify/templates/checklist-template.md   ✅ no constitution references
    - .specify/templates/constitution-template.md ⚠ source template — only used for initial creation
    - AGENTS.md                                  ✅ principles already aligned
    - README.md                                  ✅ principles already aligned
  Follow-up TODOs: None — all placeholders resolved.
-->

# Scribble Constitution

## Core Principles

### I. TypeScript-First & Type Safety

Every module MUST be fully typed. Avoid `any`; use `unknown` for
dynamically-typed values. All request payloads and responses MUST be
validated with Zod schemas. Prefer immutable data structures and pure
functions. Use functional React components with strict hooks.

### II. HTTP Polling, No Real-Time Sync

All client-server synchronisation MUST use HTTP polling. WebSockets,
Socket.io, and any real-time push protocol are strictly forbidden.
Lobby state MUST poll at approximately 2-second intervals. Game state
(endpoints for guesses, scores, results) MUST be fetched via periodic
GET requests.

### III. In-Memory State, No Persistence

All game state MUST be held in memory only. No database (SQL, NoSQL,
SQLite, or similar) is permitted. Inactive rooms MUST be explicitly
removed to keep the memory footprint minimal. Restarting the backend
clears all state — this is by design.

### IV. Specification-First Development

MUST follow the Spec Kit loop: Discovery → Specify → Clarify → Plan →
Tasks → Implement → Validate. Acceptance criteria MUST be defined
before implementation begins. Every feature MUST be independently
testable. The constitution, spec, plan, and tasks MUST be kept
internally consistent and traceable to the implementation.

### V. Critical Self-Review & Deterministic Game Logic

AI-generated output MUST be critically reviewed before committing.
Do not commit code you do not fully understand. Game rules MUST be
deterministic: secret word selection, scoring (100 points for a correct
guess, 0 otherwise), and case-insensitive guess comparison. Empty or
whitespace-only inputs MUST be rejected. The host MUST be tracked and
host-only actions (start game, restart) MUST be enforced server-side.

## Additional Constraints

- No authentication, sessions, JWT, or OAuth
- No new state-management or routing libraries beyond what the starter ships
- No multiple rounds, drawer rotation, timers, countdowns, or speed bonuses
- No custom or random word packs beyond the starter seed list
- No spectator mode, moderation features (kick, mute), or room passwords
- No rewriting the starter from scratch
- No unjustified top-level dependencies
- No unrelated refactors — changes MUST be scoped to the feature under work

## Development Workflow & Quality Gates

- Commits MUST be granular, meaningful, and traceable to the spec
- Build validation MUST pass: both `backend` and `frontend` MUST compile without errors
- Tests MUST pass (`vitest run` in each directory) before a feature is considered complete
- Each user story in the spec MUST be independently demonstrable
- Verify acceptance criteria using two browser tabs before marking a scenario complete
- Complexity that violates the simplicity principle MUST be justified in the plan

## Governance

This constitution supersedes all ad-hoc development practices. Amendments
MUST be documented by updating this file alongside the change that
motivated them. Versioning follows semantic rules: MAJOR for backward-
incompatible principle changes or removals, MINOR for new principles or
sections, PATCH for clarifications and non-semantic refinements.
Compliance is verified during implementation reviews.

**Version**: 1.0.0 | **Ratified**: 2026-05-18 | **Last Amended**: 2026-05-31
