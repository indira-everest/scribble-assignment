# Research: Room Setup & Lobby

## Starter Code Analysis

### Backend: roomStore.ts (services)

**Current state**: In-memory `Map<string, Room>` with `createRoom`, `joinRoom`,
`getRoom`, `saveRoom`. Room codes are 4-char uppercase alphanumeric (no vowels
or confusable chars). Participants get a UUID `id`. No host tracking exists.

**Decision**: Extend `Room` model with `hostId: string` referencing the
participant ID of the creator. Add `isHost` check to `startGame`.

**Rationale**: Minimal change to existing model. Host identity follows the
participant ID, not the display name (so name changes don't affect host status).

**Alternatives considered**: Deriving host from `participants[0]` — fragile,
breaks if order changes. Using a separate host object — over-engineered for
this scope.

### Backend: game.ts (models)

**Current state**: `Participant` has `id`, `name`, `joinedAt`. `Room` has
`code`, `status` (only `"lobby"`), `participants[]`. `RoomSnapshot` mirrors
Room with added `availableWords` and `roles`.

**Decision**: Add `hostId: string` to `Room`. Add `status: "lobby" | "active"`.
Add `isHost` convenience helper. Participant stays unchanged (host tracked
at room level).

**Rationale**: Room-level host tracking matches the requirement "room creator
becomes host." Status expansion is needed for start-game flow.

**Alternatives considered**: Adding `isHost: boolean` to `Participant` —
redundant when hostId exists on Room; requires syncing on every mutation.

### Frontend: roomStore.ts (state)

**Current state**: Custom `RoomStore` class with `createRoom`, `joinRoom`,
`fetchRoom` actions. Uses `useSyncExternalStore` for reactivity.

**Decision**: Add `startGame()` action. Add polling loop via `setInterval`
triggering `fetchRoom` every 2s. Use the existing `setRoomSnapshot` to update
lobby state. Clean up interval on unmount via store disposal.

**Rationale**: Reuses existing store pattern. No new state management libraries
needed (per constitution constraints).

**Alternatives considered**: Polling in component (`useEffect` in LobbyPage)
— works but couples polling to component lifecycle. Store-level polling is
more reusable.

### Frontend: api.ts (services)

**Current state**: Typed `request<T>` helper. `createRoom`, `joinRoom`,
`fetchRoom` methods.

**Bug found**: Fallback `API_BASE_URL` ends in `/bug` — should be `http://localhost:3001`.

**Decision**: Fix the base URL typo. Add `startGame(code, participantId)` method.

**Rationale**: Clean API layer keeps HTTP concerns out of the store.
`startGame` follows the same pattern as other methods.

**Alternatives considered**: Embedding start game call in store directly — less
testable, violates separation of concerns.

### Frontend: LobbyPage.tsx (page)

**Current state**: Manual "Refresh Room" button. No polling. "Start Game"
button navigates unconditionally to `/game`.

**Decision**: Add `useEffect` with `setInterval` calling `roomStore.fetchRoom()`
every 2s. Wire "Start Game" to call `roomStore.startGame()` (not direct
navigation). Disable button when `participants.length < 2` or user is not host.
Show appropriate status text.

**Rationale**: Polling requirement per spec. Server-side start-game enforcement
prevents unauthorised game launches (constitution principle V).

**Alternatives considered**: Start-game via local state only — violates
server-side enforcement requirement.

### Backend: API routes (rooms.ts)

**Current state**: `POST /rooms`, `POST /:code/join`, `GET /:code`.

**Decision**: Add `POST /:code/start` endpoint. Validates caller is host and
minimum 2 players present. Transitions room status to `"active"`. Returns
updated room snapshot.

**Rationale**: Dedicated endpoint for start-game action. Clean separation from
other room operations.

**Alternatives considered**: `PATCH /:code` with action field — generic but
harder to validate and document.

### Backend: roomStore.test.ts

**Current state**: Two tests (create room, join non-existent room). No test for
host assignment, join validation, or room isolation.

**Decision**: Add tests for host assignment on create, duplicate name rejection,
empty code rejection, non-existent code rejection, start game (host only,
2-player minimum), and room isolation.

**Rationale**: Spec requires clear validation. Test coverage ensures correctness.
Constitution requires tests to pass before feature completion.

### Frontend: api.test.ts

**Current state**: Two tests (createRoom shape, fetchRoom shape). No error
handling tests.

**Decision**: Add tests for `joinRoom` shape, `startGame` shape, and error
response handling.

**Rationale**: Consistent coverage with backend. Error handling tests prevent
unhandled API failures.
