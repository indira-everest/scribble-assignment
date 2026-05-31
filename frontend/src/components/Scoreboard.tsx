import type { Participant } from "../services/api";
import { Card } from "./Card";

interface ScoreboardProps {
  scores: Record<string, number>;
  participants: Participant[];
}

export function Scoreboard({ scores, participants }: ScoreboardProps) {
  return (
    <Card title="Scoreboard">
      {participants.length === 0 ? (
        <div className="placeholder-block" style={{ backgroundColor: '#f9fafb' }}>
          <div className="placeholder-row">
            <span>Waiting for players...</span>
          </div>
        </div>
      ) : (
        <ul className="score-list">
          {participants.map((p) => (
            <li key={p.id} className="score-entry">
              <span className="score-entry__name">{p.name}</span>
              <strong className="score-entry__value">{scores[p.id] ?? 0}</strong>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
