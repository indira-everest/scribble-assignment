---

description: "Task list for Room Setup & Lobby feature"
---

# Tasks: Room Setup & Lobby

**Input**: Design documents from `/specs/001-room-setup-lobby/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No explicit test tasks — manual verification via quickstart.md scenarios and two-browser-tab testing.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths reflect the existing starter structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new project structure needed — starter already exists. Shared model changes belong here.

- [ ] T001 Add `hostId: string` and expand `RoomStatus` to `"lobby" | "active"` in `backend/src/models/game.ts`
- [ ] T002 Fix `API_BASE_URL` fallback typo (`/bug` → correct) in `frontend/src/services/api.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Add `hostId` to `RoomSnapshot` interface in `backend/src/models/game.ts`
- [ ] T004 Update `toRoomSnapshot` to include `hostId` in `backend/src/services/roomStore.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Room & Host Assignment (Priority: P1) 🎯 MVP

**Goal**: A player creates a room and is automatically designated as the host. The room code is displayed and the host identity is tracked server-side.

**Independent Test**: Open the app, create a room, and verify the creator is labelled as host. The room code is visible and shareable.

### Implementation for User Story 1

- [ ] T005 [P] [US1] Add `playerName` assignment and host tracking on room creation in `backend/src/services/roomStore.ts`
- [ ] T006 [P] [US1] Create `startGameSchema` in `backend/src/api/schemas.ts`
- [ ] T007 [US1] Add `POST /:code/start` route handler (validates host, delegates to service) in `backend/src/api/rooms.ts`
- [ ] T008 [US1] Implement `startGame` service function (status transition, 2-player check) in `backend/src/services/roomStore.ts`
- [ ] T009 [US1] Add `startGame` method to frontend API client in `frontend/src/services/api.ts`
- [ ] T010 [US1] Add `startGame` action to frontend store in `frontend/src/state/roomStore.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Join Room with Validation (Priority: P1)

**Goal**: A player joins a room by entering a room code. Empty codes, whitespace-only codes, and non-existent codes are rejected with clear error messages. Duplicate names within a room are rejected.

**Independent Test**: Attempt to join with an empty code, a non-existent code, a taken name, and a valid code. Each case produces the correct result.

### Implementation for User Story 2

- [ ] T011 [P] [US2] Add duplicate name rejection in `joinRoom` in `backend/src/services/roomStore.ts`
- [ ] T012 [P] [US2] Add empty/whitespace-only room code validation in `backend/src/api/schemas.ts`
- [ ] T013 [US2] Enhance join route error responses with specific error messages in `backend/src/api/rooms.ts`
- [ ] T014 [US2] Update Join Room page to display validation error messages in `frontend/src/pages/JoinRoomPage.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Lobby Polling & Host-Only Start (Priority: P2)

**Goal**: After creating or joining a room, all players see an automatically refreshing lobby. The host sees an enabled "Start Game" button once at least 2 players are present. Non-host players see the button as disabled.

**Independent Test**: Open two browser tabs. Host creates room, guest joins. Both tabs show the updated participant list within ~2 seconds. Host can start the game; guest cannot.

### Implementation for User Story 3

- [ ] T015 [P] [US3] Add fixed-interval 2s polling loop (setInterval) in `frontend/src/pages/LobbyPage.tsx`
- [ ] T016 [P] [US3] Add host detection and start button gating (disable when <2 players or non-host) in `frontend/src/pages/LobbyPage.tsx`
- [ ] T017 [P] [US3] Add server-side host verification and 2-player minimum to `POST /:code/start` in `backend/src/services/roomStore.ts`
- [ ] T018 [US3] Wire frontend start game flow (call `startGame`, navigate on success) in `frontend/src/pages/LobbyPage.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and cleanup across all stories

- [ ] T019 Run `specs/001-room-setup-lobby/quickstart.md` validation scenarios with two browser tabs
- [ ] T020 Fix `API_BASE_URL` fallback typo in `frontend/src/services/api.ts` (verify VITE_API_URL env handling)
- [ ] T021 Update `backend/src/services/roomStore.test.ts` with tests for host assignment, duplicate name, and start game logic
- [ ] T022 Update `frontend/src/services/api.test.ts` with tests for `startGame` and `joinRoom` request shapes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**:
  - US1 (Phase 3) and US2 (Phase 4) can start in parallel after Foundational
  - US3 (Phase 5) depends on US1 (host tracking must exist for start-game gating)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Fully independent of US1
- **User Story 3 (P2)**: Depends on US1 (needs hostId) and US2 (needs player list validation)

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T001, T002 can run in parallel (different files)
- T003, T004 can run in parallel
- T005, T006 can run in parallel (within US1)
- T011, T012 can run in parallel (within US2)
- T015, T016, T017 can run in parallel (within US3)
- US1 and US2 can be worked on in parallel
- T021, T022 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch both backend model + route tasks together:
Task: "Add hostId and expand RoomStatus in backend/src/models/game.ts"
Task: "Add hostId to RoomSnapshot in backend/src/models/game.ts"

# Launch both store + schema tasks together:
Task: "Add host assignment on room creation in backend/src/services/roomStore.ts"
Task: "Create startGameSchema in backend/src/api/schemas.ts"

# Launch all frontend tasks together:
Task: "Add startGame method to frontend API in frontend/src/services/api.ts"
Task: "Add startGame action to frontend store in frontend/src/state/roomStore.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently via quickstart.md
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
3. Once US1 done: Developer A moves to User Story 3
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently using two browser tabs
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
