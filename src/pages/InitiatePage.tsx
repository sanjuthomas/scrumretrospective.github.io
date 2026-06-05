import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { PageCard } from "../components/PageCard";
import {
  createRetro,
  saveFacilitatorSession,
  saveParticipantSession,
} from "../lib/retroStore";
import { RETRO_TEMPLATES, type RetroTemplate } from "../lib/templates";

export function InitiatePage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [retroName, setRetroName] = useState("");
  const [template, setTemplate] = useState<RetroTemplate | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const name = fullName.trim();
    const title = retroName.trim();
    if (!name || !title || !template || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const { retro, participantId } = await createRetro(title, name, template);
      saveParticipantSession(retro.id, participantId);
      saveFacilitatorSession(retro.id, participantId);
      navigate(`/retro/${retro.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not start retrospective. Try again.",
      );
      setSubmitting(false);
    }
  }

  const canSubmit =
    fullName.trim().length > 0 &&
    retroName.trim().length > 0 &&
    template !== "" &&
    !submitting;

  return (
    <main className="center-page">
      <PageCard title="Start a retrospective">
        <form className="form" onSubmit={handleSubmit}>
          <label className="form__field">
            <span className="form__label">Your full name</span>
            <input
              className="form__input"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
              required
            />
          </label>
          <label className="form__field">
            <span className="form__label">Name your retrospective</span>
            <input
              className="form__input"
              type="text"
              value={retroName}
              onChange={(e) => setRetroName(e.target.value)}
              placeholder="Sprint 42 Retro"
              required
            />
          </label>
          <label className="form__field">
            <span className="form__label">Retrospective template</span>
            <select
              className="form__input form__select"
              value={template}
              onChange={(e) =>
                setTemplate(e.target.value as RetroTemplate | "")
              }
              required
            >
              <option value="" disabled>
                Select a template…
              </option>
              {RETRO_TEMPLATES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} — {option.description}
                </option>
              ))}
            </select>
          </label>
          {error && <p className="error-text">{error}</p>}
          <Button type="submit" disabled={!canSubmit}>
            {submitting ? "Creating…" : "Create Your Retrospective"}
          </Button>
        </form>
      </PageCard>
    </main>
  );
}
