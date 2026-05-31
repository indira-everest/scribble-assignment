# Rooms API Contracts

Base URL: `http://localhost:3001`

## POST /rooms

Create a new room.

**Request**:
```json
{
  "playerName": "Alice"        // optional, defaults to "Player"
}
```

**Response (201)**:
```json
{
  "participantId": "uuid-abc-123",
  "room": {
    "code": "X7K2",
    "status": "lobby",
    "hostId": "uuid-abc-123",
    "participants": [
      { "id": "uuid-abc-123", "name": "Alice", "joinedAt": "2026-05-31T12:00:00.000Z" }
    ],
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

**Errors**:
- `400` — Invalid request body (Zod validation)

---

## POST /rooms/:code/join

Join an existing room.

**Request**:
```json
{
  "playerName": "Bob"          // optional, defaults to "Player"
}
```

**Response (200)**:
```json
{
  "participantId": "uuid-def-456",
  "room": {
    "code": "X7K2",
    "status": "lobby",
    "hostId": "uuid-abc-123",
    "participants": [
      { "id": "uuid-abc-123", "name": "Alice", "joinedAt": "..." },
      { "id": "uuid-def-456", "name": "Bob", "joinedAt": "..." }
    ],
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

**Errors**:
- `400` — Empty or whitespace-only name → `"Please enter a room code."`
- `400` — Name already taken in room → `"Name already taken. Choose a different name."`
- `400` — Same player re-joining → `"Already in this room."`
- `404` — Room code not found → `"Room not found. Check your code and try again."`

---

## GET /rooms/:code

Fetch current room snapshot.

**Query parameters**:
- `participantId` (optional, string) — viewer's participant ID

**Response (200)**:
```json
{
  "room": {
    "code": "X7K2",
    "status": "lobby",
    "hostId": "uuid-abc-123",
    "participants": [
      { "id": "uuid-abc-123", "name": "Alice", "joinedAt": "..." },
      { "id": "uuid-def-456", "name": "Bob", "joinedAt": "..." }
    ],
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

**Errors**:
- `404` — Room code not found

---

## POST /rooms/:code/start

Start the game (host only).

**Request**:
```json
{
  "participantId": "uuid-abc-123"
}
```

**Response (200)**:
```json
{
  "room": {
    "code": "X7K2",
    "status": "active",
    "hostId": "uuid-abc-123",
    "participants": [
      { "id": "uuid-abc-123", "name": "Alice", "joinedAt": "..." },
      { "id": "uuid-def-456", "name": "Bob", "joinedAt": "..." }
    ],
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

**Errors**:
- `403` — Caller is not the host → `"Only the host can start the game."`
- `400` — Fewer than 2 players → `"Need at least 2 players to start."`
- `404` — Room code not found
