---

description: "Implementation tasks for Game Start & Drawer Flow"

---

# Tasks: Game Start & Drawer Flow

**Branch**: `002-game-start-drawer-flow` | **Date**: 2026-05-31

**Input**: Design documents from `specs/002-game-start-drawer-flow/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rooms-api.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`

---

## Phase 1: Setup (Codebase Analysis)

**Purpose**: Read existing code to understand current state before making changes

- [ ] T001 [P] Read backend/src/models/game.ts — identify current Room/RoomSnapshot fields
- [ ] T002 [P] Read backend/src/services/roomStore.ts — identify current createRoom/joinRoom/startGame/toRoomSnapshot logic
- [ ] T003 [P] Read backend/src/api/schemas.ts — identify current Zod schemas
- [ ] T004 [P] Read backend/src/api/rooms.ts — identify current route handlers
- [ ] T005 [P] Read frontend/src/services/api.ts — identify current RoomSnapshot type
- [ ] T006 [P] Read frontend/src/state/roomStore.ts — identify current store actions
- [ ] T007 [P] Read frontend/src/pages/LobbyPage.tsx — identify current lobby UI
- [ ] T008 [P] Read frontend/src/App.tsx — identify current routes

---

## Phase 2: Foundational (Model Changes)

**Purpose**: Core type/model changes that US1, US2, and US3 all depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T009 [P] Add `roundNumber: number`, `drawerId: string`, `secretWord: string`, `orderedWords: string[]` to Room interface in `backend/src/models/game.ts`
- [ ] T010 [P] Add `drawerId: string | null`, `secretWord: string | null`, `orderedWords: string[]` to RoomSnapshot interface in `backend/src/models/game.ts`
- [ ] T011 [P] Update frontend RoomSnapshot type — add `drawerId`, `secretWord`, `orderedWords` fields in `frontend/src/services/api.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 — Role Assignment & Secret Word Reveal (Priority: P1) 🎯 MVP

**Goal**: Host starts game → host becomes drawer for round 1 → secret word selected deterministically → word visible only to drawer. All players transition from lobby to game screen.

**Independent Test**: Open two browser tabs. Host starts game. Tab A (drawer) sees secret word. Tab B (guesser) sees placeholder — same word not visible.

### Implementation for User Story 1

#### Backend — Service Layer

- [ ] T012 [US1] Implement `djb2Hash(str: string): number` utility function for deterministic word selection in `backend/src/services/roomStore.ts`
- [ ] T013 [US1] Enhance `startGame()`: set `roundNumber=1`, `drawerId=room.hostId`, select word via `djb2Hash` over `orderedWords`, handle 409 if already active, handle 500 if word list empty in `backend/src/services/roomStore.ts`
- [ ] T014 [US1] Update `toRoomSnapshot()`: expose `drawerId` always, expose `orderedWords`, conditionally set `secretWord` only when `viewerParticipantId === room.drawerId` in `backend/src/services/roomStore.ts`

#### Backend — API Layer

- [ ] T015 [US1] Update `GET /:code` route handler to pass `participantId` from query param into `toRoomSnapshot()` for word gating in `backend/src/api/rooms.ts`
- [ ] T016 [US1] Add 409 "Game already started" and 500 "No words available" error handling to `POST /:code/start` route in `backend/src/api/rooms.ts`

#### Frontend — Game Screen

- [ ] T017 [P] [US1] Add `/game` route to the router in `frontend/src/App.tsx`
- [ ] T018 [US1] Create `frontend/src/pages/GamePage.tsx` — role-based drawer/guesser view:
  - Read `room.drawerId` and `room.secretWord` from RoomState
  - Compare `room.drawerId` against stored `participantId` to determine role
  - Drawer: show secret word prominently with "Your word" label
  - Guesser: show "Waiting for the drawer..." placeholder
  - Both: show participant list with drawer badge, redirect to "/" if no room
- [ ] T019 [US1] Update LobbyPage polling: when room status becomes `"active"`, navigate to `/game` (already partially done in 001 — verify `useEffect` handles this correctly) in `frontend/src/pages/LobbyPage.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 — Name Input Validation (Priority: P2)

**Goal**: Player names are trimmed before validation. Empty or whitespace-only names are rejected with a clear error.

**Independent Test**: Submit empty name, submit whitespace-only name, submit name with leading/trailing spaces in both create and join forms — verify correct behavior.

### Implementation for User Story 2

