---

description: "Implementation tasks for Results and Restart"

---

# Tasks: Results and Restart

**Branch**: `004-results-restart` | **Date**: 2026-05-31

**Input**: Design documents from `specs/004-results-restart/`

**Prerequisites**: plan.md, spec.md, data-model.md, research.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`

---

## Phase 1: Setup (Codebase Analysis)

**Purpose**: Read existing code to understand current state before making changes

- [ ] T001 [P] Read `backend/src/models/game.ts` — identify current RoomStatus type and Room fields
- [ ] T002 [P] Read `backend/src/services/roomStore.ts` — identify existing service functions and patterns
- [ ] T003 [P] Read `backend/src/api/schemas.ts` — identify existing Zod schemas
- [ ] T004 [P] Read `backend/src/api/rooms.ts` — identify existing route handlers and error patterns
- [ ] T005 [P] Read `frontend/src/services/api.ts` — identify existing API methods
- [ ] T006 [P] Read `frontend/src/state/roomStore.ts` — identify existing store actions
- [ ] T007 [P] Read `frontend/src/pages/GamePage.tsx` — identify current game page layout and conditional rendering
- [ ] T008 [P] Read `frontend/src/styles/app.css` — identify existing CSS classes

---

## Phase 2: Foundational (Model Changes)

**Purpose**: Add "results" room status — core model change that US1 and US2 both depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T009 [P] Add `"results"` to the `RoomStatus` union type in `backend/src/models/game.ts`
- [ ] T010 [P] Update frontend `RoomStatus` type — add `"results"` in `frontend/src/services/api.ts`

**Checkpoint**: Foundation ready — "results" is a valid status across backend and frontend types.

---

## Phase 3: User Story 1 — Round Results Display (Priority: P1) 🎯 MVP

**Goal**: The host can end the round and all players see the results screen with the correct word, final scores, and complete guess history.

**Independent Test**: Two players in a game; host clicks "End Round" → both players see the results screen with the correct word, all scores, and full guess history.

### Implementation for User Story 1

#### Backend — Service Layer

- [ ] T011 [P] [US1] Implement `endRound(code, participantId)` — validates host, validates room is active, sets status to "results" in `backend/src/services/roomStore.ts`
- [ ] T012 [P] [US1] Update `toRoomSnapshot` — when room status is "results", secretWord is visible to all viewers (not just drawer) in `backend/src/services/roomStore.ts`
- [ ] T013 [P] [US1] Update `joinRoom` — reject join when room status is "results" (FR-013) in `backend/src/services/roomStore.ts`

#### Backend — API Layer

- [ ] T014 [P] [US1] Add Zod schema for end-round request (`endRoundSchema`) in `backend/src/api/schemas.ts`
- [ ] T015 [US1] Add `POST /:code/end-round` route — accepts `{ participantId }`, validates host + active status, returns updated room in `backend/src/api/rooms.ts`

#### Frontend — Results Component

- [ ] T016 [P] [US1] Add `endRound(code, participantId)` API method in `frontend/src/services/api.ts`
- [ ] T017 [US1] Add `endRound()` store action — calls API, updates room snapshot in `frontend/src/state/roomStore.ts`
- [ ] T018 [P] [US1] Create `frontend/src/components/ResultsPanel.tsx` — displays correct word, scores table, and chronological guess history
- [ ] T019 [US1] Update `GamePage.tsx` — render ResultsPanel when `room.status === "results"`; add "End Round" button for host when status is "active"
- [ ] T020 [US1] Add CSS styles for results panel — `.results-panel`, `.results-word`, `.results-score-list`, `.results-guess-list` in `frontend/src/styles/app.css`

**Checkpoint**: At this point, User Story 1 should be fully functional. Host ends round, all players see results on poll.

---

## Phase 4: User Story 2 — Host Restart (Priority: P1)

**Goal**: From the results screen, the host can restart the game — returning all players to lobby with their names preserved and all round state cleared.

**Independent Test**: Host ends round, then clicks "Restart" → all players see lobby with same participants, zero scores, empty guesses/strokes.

### Implementation for User Story 2

#### Backend — Service Layer

- [ ] T021 [P] [US2] Implement `restartGame(code, participantId)` — validates host, validates room is in results status, clears drawerId/secretWord/strokes/guesses/scores, resets roundNumber to 0, sets status to "lobby" in `backend/src/services/roomStore.ts`

#### Backend — API Layer

- [ ] T022 [P] [US2] Add Zod schema for restart request (`restartSchema`) in `backend/src/api/schemas.ts`
- [ ] T023 [US2] Add `POST /:code/restart` route — accepts `{ participantId }`, validates host + results status, calls restartGame, returns updated room in `backend/src/api/rooms.ts`

#### Frontend — Restart Button

- [ ] T024 [P] [US2] Add `restartGame(code, participantId)` API method in `frontend/src/services/api.ts`
- [ ] T025 [US2] Add `restartGame()` store action — calls API, updates room snapshot in `frontend/src/state/roomStore.ts`
- [ ] T026 [US2] Update `ResultsPanel.tsx` — add "Restart Game" button visible only to host; on click, calls restartGame store action
- [ ] T027 [US2] Verify lobby transition — ensure poll fetches lobby state after restart (LobbyPage already handles "lobby" status)

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Tests, type safety verification, and manual validation.

- [ ] T028 Write backend tests: `endRound` rejects non-host, rejects non-active room, succeeds with valid host+active in `backend/src/services/roomStore.test.ts`
- [ ] T029 Write backend tests: `restartGame` rejects non-host, rejects non-results room, clears all round state, preserves participants in `backend/src/services/roomStore.test.ts`
- [ ] T030 [P] Update frontend test mock in `frontend/src/services/api.test.ts` — add `"results"` to status union in mock RoomSnapshot
- [ ] T031 Run full test suite (`vitest run` in both `backend/` and `frontend/`) and fix any failures
- [ ] T032 Run `tsc --noEmit` in both `backend/` and `frontend/` — verify zero TypeScript errors
- [ ] T033 Run manual two-browser-tab verification: host ends round → guest sees results → host restarts → both see lobby

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately. All tasks [P] parallel.
- **Phase 2 (Foundational)**: Depends on Phase 1. BLOCKS all user stories.
- **Phase 3 (US1 — P1 MVP)**: Depends on Phase 2. Results display — core feature.
- **Phase 4 (US2 — P1 MVP)**: Depends on Phase 2. Restart — depends on results phase existing but can share Phase 2.
- **Phase 5 (Polish)**: Depends on all user stories being complete.

### User Story Dependencies

| Story | Depends On | Independent Test |
|-------|-----------|------------------|
| **US1 (P1)** | Phase 2 | Host ends round, all players see results |
| **US2 (P1)** | Phase 3 | Host restarts from results, all players see lobby |

### Within Each User Story

- Models before services
- Services before API endpoints
- API endpoints before frontend methods
- Frontend component before styles
- Story complete before moving to next

### Parallel Opportunities

- All Phase 1 tasks (T001–T008) can run in parallel (read-only)
- All Phase 2 tasks (T009–T010) can run in parallel (different files)
- Within Phase 3: T011/T013 (service) vs T014 (schema) vs T016 (API method) vs T018 (component) can run in parallel
- Within Phase 4: T021 (service) vs T022 (schema) vs T024 (API method) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all Phase 2 foundational tasks together:
Task: "T009 — Add 'results' to RoomStatus in game.ts"
Task: "T010 — Add 'results' to RoomStatus in frontend api.ts"

# Launch all US1 backend tasks together:
Task: "T011 — Implement endRound in roomStore.ts"
Task: "T012 — Update toRoomSnapshot for results status"
Task: "T013 — Update joinRoom to reject results rooms"

# Launch all US1 frontend tasks together:
Task: "T016 — Add endRound API method"
Task: "T018 — Create ResultsPanel.tsx component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (read existing code)
2. Complete Phase 2: Foundational (add "results" status)
3. Complete Phase 3: User Story 1 (end round + results display)
4. **STOP and VALIDATE**: Host ends round, all players see results
5. Continue to Phase 4 (restart) for full feature

### Incremental Delivery

1. Setup + Foundational → "results" type added
2. Add US1 → MVP: End round, see results
3. Add US2 → Restart game, return to lobby
4. Polish → Tests and verification

### Implementation Order Per Story

- Backend models → services → API routes → frontend methods → frontend UI
- Within a layer: parallel tasks first, then sequential dependent tasks
