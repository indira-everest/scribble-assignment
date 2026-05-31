# Data Model: Room Setup & Lobby

## Backend Entities

### Participant

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` (UUID) | Generated server-side |
| `name` | `string` | Display name, trimmed, min 1 char |
| `joinedAt` | `string` (ISO 8601) | Set on creation |

**Uniqueness**: `name` must be unique within a Room.

---

### RoomStatus

`"lobby" | "active"` — expanded from current `"lobby"`-only.

---

### Room

| Field | Type | Notes |
|-------|------|-------|
| `code` | `string` (4 chars) | Uppercase alphanumeric, no vowels/confusable chars |
| `status` | `RoomStatus` | Starts as `"lobby"`, transitions to `"active"` on game start |
| `hostId` | `string` | Participant ID of the creator (**NEW**) |
| `participants` | `Participant[]` | Ordered by join time |
| `createdAt` | `string` (ISO 8601) | Set on creation |
| `updatedAt` | `string` (ISO 8601) | Updated on each mutation |

**Validation rules**:
- `hostId` MUST match a participant ID in `participants`
- Room code is case-insensitive for matching, stored as uppercase
- `participants` array MUST contain no duplicate names
- Minimum 1 participant at all times (the host)

---

### RoomSnapshot

API-facing shape returned to clients.

| Field | Type | Notes |
|-------|------|-------|
| `code` | `string` | Room code |
| `status` | `RoomStatus` | Current room state |
| `hostId` | `string` | Who can start the game (**NEW**) |
| `participants` | `Participant[]` | Current participant list |
| `availableWords` | `string[]` | From starter data |
| `roles` | `("drawer" \| "guesser")[]` | From starter data |

---

### RoomSessionResponse

Returned on create/join.

| Field | Type |
|-------|------|
| `participantId` | `string` |
| `room` | `RoomSnapshot` |

---

### API Request Bodys

#### CreateRoomRequest

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `playerName` | `string` (optional) | `"Player"` | Trimmed before use |

#### JoinRoomRequest

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `playerName` | `string` (optional) | `"Player"` | Trimmed before use |

#### StartGameRequest

| Field | Type | Notes |
|-------|------|-------|
| `participantId` | `string` | Must match hostId |

---

## State Transitions

```
[create] ──> lobby ──> [start] ──> active
                ↑
            [join]
```

- **lobby → lobby**: Players can join/leave. Polling reads state.
- **lobby → active**: Host calls startGame. Requires ≥2 players.
- **active**: Further transitions (round management) out of scope for this feature.

## Frontend State (roomStore.ts)

### RoomState

| Field | Type | Notes |
|-------|------|-------|
| `room` | `RoomSnapshot \| null` | Current room view |
| `participantId` | `string \| null` | This client's participant ID |
| `error` | `string \| null` | Last error message |
| `isLoading` | `boolean` | True during any API call |

### Actions

| Action | Effect |
|--------|--------|
| `createRoom(name)` | POST /rooms → stores participantId + room |
| `joinRoom(code, name)` | POST /:code/join → stores participantId + room |
| `fetchRoom()` | GET /:code → updates room snapshot |
| `startGame()` | POST /:code/start → updates room status to "active" |
