import { Outlet } from "react-router-dom";
import { SiteFooter } from "./SiteFooter";

export function AppLayout() {
  return (
    <div className="app-layout">
      <Outlet />
      <SiteFooter />
    </div>
  );
}
