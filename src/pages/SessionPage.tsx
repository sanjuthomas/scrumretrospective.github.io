import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { CopyLinkButton } from "../components/CopyLinkButton";
import { PageCard } from "../components/PageCard";
import { ParticipantPane } from "../components/ParticipantPane";
import { FourLsBoard } from "../components/FourLsBoard";
import { usePresence } from "../hooks/usePresence";
import { useRetro } from "../hooks/useRetro";
import { downloadRetroPdf } from "../lib/exportRetroPdf";
import { formatRetroCreatedAt } from "../lib/formatDate";
import { getPhaseLabel, isResultsPhase } from "../lib/phases";
import {
  endRetro,
  getJoinUrl,
  getParticipantSession,
  startRetro,
  startVoting,
  closeVoting,
} from "../lib/retroStore";

export function SessionPage() {
  const { retroId } = useParams<{ retroId: string }>();
  const navigate = useNavigate();
  const currentParticipantId = retroId
    ? getParticipantSession(retroId)
    : null;
  const { retro, loading } = useRetro(retroId, currentParticipantId);

  usePresence(retroId, currentParticipantId);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [startingVoting, setStartingVoting] = useState(false);
  const [startVotingError, setStartVotingError] = useState<string | null>(null);
  const [closingVoting, setClosingVoting] = useState(false);
  const [closeVotingError, setCloseVotingError] = useState<string | null>(null);
  const [endingRetro, setEndingRetro] = useState(false);
  const [endRetroError, setEndRetroError] = useState<string | null>(null);

  if (!retroId) {
    return (
      <main className="center-page">
        <PageCard title="Invalid session">
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
        <PageCard title="Loading session…">
          <p className="loading-text">Connecting to the retrospective.</p>
        </PageCard>
      </main>
    );
  }

  if (!retro) {
    return (
      <main className="center-page">
        <PageCard title="Session not found">
          <p className="muted">
            This retrospective is not available in your browser. If you are the
            initiator, start a new one. If you are a participant, use the join
            link from your facilitator.
          </p>
          <Link className="text-link" to="/">
            Go home
          </Link>
        </PageCard>
      </main>
    );
  }

  const joinUrl = getJoinUrl(retroId);
  const isInitiator = retro.participants.some(
    (p) => p.id === currentParticipantId && p.isInitiator,
  );

  const participants = retro.participants.map((p) => ({
    ...p,
    online:
      p.online === true ||
      (currentParticipantId != null && p.id === currentParticipantId),
  }));

  const initiator = retro.participants.find((p) => p.isInitiator);
  const phase = retro.phase ?? "assembly";
  const isAssembly = phase === "assembly";
  const isActive = phase === "active";
  const isVoting = phase === "voting";
  const isResults = isResultsPhase(phase);

  async function handleStartRetro() {
    if (!retroId || starting || !isInitiator || !isAssembly) return;
    setStarting(true);
    setStartError(null);
    try {
      await startRetro(retroId);
    } catch (err) {
      setStartError(
        err instanceof Error ? err.message : "Could not start retrospective.",
      );
    } finally {
      setStarting(false);
    }
  }

  async function handleStartVoting() {
    if (!retroId || startingVoting || !isInitiator || !isActive) return;
    setStartingVoting(true);
    setStartVotingError(null);
    try {
      await startVoting(retroId);
    } catch (err) {
      setStartVotingError(
        err instanceof Error ? err.message : "Could not start voting.",
      );
    } finally {
      setStartingVoting(false);
    }
  }

  async function handleCloseVoting() {
    if (!retroId || closingVoting || !isInitiator || !isVoting) return;
    setClosingVoting(true);
    setCloseVotingError(null);
    try {
      await closeVoting(retroId, currentParticipantId);
    } catch (err) {
      setCloseVotingError(
        err instanceof Error ? err.message : "Could not close voting.",
      );
    } finally {
      setClosingVoting(false);
    }
  }

  async function handleEndRetro() {
    if (!retroId || !retro || endingRetro || !isInitiator || !isResults) return;
    setEndingRetro(true);
    setEndRetroError(null);
    try {
      downloadRetroPdf(retro);
      await endRetro(retroId);
      navigate("/");
    } catch (err) {
      setEndRetroError(
        err instanceof Error ? err.message : "Could not end retrospective.",
      );
    } finally {
      setEndingRetro(false);
    }
  }

  return (
    <div className="session-layout">
      <ParticipantPane
        participants={participants}
        currentParticipantId={currentParticipantId}
      />
      <main className="session-main">
        <div className="session-top">
          <section className="session-top__card session-top__info">
            <h1 className="session-top__title">{retro.name}</h1>
            <dl className="session-details">
              <div className="session-details__row">
                <dt>Initiator</dt>
                <dd>{initiator?.fullName ?? "—"}</dd>
              </div>
              <div className="session-details__row">
                <dt>Created</dt>
                <dd>{formatRetroCreatedAt(retro.createdAt)}</dd>
              </div>
            </dl>
            <div className="session-top__phase-row">
              <p className="session-top__phase">{getPhaseLabel(phase)}</p>
              {isInitiator && isActive && (
                <Button
                  className="session-top__phase-btn"
                  disabled={startingVoting}
                  onClick={handleStartVoting}
                >
                  {startingVoting ? "Starting…" : "Start Voting"}
                </Button>
              )}
              {isInitiator && isVoting && (
                <Button
                  className="session-top__phase-btn"
                  disabled={closingVoting}
                  onClick={handleCloseVoting}
                >
                  {closingVoting ? "Closing…" : "Close Voting"}
                </Button>
              )}
              {isInitiator && isResults && (
                <Button
                  className="session-top__phase-btn"
                  disabled={endingRetro}
                  onClick={handleEndRetro}
                >
                  {endingRetro ? "Exporting…" : "End Retrospective"}
                </Button>
              )}
            </div>
            {(startVotingError || closeVotingError || endRetroError) && (
              <p className="error-text session-top__phase-error">
                {startVotingError ?? closeVotingError ?? endRetroError}
              </p>
            )}
          </section>

          {isInitiator && (isAssembly || isActive) && (
            <section className="session-top__card session-top__invite">
              <h2 className="session-top__invite-title">Invite your team</h2>
              <p className="session-top__invite-text">
                Share this link so participants can join. They will enter their
                name before joining.
              </p>
              <CopyLinkButton url={joinUrl} />
            </section>
          )}

          {!isInitiator && currentParticipantId && isAssembly && (
            <section className="session-top__card session-top__aside">
              <p className="session-top__invite-text">
                You have joined the retrospective. Waiting for the facilitator
                to continue.
              </p>
            </section>
          )}

          {!isInitiator && currentParticipantId && isActive && (
            <section className="session-top__card session-top__aside">
              <p className="session-top__invite-text">
                The retrospective is in progress. Add your items to the board
                below.
              </p>
            </section>
          )}

          {!isInitiator && currentParticipantId && isVoting && (
            <section className="session-top__card session-top__aside">
              <p className="session-top__invite-text">
                Voting is open. Use the thumbs up or down buttons on items from
                other participants.
              </p>
            </section>
          )}

          {!isInitiator && currentParticipantId && isResults && (
            <section className="session-top__card session-top__aside">
              <p className="session-top__invite-text">
                Voting is closed. Review the results sorted by net votes in each
                column.
              </p>
            </section>
          )}

          {!currentParticipantId && (
            <section className="session-top__card session-top__aside">
              <p className="session-top__invite-text muted">
                You are viewing this session without an active participant
                identity.
              </p>
              <Link className="text-link" to={`/join/${retroId}`}>
                Join this retrospective
              </Link>
            </section>
          )}
        </div>

        {isInitiator && isAssembly && (
          <div className="session-center">
            <div className="session-center__action">
              <Button
                className="session-center__btn"
                disabled={starting}
                onClick={handleStartRetro}
              >
                {starting ? "Starting…" : "Start Your Retrospective"}
              </Button>
              {startError && (
                <p className="error-text session-center__error">{startError}</p>
              )}
            </div>
          </div>
        )}

        {!isAssembly && (
          <FourLsBoard
            retro={retro}
            retroId={retroId}
            phase={phase}
            currentParticipantId={currentParticipantId}
          />
        )}
      </main>
    </div>
  );
}
