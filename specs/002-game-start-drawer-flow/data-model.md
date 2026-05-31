# Data Model: Game Start & Drawer Flow

**Branch**: `002-game-start-drawer-flow` | **Date**: 2026-05-31

## Entities

### Participant (unchanged from starter)

| Field     | Type     | Rules                                       |
|-----------|----------|---------------------------------------------|
| id        | string   | UUID v4, immutable, unique per participant   |
| name      | string   | Trimmed, 1+ chars, unique per room           |
| joinedAt  | string   | ISO 8601 timestamp                          |

### Room (extended)

| Field         | Type           | Rules                                             |
|---------------|----------------|---------------------------------------------------|
| code          | string         | 4-char alphanumeric (ABCDEFGHJKLMNPQRSTUVWXYZ23456789), unique, uppercase |
| status        | RoomStatus     | "lobby" | "active". Transition: lobby → active        |
| hostId        | string         | Participant ID of room creator. Reassignable on host rejoin |
| participants  | Participant[]  | At least 1. Max N (no explicit limit)             |
| roundNumber   | number         | Starts at 1 when game becomes active. Read-only post-start |
| drawerId      | string         | Participant ID of current round's drawer. Set to hostId at game start |
| secretWord    | string         | Selected deterministically. Only sent to drawer in API response |
| orderedWords  | string[]       | Alphabetically sorted copy of starter word list. Stable reference for deterministic selection |
| createdAt     | string         | ISO 8601, immutable after creation                |
| updatedAt     | string         | ISO 8601, updated on every mutation               |

### RoomSnapshot (extended, API-visible)

| Field          | Type            | Visibility                                                     |
|----------------|-----------------|----------------------------------------------------------------|
| code           | string          | All participants                                                |
| status         | RoomStatus      | All participants                                                |
| hostId         | string          | All participants                                                |
| drawerId       | string          | All participants                                                |
| secretWord     | string \| null  | `null` for non-drawer; actual word only when viewer IS drawer   |
| participants   | Participant[]   | All participants                                                |
| availableWords | string[]        | All participants (for client-side display of word pool)         |
| roles          | ParticipantRole[] | All participants                                              |
| orderedWords   | string[]        | All participants (alphabetically sorted, for deterministic word derivation) |

## State Transitions

```
[lobby] --[host starts game]--> [active]
  |                                  |
  | (join/create)                    | (no transition in this feature)
  |                                  |
  v                                  v
(room exists)                   (game in progress)

```

- `lobby → active`: Triggered by host-only `POST /:code/start`. Requires ≥ 2 participants, ≥ 1 word in list.
- `active → *`: No transition in this feature (round 2+ deferred).

## Validation Rules (from spec)

| Rule                  | Source  | Location          |
|-----------------------|---------|-------------------|
| Name must be 1+ chars after trim | FR-001, FR-002 | Backend Zod + frontend |
| Name unique per room  | Spec EC | Backend joinRoom  |
| Game start: host only | FR-003  | Backend startGame |
| Game start: ≥2 players | FR-008 | Backend startGame |
| Game start: ≥1 word   | FR-009  | Backend startGame |
| Double start → 409    | FR-012  | Backend startGame |

## Deterministic Word Selection Algorithm (from research.md)

```
hash = DJB2(roomCode + "-" + roundNumber)
index = hash % orderedWords.length
word = orderedWords[index]
```
