# Room API Contracts

**Branch**: `002-game-start-drawer-flow` | **Date**: 2026-05-31

## Overview

All endpoints under `/rooms`. All request/response bodies are JSON.

**Base URL**: `http://localhost:3001`

## Types

```typescript
type Participant = {
  id: string;        // UUID v4
  name: string;      // Trimmed, 1+ chars
  joinedAt: string;  // ISO 8601
};

type RoomStatus = "lobby" | "active";

type RoomSnapshot = {
  code: string;
  status: RoomStatus;
  hostId: string;
  drawerId: string | null;         // null when status === "lobby"
  secretWord: string | null;       // only populated when viewer is drawer
  participants: Participant[];
  availableWords: string[];
  roles: ("drawer" | "guesser")[];
  orderedWords: string[];
};
```

## Endpoints

### POST /rooms

Create a new room. Creator is host.

**Request:**
```json
{ "playerName": string }
```

**Response 201:**
```json
{
  "participantId": "uuid",
  "room": { /* RoomSnapshot — status: "lobby", drawerId: null */ }
}
```

**Errors:**
| Status | Body.message                   | Condition                     |
|--------|--------------------------------|-------------------------------|
| 400    | "Name cannot be empty"         | playerName empty after trim   |

---

### POST /rooms/:code/join

Join an existing room.

**Request:**
```json
{ "playerName": string }
```

**Response 200:**
```json
{
  "participantId": "uuid",
  "room": { /* RoomSnapshot */ }
}
```

**Errors:**
| Status | Body.message                              | Condition                       |
|--------|-------------------------------------------|---------------------------------|
| 400    | "Name cannot be empty"                    | playerName empty after trim     |
| 400    | "Name already taken. Choose a different name." | Duplicate name in room     |
| 404    | "Room not found. Check your code and try again." | Unknown code              |

---

### GET /rooms/:code

Poll current room state.

**Query params:** `?participantId=uuid` (optional — needed for drawer word visibility)

**Response 200:**
```json
{
  "room": { /* RoomSnapshot — secretWord: string if participantId === drawerId, else null */ }
}
```

**Errors:**
| Status | Body.message            | Condition         |
|--------|-------------------------|-------------------|
| 404    | "Unable to load room"   | Unknown code      |

---

### POST /rooms/:code/start

Host starts the game. Requires ≥ 2 participants. (Existing endpoint — enhanced.)

**Request:**
```json
{ "participantId": "uuid" }
```

**Response 200:**
```json
{
  "room": { /* RoomSnapshot — status: "active", drawerId set, secretWord for drawer */ }
}
```

**Errors:**
| Status | Body.message                              | Condition                        |
|--------|-------------------------------------------|----------------------------------|
| 404    | "Room not found."                         | Unknown code                     |
| 403    | "Only the host can start the game."       | participantId !== hostId         |
| 403    | "Need at least 2 players to start."       | < 2 participants                 |
| 409    | "Game already started."                   | status already "active"          |
| 500    | "No words available to start the game."   | Word list empty                  |

## Design Notes

- `secretWord` is conditionally gated server-side: only returned when `participantId` query param matches `drawerId`. This satisfies FR-006.
- `orderedWords` is always visible so all clients can independently verify word derivation.
- `drawerId` is always visible so all clients can render the drawer badge.
