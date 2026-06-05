import { Link } from "react-router-dom";
import { LegalDocument } from "../components/LegalDocument";
import { SITE_NAME, TERMS_EFFECTIVE_DATE, TERMS_SECTIONS } from "../content/legal";

export function TermsPage() {
  return (
    <main className="legal-page">
      <LegalDocument
        title="Terms of Use"
        effectiveDate={TERMS_EFFECTIVE_DATE}
        intro={`These terms apply to your use of the hosted ${SITE_NAME} service at scrumretrospective.org.`}
        sections={TERMS_SECTIONS}
      />
      <p className="legal-page__back">
        <Link to="/">← Back to home</Link>
      </p>
    </main>
  );
}
