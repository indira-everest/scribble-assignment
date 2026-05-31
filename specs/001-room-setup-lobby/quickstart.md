# Quickstart: Room Setup & Lobby

## Prerequisites

- Node.js 18+ and npm 9+
- Two browser tabs (for multi-player testing)

## Setup

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev
# → http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Verification

### 1. Create a room (host)

1. Open `http://localhost:5173` in Tab A
2. Click "Create Room"
3. Enter a player name (or leave default)
4. Click "Create Room"
5. ✅ You are taken to the lobby. Your name appears in the participant list.
6. ✅ A room code is displayed (4-character code).
7. ✅ You are identified as the host.
8. ✅ "Start Game" button is disabled, showing "Waiting for players..."

### 2. Join the room (guest)

1. Open `http://localhost:5173` in Tab B
2. Click "Join Room"
3. Enter the room code from Tab A
4. Enter a different player name
5. Click "Join Room"
6. ✅ You are taken to the lobby. Both names appear in the participant list.

### 3. Verify lobby polling

- ✅ Within ~2 seconds of Tab B joining, Tab A shows both participants.
- ✅ The host sees an enabled "Start Game" button.

### 4. Verify validation

- Join with empty code → error: "Please enter a room code."
- Join with non-existent code → error: "Room not found. Check your code and try again."
- Join with same name as existing player → error: "Name already taken."
- Same player re-joins → error: "Already in this room."

### 5. Start the game

1. In Tab A (host), click "Start Game"
2. ✅ Both tabs transition to the game screen.
3. ✅ Non-host Tab B could not start the game (button disabled/hidden).

### 6. Verify room isolation

1. Create Room C in a third tab
2. Tab A and Tab C show completely separate participant lists.

## Tests

```bash
cd backend
npm test
# → RoomStore tests pass (host assignment, validation, start game)

cd frontend
npm test
# → API tests pass (create, join, start game request shapes)
```

## Troubleshooting

- **Frontend can't reach backend**: Verify backend is on port `3001`. Check `VITE_API_URL` in frontend `.env`.
- **Port conflict**: `PORT=3002 npm run dev` in backend.
