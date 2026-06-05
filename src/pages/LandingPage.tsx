import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { PageCard } from "../components/PageCard";
import { RetroFlowMap } from "../components/RetroFlowMap";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="landing-page">
      <div className="landing-page__hero">
        <PageCard
          title="Scrum Retrospective"
          subtitle="Facilitate focused retrospectives with your team — no accounts required."
        >
          <Button onClick={() => navigate("/initiate")}>
            Initiate a Retrospective
          </Button>
        </PageCard>
      </div>
      <RetroFlowMap />
    </main>
  );
}
