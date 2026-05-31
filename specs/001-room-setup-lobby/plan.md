# Implementation Plan: Room Setup & Lobby

**Branch**: `001-room-setup-lobby` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-room-setup-lobby/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Extend the existing room system to support host tracking, join validation with
clear error messages, automatic lobby polling, and host-only game start. The
starter already has room creation, joining, and state fetching — this feature
adds the missing enforcement and UX polish required by Scenario 1.

## Technical Context

**Language/Version**: TypeScript 5.6+ (backend + frontend), Node.js 18+

**Primary Dependencies**: Express 4 (backend), React 18 + React Router 6 (frontend), Zod 3 (validation), Vitest (testing)

**Storage**: In-memory Map in `backend/src/services/roomStore.ts` — no database

**Testing**: Vitest (both `backend` and `frontend` directories)

**Target Platform**: Modern browser (multi-tab) + Node.js HTTP server

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Lobby poll every 2s on fixed interval; room create/join
respond within 500ms; error responses within 200ms

**Constraints**: No WebSockets, no databases, no auth, no new state management
libraries, in-memory only

**Scale/Scope**: Lab — 2–3 simultaneous browser tabs, single process

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. TypeScript-First & Type Safety | All new code fully typed; Zod schemas for all request payloads | ✅ PASS |
| II. HTTP Polling, No Real-Time Sync | Lobby uses fixed-interval 2s HTTP polling; no WebSockets | ✅ PASS |
| III. In-Memory State, No Persistence | Room state held in Memory Map; no database | ✅ PASS |
| IV. Specification-First Development | Implementation follows spec.md; acceptance criteria verified | ✅ PASS |
| V. Deterministic Game Logic & Self-Review | Host assignment, name uniqueness enforced server-side; AI output reviewed | ✅ PASS |
| Additional Constraints | No auth, no new libraries, no unrelated refactors | ✅ PASS |
| Workflow & Quality Gates | Granular commits, build passes, tests pass, two-browser validation | ✅ PASS |

**No violations.** No complexity justification required.

## Project Structure

### Documentation (this feature)

```text
specs/001-room-setup-lobby/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification with clarifications
├── research.md          # Phase 0 output — starter code analysis
├── data-model.md        # Phase 1 output — extended entity model
├── quickstart.md        # Phase 1 output — setup + verification steps
├── contracts/           # Phase 1 output — API endpoint contracts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── game.ts          # Room, Participant, RoomSnapshot types (extend)
│   ├── services/
│   │   └── roomStore.ts     # Room CRUD (add host logic, validation, startGame)
│   ├── api/
│   │   ├── router.ts        # Centralized error handler
│   │   ├── rooms.ts         # Route handlers (add start endpoint)
│   │   └── schemas.ts       # Zod schemas (add validation)
│   └── seed/
│       └── starterData.ts   # Word list, role list
└── tests/
    └── services/
        └── roomStore.test.ts # Backend unit tests

frontend/
├── src/
│   ├── components/
│   │   ├── AppShell.tsx
│   │   └── RoomCodeBadge.tsx
│   ├── pages/
│   │   ├── StartPage.tsx
│   │   ├── CreateRoomPage.tsx
│   │   ├── JoinRoomPage.tsx
│   │   └── LobbyPage.tsx        # Add polling, host-only start button
│   ├── state/
│   │   └── roomStore.ts         # Add startGame action, polling support
│   └── services/
│       └── api.ts               # Add startGame endpoint call
└── tests/
    └── services/
        └── api.test.ts          # Frontend API tests
```

**Structure Decision**: Option 2 — Web application (frontend + backend). The
existing directory layout maps directly to the starter codebase. No structural
changes needed.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations. Complexity tracking section intentionally left blank.*
