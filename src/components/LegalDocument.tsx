import type { LegalSection } from "../content/legal";

interface LegalDocumentProps {
  title: string;
  effectiveDate?: string;
  intro?: string;
  sections: LegalSection[];
}

export function LegalDocument({
  title,
  effectiveDate,
  intro,
  sections,
}: LegalDocumentProps) {
  return (
    <article className="legal-doc">
      <header className="legal-doc__header">
        <h1 className="legal-doc__title">{title}</h1>
        {effectiveDate && (
          <p className="legal-doc__meta">Effective date: {effectiveDate}</p>
        )}
        {intro && <p className="legal-doc__intro">{intro}</p>}
      </header>
      {sections.map((section) => (
        <section key={section.title} className="legal-doc__section">
          <h2 className="legal-doc__section-title">{section.title}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={index} className="legal-doc__paragraph">
              {paragraph}
            </p>
          ))}
          {section.list && (
            <ul className="legal-doc__list">
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
