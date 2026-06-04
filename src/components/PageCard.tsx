import type { ReactNode } from "react";

interface PageCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
}

export function PageCard({ title, subtitle, children, wide }: PageCardProps) {
  return (
    <div className={`page-card${wide ? " page-card--wide" : ""}`}>
      {title && <h1 className="page-card__title">{title}</h1>}
      {subtitle && <p className="page-card__subtitle">{subtitle}</p>}
      {children}
    </div>
  );
}
