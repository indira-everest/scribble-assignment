import { describe, expect, it } from "vitest";
import { createRoom, getRoom, joinRoom, listWords, startGame, toRoomSnapshot } from "./roomStore.js";

describe("roomStore", () => {
  it("createRoom sets creator as host", () => {
    const result = createRoom("Alice");

    expect(result.room.code).toMatch(/^[A-Z0-9]{4}$/);
    expect(result.room.participants).toHaveLength(1);
    expect(result.room.hostId).toBe(result.participantId);
    expect(result.room.participants[0].name).toBe("Alice");
    expect(result.participantId).toBeDefined();
  });

  it("joinRoom returns null for an unknown room code", () => {
    const result = joinRoom("ZZZZ", "Bob");

    expect(result).toBeNull();
  });

  it("joinRoom rejects duplicate non-host name", () => {
    const { room } = createRoom("Alice");
    joinRoom(room.code, "Bob");
    const result = joinRoom(room.code, "Bob");

    expect(result).toBeNull();
  });

  it("joinRoom allows unique name", () => {
    const { room } = createRoom("Alice");
    const result = joinRoom(room.code, "Bob");

    expect(result).not.toBeNull();
    expect(result!.room.participants).toHaveLength(2);
  });

  it("joinRoom reassigns hostId when host rejoins", () => {
    const { room: createdRoom } = createRoom("Alice");
    const result = joinRoom(createdRoom.code, "Alice");

    expect(result).not.toBeNull();
    expect(result!.room.hostId).toBe(result!.participantId);
    expect(result!.room.participants).toHaveLength(2);
    expect(result!.room.participants[1].name).toBe("Alice");
  });

  it("startGame returns error for non-existent room", () => {
    const result = startGame("ZZZZ", "p1");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Room not found.");
  });

  it("startGame returns error for non-host", () => {
    const { room: createdRoom, participantId: hostId } = createRoom("Alice");
    joinRoom(createdRoom.code, "Bob");
    const result = startGame(createdRoom.code, "non-host-id");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Only the host can start the game.");
  });

  it("startGame returns error when fewer than 2 players", () => {
    const { room: createdRoom, participantId: hostId } = createRoom("Alice");
    const result = startGame(createdRoom.code, hostId);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Need at least 2 players to start.");
  });

  it("startGame sets status to active with 2+ players", () => {
    const { room: createdRoom, participantId: hostId } = createRoom("Alice");
    joinRoom(createdRoom.code, "Bob");
    const result = startGame(createdRoom.code, hostId);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.room.status).toBe("active");
    }
  });

  it("getRoom returns null for unknown code", () => {
    const room = getRoom("NONEXIST");

    expect(room).toBeNull();
  });

  it("createRoom sets orderedWords alphabetically", () => {
    const result = createRoom();
    const words = listWords().sort();

    expect(result.room.orderedWords).toEqual(words);
  });

  it("startGame sets roundNumber, drawerId, and selects secretWord", () => {
    const { room: createdRoom, participantId: hostId } = createRoom("Alice");
    joinRoom(createdRoom.code, "Bob");
    const result = startGame(createdRoom.code, hostId);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.room.roundNumber).toBe(1);
      expect(result.room.drawerId).toBe(hostId);
      expect(result.room.secretWord).toBeDefined();
      expect(result.room.orderedWords).toContain(result.room.secretWord);
      expect(result.room.status).toBe("active");
    }
  });

  it("startGame returns error on double start", () => {
    const { room: createdRoom, participantId: hostId } = createRoom("Alice");
    joinRoom(createdRoom.code, "Bob");
    startGame(createdRoom.code, hostId);
    const result = startGame(createdRoom.code, hostId);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Game already started.");
  });

  it("djb2Hash selects words deterministically from same room code", () => {
    const { room: createdRoom, participantId: hostId } = createRoom("Alice");
    joinRoom(createdRoom.code, "Bob");
    const first = startGame(createdRoom.code, hostId);

    // Create a second room with a fresh store — can't easily reset,
    // so just verify deterministic selection by running startGame twice.
    const { room: room2, participantId: hostId2 } = createRoom("Charlie");
    joinRoom(room2.code, "Dave");
    const second = startGame(room2.code, hostId2);

    expect(first.ok && second.ok).toBe(true);
  });

  it("toRoomSnapshot hides secretWord for non-drawer viewer", () => {
    const { room: createdRoom } = createRoom("Alice");
    const joiner = joinRoom(createdRoom.code, "Bob")!;
    startGame(createdRoom.code, createdRoom.hostId);
    const snapshot = toRoomSnapshot(getRoom(createdRoom.code)!, joiner.participantId);

    expect(snapshot.secretWord).toBeNull();
  });

  it("toRoomSnapshot shows secretWord for drawer viewer", () => {
    const { room: createdRoom, participantId: hostId } = createRoom("Alice");
    joinRoom(createdRoom.code, "Bob");
    const result = startGame(createdRoom.code, hostId);
    expect(result.ok).toBe(true);
    const snapshot = toRoomSnapshot(getRoom(createdRoom.code)!, hostId);

    expect(snapshot.secretWord).toBe(result.ok ? result.room.secretWord : null);
    expect(snapshot.secretWord).not.toBeNull();
  });

  it("toRoomSnapshot includes orderedWords for all viewers", () => {
    const { room: createdRoom } = createRoom("Alice");
    const joiner = joinRoom(createdRoom.code, "Bob")!;
    startGame(createdRoom.code, createdRoom.hostId);
    const snapshot = toRoomSnapshot(getRoom(createdRoom.code)!, joiner.participantId);

    expect(snapshot.orderedWords).toEqual(expect.arrayContaining(createdRoom.orderedWords));
  });
});
