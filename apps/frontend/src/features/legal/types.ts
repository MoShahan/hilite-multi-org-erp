export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalPageContent = {
  title: string;
  lastUpdated: string;
  disclaimer: string;
  sections: LegalSection[];
  otherLegalPage: {
    label: string;
    href: string;
  };
};
