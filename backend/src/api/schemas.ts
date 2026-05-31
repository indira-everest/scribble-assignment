import { z } from "zod";

export const createRoomSchema = z.object({
  playerName: z.string().trim().min(1, "Name cannot be empty").optional()
});

export const joinRoomSchema = z.object({
  playerName: z.string().trim().min(1, "Name cannot be empty").optional()
});

export const roomCodeParamsSchema = z.object({
  code: z.string()
});

export const roomViewerQuerySchema = z.object({
  participantId: z.coerce.string().optional()
});

export const startGameSchema = z.object({
  participantId: z.string().min(1, "participantId is required.")
});

const pointSchema = z.object({
  x: z.number(),
  y: z.number()
});

export const strokeSchema = z.object({
  participantId: z.string().min(1, "participantId is required."),
  stroke: z.object({
    points: z.array(pointSchema).min(2, "Stroke must have at least 2 points.")
  })
});

export const clearStrokesSchema = z.object({
  participantId: z.string().min(1, "participantId is required.")
});

export const guessSchema = z.object({
  participantId: z.string().min(1, "participantId is required."),
  text: z.string().trim().min(1, "Guess cannot be empty.")
});

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
