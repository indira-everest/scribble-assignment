# Quickstart: Game Start & Drawer Flow

**Branch**: `002-game-start-drawer-flow`

## Setup

```bash
cd backend && npm install && cd ../frontend && npm install && cd ..
```

## Running

```bash
# Terminal 1 — Backend (port 3001)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open `http://localhost:5173` in two browser tabs.

## Verification

### US1 — Game Start & Role Assignment

1. **Tab A**: Enter name "Alice" → Create Room → note room code (e.g., `ABCD`)
2. **Tab B**: Enter name "Bob" → Join Room → enter code `ABCD`
3. **Tab A** (lobby): See Bob in participant list, see "host" badge on Alice
4. **Tab A**: Click "Start Game" (enabled because ≥2 players)
5. Both tabs navigate to `/game`
6. **Tab A** (drawer): See secret word displayed with "Your word" label
7. **Tab B** (guesser): See "Waiting for the drawer..." or placeholder — no word visible
8. **Tab B** participant list: See "Alice" marked as "Drawing"

### US2 — Name Validation

1. Create/Join Room: submit empty name → see error "Name cannot be empty"
2. Create/Join Room: submit "   " (whitespace) → see error "Name cannot be empty"
3. Create/Join Room: submit "  Alice  " → name accepted as "Alice" (trimmed)

### US3 — Drawer Identification

1. Start game with 2+ players
2. All tabs: see "Alice" highlighted with "Drawing" badge in participant list
3. **Tab B**: Poll room state — `drawerId` matches Alice's participant ID

### Error Cases

- Start game with only 1 player → button disabled with "Need at least 2 players"
- Double-click "Start Game" → first click succeeds, second returns 409
- Try to start as non-host → 403 "Only the host can start the game."

## Testing

```bash
cd backend && npm test    # Vitest — 14+ tests
cd ../frontend && npm test # Vitest — 3+ tests
```
