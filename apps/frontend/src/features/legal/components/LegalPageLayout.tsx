import { Link } from "react-router-dom";

import { HiliteLogo } from "@/components/HiliteLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

import type { LegalSection } from "../types";

type LegalPageLayoutProps = {
  title: string;
  lastUpdated: string;
  disclaimer: string;
  sections: LegalSection[];
  otherLegalPage: {
    label: string;
    href: string;
  };
};

export const LegalPageLayout = ({
  title,
  lastUpdated,
  disclaimer,
  sections,
  otherLegalPage,
}: LegalPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            to="/login"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <HiliteLogo />
            <span className="text-sm font-medium">HILITE Sales OS</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <p className="mb-8 rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          {disclaimer}
        </p>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">
                {section.title}
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t bg-background">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 px-6 py-6 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <Link
            to={otherLegalPage.href}
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            {otherLegalPage.label}
          </Link>
          <Link
            to="/login"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Back to login
          </Link>
        </div>
      </footer>
    </div>
  );
};
