# Feature Specification: Room Setup & Lobby

**Feature Branch**: `001-room-setup-lobby`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "Feature: Room Setup & Lobby. Create a specification for Scenario 1. Requirements: Room creator automatically becomes host. Join room should validate empty and invalid room codes. Show clear error messages for invalid joins. Rooms must remain isolated from each other. Lobby should automatically poll room state every 2 seconds. Only host can start the game. Start game button is disabled until at least 2 players are present."

## Clarifications

### Session 2026-05-31

- Q: When a player with the same name tries to join a room they are already in, should the system reject with "Already in this room" or allow re-join? → A: Reject with "Already in this room" — clear error, unchanged player state.
- Q: Can two different players in the same room share the same display name? → A: Names must be unique within a room — reject join if name is already taken.
- Q: What happens if a randomly generated room code collides with an existing active room? → A: Retry with a new code — silently regenerate if collision detected, up to a reasonable number of attempts.
- Q: Should polling happen exactly every 2 seconds (fixed interval), wait 2 seconds after each response, or no strict guarantee? → A: Fixed interval — poll exactly every 2 seconds (timer-based, regardless of response time).
- Q: If the host disconnects and re-joins with the same display name, should they reclaim host status? → A: Yes — re-joining with the same name reclaims host status.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Room & Host Assignment (Priority: P1)

A player opens the app and creates a new game room. They are automatically
designated as the host. A unique room code is generated and displayed so they
can share it with others. No other player can become the host of this room.

**Why this priority**: Room creation is the entry point for all gameplay.
Without a room and a host, no other scenario can begin.

**Independent Test**: Can be fully tested by opening the app, creating a room,
and verifying the creator is labelled as host. The room code is visible and
sharable.

**Acceptance Scenarios**:

1. **Given** a player is on the start screen, **When** they click "Create Room",
   **Then** a new room is created, a unique room code is displayed, and the
   creator is designated as the host.

2. **Given** a room exists with a host, **When** a second player joins,
   **Then** the second player is a non-host participant and cannot host-only
   actions.

---

### User Story 2 - Join Room with Validation (Priority: P1)

A player joins a room by entering a room code. Empty codes, whitespace-only
codes, and codes that do not match any existing room are rejected with clear,
user-facing error messages. Successful join loads the lobby view.

**Why this priority**: Joining is the second half of the entry flow. Validation
prevents confusion and frustration, and is required before lobby interaction
can be tested.

**Independent Test**: Can be fully tested by attempting to join with an empty
code, a non-existent code, and a valid code. Each case produces the correct
result.

**Acceptance Scenarios**:

1. **Given** a player is on the join screen, **When** they submit an empty room
   code, **Then** an error message is shown: "Please enter a room code."

2. **Given** a player is on the join screen, **When** they submit a whitespace-only
   room code, **Then** an error message is shown: "Please enter a room code."

3. **Given** a player is on the join screen, **When** they submit a code that
   does not match any existing room, **Then** an error message is shown:
   "Room not found. Check your code and try again."

4. **Given** a player is on the join screen, **When** they submit a valid room
   code, **Then** they are added to the room and see the lobby screen.

---

### User Story 3 - Lobby Polling & Host-Only Start (Priority: P2)

After creating or joining a room, all players see the lobby with a live
participant list that refreshes automatically by polling the server every
2 seconds. The host sees an enabled "Start Game" button once at least 2
players are in the room. Non-host players see the button as disabled.

**Why this priority**: The lobby is the staging area for gameplay. Automatic
refresh ensures participants see up-to-date state without manual intervention.
Host-only start prevents unauthorised game launches.

**Independent Test**: Can be fully tested by opening two browser tabs: host
creates a room, guest joins. Both tabs show the updated participant list
within ~2 seconds. Host can start the game; guest cannot.

**Acceptance Scenarios**:

1. **Given** a host is in the lobby with only themselves, **When** they view
   the lobby, **Then** the "Start Game" button is disabled with text indicating
   "Waiting for players..."