- [ ] T020 [P] [US2] Add `.trim().min(1, "Name cannot be empty")` to `createRoomSchema` in `backend/src/api/schemas.ts`
- [ ] T021 [P] [US2] Add `.trim().min(1, "Name cannot be empty")` to `joinRoomSchema` in `backend/src/api/schemas.ts`
- [ ] T022 [US2] Trim player name before submission in `frontend/src/pages/CreateRoomPage.tsx`
- [ ] T023 [US2] Trim player name before submission in `frontend/src/pages/JoinRoomPage.tsx`
- [ ] T024 [US2] Display `"Name cannot be empty"` error from backend when empty/whitespace name submitted in `frontend/src/pages/CreateRoomPage.tsx`
- [ ] T025 [US2] Display `"Name cannot be empty"` error from backend when empty/whitespace name submitted in `frontend/src/pages/JoinRoomPage.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 — Drawer Identification (Priority: P3)

**Goal**: The current drawer is clearly identified in the participant list for all players.

**Independent Test**: Open two browser tabs, start a game. Both tabs show the drawer prominently identified with a "Drawing" badge.

### Implementation for User Story 3

- [ ] T026 [US3] Display drawer badge ("Drawing") next to the drawer's name in the participant list on `frontend/src/pages/GamePage.tsx`
- [ ] T027 [US3] Show drawer name prominently in the game header (e.g., "Alice is drawing") on `frontend/src/pages/GamePage.tsx`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Tests, verification, and edge case hardening.

- [ ] T028 Write backend test: `startGame` sets `roundNumber=1`, `drawerId=hostId`, selects word deterministically in `backend/src/services/roomStore.test.ts`
- [ ] T029 Write backend test: `startGame` returns 409 when game already active in `backend/src/services/roomStore.test.ts`
- [ ] T030 Write backend test: `startGame` errors if word list is empty (mock `listWords()`) in `backend/src/services/roomStore.test.ts`
- [ ] T031 Write backend test: name trimming rejects empty/whitespace in `backend/src/api/schemas.test.ts`
- [ ] T032 Write frontend test: `RoomSnapshot` includes new fields in `frontend/src/services/api.test.ts`
- [ ] T033 Run full test suite (`npm test` in both `backend/` and `frontend/`) and fix any failures
- [ ] T034 Run `tsc --noEmit` in both `backend/` and `frontend/` — verify zero TypeScript errors
- [ ] T035 Run quickstart.md verification — two-browser-tab manual test of all three user stories

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately. All tasks [P] parallel.
- **Phase 2 (Foundational)**: Depends on Phase 1. BLOCKS all user stories.
- **Phase 3 (US1 — P1 MVP)**: Depends on Phase 2. Core feature — priority.
- **Phase 4 (US2 — P2)**: Depends on Phase 2. Independent of US1.
- **Phase 5 (US3 — P3)**: Depends on Phase 2 + Phase 3 (GamePage must exist). UI-only on top of Phase 3.
- **Phase 6 (Polish)**: Depends on all desired user stories being complete.

### User Story Dependencies

| Story | Depends On | Independent Test |
|-------|-----------|------------------|
| **US1 (P1)** | Phase 2 | Start game → drawer sees word, guesser sees placeholder |
| **US2 (P2)** | Phase 2 | Submit empty/whitespace name → error message |
| **US3 (P3)** | Phase 2 + US3 | Game active → drawer badge visible to all |

### Parallel Opportunities

- All Phase 1 tasks (T001–T008) can run in parallel (read-only, no writes)
- All Phase 2 tasks (T009–T011) can run in parallel (different interfaces)
- T012/T013 vs T014: can run in parallel within US1 (roomStore logic vs zod schemas)
- T017/T020/T021 can run in parallel (App.tsx route vs schemas)
- Phase 4 (US2) and Phase 3 (US1) can proceed in parallel after Phase 2

---

## Parallel Example: User Story 1

```bash
# Launch all Phase 2 model changes together:
Task: "T009 — Add fields to Room in game.ts"
Task: "T010 — Add fields to RoomSnapshot in game.ts"
Task: "T011 — Update RoomSnapshot in frontend api.ts"

# Launch all US1 backend tasks together:
Task: "T012 — Implement DJB2 hash in roomStore.ts"
Task: "T014 — Update toRoomSnapshot in roomStore.ts"
Task: "T017 — Add /game route in App.tsx"

# Sequential must-run:
Task: "T013 — Enhance startGame (depends on T012)"
Task: "T018 — Create GamePage.tsx (depends on T017)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (read existing code)
2. Complete Phase 2: Foundational (model changes)
3. Complete Phase 3: User Story 1 (game start + word reveal)
4. **STOP and VALIDATE**: Two-browser-tab test US1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Models updated
2. Add US1 → MVP: game starts, drawer sees word, guessers don't
3. Add US2 → Name validation works
4. Add US3 → Drawer badge visible to all
5. Polish → Tests and verification

### Implementation Order Per Story

- Backend models → services → API routes → frontend types → frontend page
- Within a layer: parallel tasks first, then sequential dependent tasks
