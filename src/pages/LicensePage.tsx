import { Link } from "react-router-dom";
import {
  COPYRIGHT_OWNER,
  COPYRIGHT_YEAR,
  MIT_LICENSE_BODY,
} from "../content/legal";

export function LicensePage() {
  return (
    <main className="legal-page">
      <article className="legal-doc">
        <header className="legal-doc__header">
          <h1 className="legal-doc__title">MIT License</h1>
          <p className="legal-doc__meta">
            Copyright (c) {COPYRIGHT_YEAR} {COPYRIGHT_OWNER}
          </p>
          <p className="legal-doc__intro">
            The source code for this project is available under the MIT License.
            A copy is also in the <code>LICENSE</code> file in the repository.
          </p>
        </header>
        <pre className="legal-doc__license">{MIT_LICENSE_BODY}</pre>
      </article>
      <p className="legal-page__back">
        <Link to="/">← Back to home</Link>
      </p>
    </main>
  );
}
