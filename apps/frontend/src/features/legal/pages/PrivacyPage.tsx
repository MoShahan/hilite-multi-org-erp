import { LegalPageLayout } from "../components/LegalPageLayout";
import { privacyPolicyContent } from "../content/privacyPolicy";

export const PrivacyPage = () => {
  return <LegalPageLayout {...privacyPolicyContent} />;
};
