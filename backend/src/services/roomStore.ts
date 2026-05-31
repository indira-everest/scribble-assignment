import { randomUUID } from "node:crypto";
import type { Participant, Room, RoomSnapshot } from "../models/game.js";
import { STARTER_ROLES, STARTER_WORDS } from "../seed/starterData.js";

function djb2Hash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) & 0xffffffff;
  }
  return hash >>> 0;
}

const rooms = new Map<string, Room>();

function now() {
  return new Date().toISOString();
}

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 4; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function generateUniqueCode() {
  let code = generateCode();

  while (rooms.has(code)) {
    code = generateCode();
  }

  return code;
}

function displayName(name?: string) {
  return name || "Player";
}

function createParticipant(name?: string): Participant {
  return {
    id: randomUUID(),
    name: displayName(name),
    joinedAt: now()
  };
}

function cloneRoom(room: Room) {
  return structuredClone(room);
}

export function listWords() {
  return [...STARTER_WORDS];
}

export function createRoom(playerName?: string) {
  const participant = createParticipant(playerName);
  const room: Room = {
    code: generateUniqueCode(),
    status: "lobby",
    hostId: participant.id,
    participants: [participant],
    createdAt: now(),
    updatedAt: now(),
    roundNumber: 0,
    drawerId: null,
    secretWord: null,
    orderedWords: [...STARTER_WORDS].sort()
  };

  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function joinRoom(code: string, playerName?: string) {
  const room = rooms.get(code);

  if (!room) {
    return null;
  }

  const name = displayName(playerName);
  const existingHost = room.participants.find((p) => p.id === room.hostId);

  if (existingHost && existingHost.name === name) {
    const participant = createParticipant(playerName);
    room.hostId = participant.id;
    room.participants.push(participant);
    room.updatedAt = now();
    rooms.set(room.code, room);

    return {
      room: cloneRoom(room),
      participantId: participant.id
    };
  }

  if (room.participants.some((p) => p.name === name)) {
    return null;
  }

  const participant = createParticipant(playerName);
  room.participants.push(participant);
  room.updatedAt = now();
  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function getRoom(code: string) {
  const room = rooms.get(code);
  return room ? cloneRoom(room) : null;
}

export function startGame(code: string, participantId: string) {
  const room = rooms.get(code);

  if (!room) {
    return { ok: false as const, error: "Room not found." };
  }

  if (room.hostId !== participantId) {
    return { ok: false as const, error: "Only the host can start the game." };
  }

  if (room.participants.length < 2) {
    return { ok: false as const, error: "Need at least 2 players to start." };
  }

  if (room.status === "active") {
    return { ok: false as const, error: "Game already started." };
  }

  if (room.orderedWords.length === 0) {
    return { ok: false as const, error: "No words available." };
  }

  const hash = djb2Hash(`${room.code}-${1}`);
  const wordIndex = hash % room.orderedWords.length;
  const selectedWord = room.orderedWords[wordIndex];

  room.status = "active";
  room.roundNumber = 1;
  room.drawerId = room.hostId;
  room.secretWord = selectedWord;
  room.updatedAt = now();
  rooms.set(room.code, room);

  return { ok: true as const, room: cloneRoom(room) };
}

export function saveRoom(room: Room) {
  room.updatedAt = now();
  rooms.set(room.code, cloneRoom(room));
  return getRoom(room.code);
}

export function toRoomSnapshot(room: Room, viewerParticipantId?: string): RoomSnapshot {
  return {
    code: room.code,
    status: room.status,
    hostId: room.hostId,
    participants: room.participants.map((participant) => ({ ...participant })),
    availableWords: listWords(),
    roles: [...STARTER_ROLES],
    roundNumber: room.roundNumber,
    drawerId: room.drawerId,
    secretWord: viewerParticipantId === room.drawerId ? room.secretWord : null,
    orderedWords: [...room.orderedWords]
  };
}
