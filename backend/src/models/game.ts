export type ParticipantRole = "drawer" | "guesser";
export type RoomStatus = "lobby" | "active";

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
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}