2. **Given** a host is in the lobby, **When** a second player joins,
   **Then** the participant list updates to show both players within
   approximately 2 seconds, and the "Start Game" button becomes enabled.

3. **Given** a non-host player is in the lobby, **When** they view the lobby
   at any time, **Then** the "Start Game" button is disabled or hidden.

4. **Given** the host clicks the enabled "Start Game" button, **When** at least
   2 players are present, **Then** all players transition to the game screen.

5. **Given** rooms A and B are both active, **When** a player joins room A,
   **Then** room B's lobby shows no change (rooms are fully isolated).

---

### Edge Cases

- **Join with a name already taken in the room**: Error message "Name already
  taken. Choose a different name." displayed; join rejected.
- **Join with empty code**: Error message displayed; no request sent to server.
- **Join with whitespace-only code**: Treated as empty; same error message.
- **Join non-existent code**: Server returns error; user sees "Room not found."
- **Same player name joins twice**: Rejected with "Already in this room."
  Player state remains unchanged. (Same as duplicate name rule.)
- **Room code case sensitivity**: Room codes are matched case-insensitively.
- **Network failure during polling**: Client shows last known lobby state with
  a subtle indicator that connection may be stale; retries automatically.
- **Host refreshes or navigates away**: Host remains assigned. If the host
  re-joins with the same display name, they reclaim host status. If host never
  returns, game cannot start — no host transfer in this scope.
- **Multiple rooms active simultaneously**: Each room is fully isolated; join,
  lobby, and participant lists never cross room boundaries.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST designate the room creator as the host.
- **FR-002**: System MUST generate a unique room code for each new room. If
  the generated code collides with an existing active room, the system MUST
  silently retry with a new code.
- **FR-003**: System MUST reject join requests with empty or whitespace-only
  room codes with the message "Please enter a room code."
- **FR-004**: System MUST reject join requests for non-existent room codes with
  the message "Room not found. Check your code and try again."
- **FR-005**: System MUST reject join requests with a display name that is
  already taken within the room with the message "Name already taken. Choose
  a different name."
- **FR-006**: System MUST isolate room state so that players, messages, and
  game activity in one room are invisible to other rooms.
- **FR-007**: The lobby MUST automatically poll the server for updated room
  state on a fixed 2-second interval (timer-based, firing every 2 seconds
  regardless of response time).
- **FR-008**: Only the host MUST be permitted to start the game.
- **FR-009**: The "Start Game" action MUST be blocked when fewer than 2 players
  are present in the room.
- **FR-010**: Room codes MUST be matched case-insensitively.

### Key Entities

- **Room**: A game session identified by a unique code. Contains a list of
  players, a designated host, and game state (lobby, active, result).
- **Player**: A participant in a room, identified by their display name. Player
  names MUST be unique within a room. Has a role (host or participant) within
  the room.
- **Lobby State**: The current view of a room before the game starts: shows
  participant list and a start control (host only).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can create a room and see a shareable room code within
  3 seconds of clicking "Create Room."
- **SC-002**: A player who enters an invalid room code sees a descriptive error
  message immediately (within 1 second of submission).
- **SC-003**: Two players in the same room see each other appear in the lobby
  within 3 seconds of the second player joining.
- **SC-004**: The host can start the game once both players are present; a
  non-host player cannot trigger game start under any circumstances.
- **SC-005**: Three independent room sessions can be created and populated
  simultaneously without any cross-room data leakage.

## Assumptions

- Room codes are 4-character alphanumeric strings generated by the system.
- Players are identified by their display name (no authentication).
- The host remains the host for the entire room lifecycle; no host transfer
  mechanism is provided in this scope.
- Maximum practical room size is bounded by the game experience rather than
  a hard system limit; no explicit cap is enforced.
- Network connectivity is assumed; polling failures degrade gracefully by
  showing the last known state.
- The starter's existing POST /rooms, POST /rooms/:code/join, and GET /rooms/:code
  endpoints provide the foundation for this feature.
