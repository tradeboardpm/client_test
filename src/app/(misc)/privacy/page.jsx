import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const PrivacyPolicy = () => {
const sections = [
  {
    id: "privacy-policy",
    title: "Privacy Policy",
    content: [
      "We require you to register and login to our Website. To access premium features, we require you to either continue free plan or paid plan and submit personally identifiable information (hereinafter referred to as “Personal Data”) to avail the Services. The use of the personal data is detailed in the privacy policy below.",
      "This Privacy Policy covers our treatment of Personal Data that we gather when you are accessing or using our Services. We gather various types of Personal Data from our users and we use this Personal Data in connection with our products and services, including to develop, offer, operate, personalize, provide, and improve our services, to allow you to set up a user account and profile, to contact you and fulfil your requests, and to analyse how you use the Services.",
      "By submitting Personal Data through our Site or Services, you agree to the terms of this Privacy Policy and expressly give your voluntary consent to the collection, use and disclosure of the Personal Information in accordance with this Privacy Policy.",
    ],
  },
  {
    id: "definitions",
    title: "Definitions",
    content: [
      "“Customer”, “User”, “You”, “Your” means any individual, entity or organization having entered into any commercial transaction with Tradeboard.",
      "“Website(s)” means any website(s) we own and operate and any web pages or social networks that post a link to this privacy policy.",
      "“Tradeboard”, “We”, “Us” means Tradeboard tool and/or its subsidiary(ies) and/or affiliate(s).",
      "“Personal Data”, “Data” refers to all personal, non-anonymized data provided by the Customer.",
    ],
  },
  {
    id: "data-collection",
    title: "Data Collection",
    content: [
      "We collect Personal Data when you provide such information directly to us or when it is automatically collected during your use of our Services.",
      "Personal Data collected may include:",
      "• First and last name",
      "• Username",
      "• Password",
      "• Email address",
      "• Telephone number",
      "• Financial or payment information",
      "We also collect data using cookies and similar technologies, including:",
      "• IP address",
      "• Device identifiers and device information",
      "• Browser information",
      "• Page view statistics and browsing history",
      "• Usage and transaction information",
      "• Log data such as access times and hardware/software details",
    ],
  },
  {
    id: "use-of-information",
    title: "Use of Collected Information",
    content: [
      "To identify you as a user in our system",
      "To provide improved administration of our Site and Services",
      "To provide the Services you request",
      "To improve user experience",
      "To send email notifications",
      "To send newsletters, surveys, offers, and promotional materials",
      "To protect our services and users",
      "To conduct market analysis and research",
      "To prevent, detect, and investigate fraud or unlawful activities",
    ],
  },
  {
    id: "disclosure",
    title: "Disclosing Collected Information",
    content: [
      "We may share your information with:",
      "• Subsidiaries or affiliates of Tradeboard",
      "• Service providers and agents who process information on our behalf",
      "• Partners assisting in providing services",
      "• Payment processing providers",
      "• Regulators and law enforcement agencies to meet legal obligations",
      "We may share non-personally identifiable information publicly or with third parties. Under no circumstances will we share personal information for purposes other than stated without your express consent.",
    ],
  },
  {
    id: "security",
    title: "Security of Data",
    content: [
      "We take required technical and organizational precautions to prevent loss, misuse, or manipulation of data.",
      "All data is stored on secure, password-protected servers.",
      "You acknowledge that internet transmission is inherently insecure and we cannot guarantee absolute security.",
    ],
  },
  {
    id: "rights",
    title: "Your Rights and Choices",
    content: [
      "Right to Confirmation and Access",
      "Right to Correction",
      "Right to Data Portability",
      "Right to Be Forgotten",
      "Right to Withdrawal of Consent",
    ],
  },
  {
    id: "general-info",
    title: "General Information",
    content: [
      "Consent: All data is processed based on your explicit consent. You may withdraw consent at any time without affecting prior lawful processing.",
      "Retention of Data: When there is no legitimate business need, data will be deleted, anonymized, or securely archived.",
    ],
  },
  {
    id: "grievance",
    title: "Grievance Redressal",
    content:
      "If you have any privacy-related feedback, concerns, or grievances, you may contact our Grievance Officer at contactus@tradeboard.in.",
  },
];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground/90 mb-4">
            Privacy Policy
          </h1>
          {/* <p className="text-xl text-foreground/60">
            Rezilienza Tech Pvt. Ltd.
          </p> */}
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-7xl mx-auto shadow-xl border-2">
          <CardContent className="p-6 md:p-8">
            <ScrollArea className="h-full pr-4">
              {sections.map((section) => (
                <div key={section.id} className="mb-8 last:mb-0">
                  <h2 className="text-2xl font-semibold text-foreground/90 mb-4">
                    {section.title}
                  </h2>
                  {Array.isArray(section.content) ? (
                    <ul className="space-y-3">
                      {section.content.map((item, index) => (
                        <li
                          key={index}
                          className="text-foreground/70 leading-relaxed"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-foreground/70 leading-relaxed">
                      {section.content}
                    </p>
                  )}
                </div>
              ))}

              {/* Contact Section */}
              <div className="mt-8 pt-8 border-t border-border">
                <h2 className="text-2xl font-semibold text-foreground/90 mb-4">
                  Contact Us
                </h2>
                <p className="text-foreground/70">
                  If you have any questions or concerns about this Privacy
                  Policy or our data practices, please contact us at{" "}
                  <a
                    href="mailto:contactus@tradeboard.in"
                    className="text-primary hover:underline"
                  >
                    contactus@tradeboard.in
                  </a>
                </p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
