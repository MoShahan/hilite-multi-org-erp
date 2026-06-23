import type { LegalPageContent } from "../types";

export const privacyPolicyContent: LegalPageContent = {
  title: "Privacy Policy",
  lastUpdated: "June 24, 2026",
  disclaimer:
    "This document is provided for demonstration purposes as part of the HILITE Sales OS MVP.",
  otherLegalPage: {
    label: "Terms & Conditions",
    href: "/terms",
  },
  sections: [
    {
      title: "Introduction",
      paragraphs: [
        "HILITE Sales OS is a multi-tenant sales management platform operated for authorized business users. This Privacy Policy explains how we collect, use, and protect information when you access or use the service.",
        "By using HILITE Sales OS, you acknowledge that you have read and understood this Privacy Policy.",
      ],
    },
    {
      title: "Information We Collect",
      paragraphs: [
        "We collect information necessary to operate the platform, including account details (such as your name and email address), authentication credentials (stored as secure password hashes), organization and team membership, role assignments, lead and activity records you create or manage, in-app notification data, and technical usage or access logs generated when you use the service.",
        "Lead records may include contact details and business information entered by your organization. Your organization controls what lead data is stored in the system.",
      ],
    },
    {
      title: "How We Use Information",
      paragraphs: [
        "We use collected information to provide and maintain the service, enforce role-based access controls, deliver in-app notifications, power dashboards and reporting, protect the security and integrity of the platform, and improve the service over time.",
        "We do not use your organization's lead or customer data for advertising purposes.",
      ],
    },
    {
      title: "Multi-Tenant Data Handling",
      paragraphs: [
        "HILITE Sales OS is designed for multi-tenant use. Data entered by your organization is scoped to that organization and is accessible only to users with appropriate permissions within that organization.",
        "Platform administrators may access cross-organization data solely for platform administration, support, and security purposes.",
      ],
    },
    {
      title: "Data Sharing",
      paragraphs: [
        "We do not sell personal data. We may share information with service providers who assist in operating the platform, when required by law, or to protect the rights, safety, and security of HILITE, our users, or others.",
        "Any sharing is limited to what is necessary for the stated purpose.",
      ],
    },
    {
      title: "Data Retention",
      paragraphs: [
        "We retain information for as long as your account and organization remain active and as needed to provide the service. When an account or organization is terminated, we will delete or anonymize data within a reasonable period, subject to legal retention requirements or legitimate business needs such as resolving disputes.",
      ],
    },
    {
      title: "Security",
      paragraphs: [
        "We implement reasonable technical and organizational measures to protect information, including authentication controls, access restrictions, and secure data handling practices. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
      ],
    },
    {
      title: "Your Rights",
      paragraphs: [
        "Depending on applicable law, you may have the right to access, correct, or request deletion of your personal information. For organization-managed accounts, contact your organization administrator first. You may also contact us at privacy@hilite.com for platform-level requests.",
      ],
    },
    {
      title: "Cookies and Local Storage",
      paragraphs: [
        "We use cookies and local storage to maintain your authenticated session and remember preferences such as theme settings. These are essential for the service to function and are not used for third-party advertising.",
      ],
    },
    {
      title: "Changes to This Policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time. When we do, we will revise the \"Last updated\" date at the top of this page. Continued use of the service after changes are posted constitutes acceptance of the updated policy.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [
        "If you have questions about this Privacy Policy or our data practices, contact us at privacy@hilite.com.",
      ],
    },
  ],
};
