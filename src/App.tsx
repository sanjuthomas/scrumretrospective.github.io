import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { InitiatePage } from "./pages/InitiatePage";
import { JoinPage } from "./pages/JoinPage";
import { LandingPage } from "./pages/LandingPage";
import { LicensePage } from "./pages/LicensePage";
import { SessionPage } from "./pages/SessionPage";
import { TermsPage } from "./pages/TermsPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/initiate" element={<InitiatePage />} />
          <Route path="/retro/:retroId" element={<SessionPage />} />
          <Route path="/join/:retroId" element={<JoinPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/license" element={<LicensePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
