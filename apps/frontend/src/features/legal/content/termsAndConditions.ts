import type { LegalPageContent } from "../types";

export const termsAndConditionsContent: LegalPageContent = {
  title: "Terms & Conditions",
  lastUpdated: "June 24, 2026",
  disclaimer:
    "This document is provided for demonstration purposes as part of the HILITE Sales OS MVP.",
  otherLegalPage: {
    label: "Privacy Policy",
    href: "/privacy",
  },
  sections: [
    {
      title: "Acceptance",
      paragraphs: [
        "These Terms & Conditions govern your access to and use of HILITE Sales OS. By accessing or using the service, you agree to be bound by these terms. If you do not agree, do not use the service.",
      ],
    },
    {
      title: "Service Description",
      paragraphs: [
        "HILITE Sales OS is a multi-tenant sales management platform that provides organizations with tools for managing users, teams, roles, leads, activities, dashboards, and in-app notifications. Features and availability may change as the platform evolves.",
      ],
    },
    {
      title: "Eligibility and Accounts",
      paragraphs: [
        "The service is intended for authorized business users only. You must provide accurate account information and keep your credentials confidential. Organization administrators are responsible for provisioning and managing user access within their organization.",
        "You are responsible for all activity that occurs under your account.",
      ],
    },
    {
      title: "Acceptable Use",
      paragraphs: [
        "You agree not to misuse the service. Prohibited conduct includes attempting unauthorized access to accounts, organizations, or data; interfering with or disrupting the platform; reverse engineering the service except where permitted by law; uploading malicious code; or using lead or customer data in violation of applicable law or your organization's policies.",
      ],
    },
    {
      title: "Organization Responsibilities",
      paragraphs: [
        "Organization administrators are responsible for user management, role and permission assignments, and the accuracy and legality of data entered into the system. Each organization is responsible for ensuring its users comply with these terms and applicable data protection obligations.",
      ],
    },
    {
      title: "Intellectual Property",
      paragraphs: [
        "HILITE retains all rights, title, and interest in the platform, including its software, design, and branding. Your organization retains ownership of the business data you enter into the service, subject to the license granted to HILITE to host and process that data as needed to provide the service.",
      ],
    },
    {
      title: "Confidentiality",
      paragraphs: [
        "You must protect your login credentials and treat lead, customer, and organizational information as confidential. Do not share access credentials or export data except as authorized by your organization and applicable law.",
      ],
    },
    {
      title: "Disclaimers",
      paragraphs: [
        "HILITE Sales OS is provided on an \"as is\" and \"as available\" basis without warranties of any kind, whether express or implied, including implied warranties of merchantability, fitness for a particular purpose, or non-infringement. As an MVP demonstration platform, the service may contain errors or interruptions.",
      ],
    },
    {
      title: "Limitation of Liability",
      paragraphs: [
        "To the fullest extent permitted by applicable law, HILITE and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, data, or goodwill arising from your use of the service. Our total liability for any claim relating to the service shall not exceed the amount paid by your organization for the service in the twelve months preceding the claim, or one hundred dollars if no fees were paid.",
      ],
    },
    {
      title: "Suspension and Termination",
      paragraphs: [
        "We may suspend or terminate access to the service if you violate these terms, if required by law, or if your organization is deactivated. Upon termination, your right to use the service ceases immediately. Provisions that by their nature should survive termination will remain in effect.",
      ],
    },
    {
      title: "Changes to Terms",
      paragraphs: [
        "We may update these Terms & Conditions from time to time. When we do, we will revise the \"Last updated\" date at the top of this page. Continued use of the service after changes are posted constitutes acceptance of the updated terms.",
      ],
    },
    {
      title: "Governing Law",
      paragraphs: [
        "These terms are governed by the laws of the jurisdiction in which HILITE operates, without regard to conflict-of-law principles. Any disputes shall be resolved in the courts of that jurisdiction, unless otherwise required by applicable law.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [
        "If you have questions about these Terms & Conditions, contact us at legal@hilite.com.",
      ],
    },
  ],
};
