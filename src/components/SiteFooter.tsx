import { Link } from "react-router-dom";
import { COPYRIGHT_OWNER, COPYRIGHT_YEAR, SITE_NAME } from "../content/legal";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer__copy">
        © {COPYRIGHT_YEAR} {COPYRIGHT_OWNER}. {SITE_NAME} is provided as is with
        no warranty.
      </p>
      <nav className="site-footer__nav" aria-label="Legal">
        <Link to="/terms">Terms of Use</Link>
        <span className="site-footer__sep" aria-hidden="true">
          ·
        </span>
        <Link to="/license">MIT License</Link>
      </nav>
    </footer>
  );
}
