import { type FormEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { PageCard } from "../components/PageCard";
import { useRetro } from "../hooks/useRetro";
import { addParticipant, saveParticipantSession } from "../lib/retroStore";

export function JoinPage() {
  const { retroId } = useParams<{ retroId: string }>();
  const navigate = useNavigate();
  const { retro, loading } = useRetro(retroId);
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!retroId || !fullName.trim() || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const result = await addParticipant(retroId, fullName);
      if (!result) {
        setError("This retrospective could not be found.");
        setSubmitting(false);
        return;
      }
      saveParticipantSession(retroId, result.participantId);
      navigate(`/retro/${retroId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not join. Try again.",
      );
      setSubmitting(false);
    }
  }

  if (!retroId) {
    return (
      <main className="center-page">
        <PageCard title="Invalid link">
          <p className="muted">This join link is not valid.</p>
          <Link className="text-link" to="/">
            Go home
          </Link>
        </PageCard>
      </main>
    );
  }

  if (loading && !retro) {
    return (
      <main className="center-page">
        <PageCard title="Loading retrospective…">
          <p className="loading-text">Fetching session details.</p>
        </PageCard>
      </main>
    );
  }

  if (!retro) {
    return (
      <main className="center-page">
        <PageCard title="Retrospective not found">
          <p className="muted">
            This link is invalid, or the session has ended. Ask the facilitator
            for a new join link and make sure the app is running with the sync
            server.
          </p>
          <Link className="text-link" to="/">
            Go home
          </Link>
        </PageCard>
      </main>
    );
  }

  const canSubmit = fullName.trim().length > 0 && !submitting;

  return (
    <main className="center-page">
      <PageCard
        title={`Join ${retro.name}`}
        subtitle="Enter your full name to join the retrospective."
      >
        <form className="form" onSubmit={handleSubmit}>
          <label className="form__field">
            <span className="form__label">Your full name</span>
            <input
              className="form__input"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Kim"
              autoComplete="name"
              required
            />
          </label>
          {error && <p className="error-text">{error}</p>}
          <Button type="submit" disabled={!canSubmit}>
            {submitting ? "Joining…" : `Join ${retro.name} Now!`}
          </Button>
        </form>
      </PageCard>
    </main>
  );
}
