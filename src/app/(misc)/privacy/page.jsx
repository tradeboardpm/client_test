import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const PrivacyPolicy = () => {
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      content:
        'Welcome to tradeboard.in ("we," "our," "us"). We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website tradeboard.in, use our services, or interact with us.',
    },
    {
      id: "information-collection",
      title: "Information We Collect",
      content: [
        "Personal Information: This includes information you provide directly, such as your name, email address, and any other contact details you voluntarily provide when registering for an account or contacting us.",
        "Trade Data: Information related to your trades, including trade logs, strategies, and performance data that you input or upload to our platform.",
        "Usage Data: Information about your interaction with our website, including IP addresses, browser types, pages visited, and time spent on the site.",
        "Cookies and Tracking Technologies: We use cookies and similar technologies to enhance your experience, analyze site usage, and provide tailored content. You can manage your cookie preferences through your browser settings.",
      ],
    },
    {
      id: "information-usage",
      title: "How We Use Your Information",
      content: [
        "To Provide and Improve Our Services: To maintain and enhance the functionality of our website and services, including processing trade logs and offering personalized insights.",
        "To Communicate with You: To send you updates, newsletters, and other relevant information related to our services. You can opt out of these communications at any time.",
        "To Ensure Security and Compliance: To protect our website and users from fraudulent activities and to comply with legal obligations.",
        "To Analyze and Improve Our Services: To analyze usage patterns and improve the overall user experience on our platform.",
      ],
    },
    {
      id: "information-sharing",
      title: "Sharing Your Information",
      content: [
        "We do not sell or rent your personal information to third parties. We may share your information in the following circumstances:",
        "With Service Providers: We may engage third-party service providers to assist us in operating our website and providing our services.",
        "For Legal Reasons: We may disclose your information if required by law, to enforce our terms of service, or to protect rights.",
        "Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.",
      ],
    },
    {
      id: "data-security",
      title: "Data Security",
      content:
        "We implement industry-standard security measures to protect your personal and trade data from unauthorized access, disclosure, or loss. However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee its absolute security.",
    },
    {
      id: "your-rights",
      title: "Your Rights and Choices",
      content: [
        "Access and Correction: You can request access to or correction of your personal information.",
        "Deletion: You may request the deletion of your personal information, subject to certain exceptions.",
        "Opt-Out: You can opt out of receiving marketing communications from us.",
      ],
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
                    href="mailto:contact@tradeboard.in"
                    className="text-primary hover:underline"
                  >
                    contact@tradeboard.in
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
