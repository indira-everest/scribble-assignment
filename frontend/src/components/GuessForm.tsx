import { useState } from "react";

interface GuessFormProps {
  disabled?: boolean;
  onSubmit: (text: string) => Promise<boolean>;
}

export function GuessForm({ disabled = false, onSubmit }: GuessFormProps) {
  const [guessText, setGuessText] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = guessText.trim();

    if (!trimmed) {
      setError("Guess cannot be empty.");
      return;
    }

    setError(null);
    setResult(null);
    setSubmitting(true);

    try {
      const isCorrect = await onSubmit(trimmed);
      setResult(isCorrect);
      setGuessText("");
    } catch {
      setError("Failed to submit guess.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="form__field">
        <input
          className="form__input"
          value={guessText}
          onChange={(event) => setGuessText(event.target.value)}
          placeholder="Type your guess here..."
          disabled={disabled || submitting}
        />
      </label>
      {error ? <p className="form__error">{error}</p> : null}
      {result !== null ? (
        <p className={`guess-feedback ${result ? "guess-feedback--correct" : "guess-feedback--incorrect"}`}>
          {result ? "Correct!" : "Incorrect"}
        </p>
      ) : null}
      <div className="button-row button-row--compact">
        <button className="button button--primary" type="submit" disabled={disabled || submitting}>
          {submitting ? "Submitting..." : "Submit Guess"}
        </button>
      </div>
    </form>
  );
}
