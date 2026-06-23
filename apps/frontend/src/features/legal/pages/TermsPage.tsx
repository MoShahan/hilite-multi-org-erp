import { LegalPageLayout } from "../components/LegalPageLayout";
import { termsAndConditionsContent } from "../content/termsAndConditions";

export const TermsPage = () => {
  return <LegalPageLayout {...termsAndConditionsContent} />;
};
