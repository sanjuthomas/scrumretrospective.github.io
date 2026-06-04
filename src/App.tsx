import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { InitiatePage } from "./pages/InitiatePage";
import { JoinPage } from "./pages/JoinPage";
import { LandingPage } from "./pages/LandingPage";
import { SessionPage } from "./pages/SessionPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/initiate" element={<InitiatePage />} />
        <Route path="/retro/:retroId" element={<SessionPage />} />
        <Route path="/join/:retroId" element={<JoinPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
