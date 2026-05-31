export type ParticipantRole = "drawer" | "guesser";
export type RoomStatus = "lobby" | "active" | "results";

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
}

export interface GuessEntry {
  participantId: string;
  text: string;
  isCorrect: boolean;
  timestamp: string;
}

export interface Participant {
  id: string;
  name: string;
  joinedAt: string;
}

export interface Room {
  code: string;
  status: RoomStatus;
  hostId: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
  roundNumber: number;
  drawerId: string | null;
  secretWord: string | null;
  orderedWords: string[];
  strokes: Stroke[];
  guesses: GuessEntry[];
  scores: Record<string, number>;
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  hostId: string;
  participants: Participant[];
  availableWords: string[];
  roles: ParticipantRole[];
  roundNumber: number;
  drawerId: string | null;
  secretWord: string | null;
  orderedWords: string[];
  strokes: Stroke[];
  guesses: GuessEntry[];
  scores: Record<string, number>;
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}
