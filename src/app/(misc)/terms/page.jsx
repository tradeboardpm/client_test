import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const TermsOfService = () => {
  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      content:
        'Welcome to tradeboard.in ("we," "our," "us"). These Terms and Conditions ("Terms") govern your use of our website tradeboard.in and the subscription services ("Services") we offer. By accessing or using our website and Services, you agree to comply with and be bound by these Terms. If you do not agree to these Terms, please do not use our website or Services.',
    },
    {
      id: "subscription-services",
      title: "2. Subscription Services",
      subsections: [
        {
          title: "2.1. Subscription Plans",
          content:
            "We offer various subscription plans with different features and pricing. Details of the subscription plans and pricing are available on our website.",
        },
        {
          title: "2.2. Subscription Fees",
          content:
            "By subscribing to our Services, you agree to pay the applicable subscription fees as specified in your chosen plan. Subscription fees are billed on a recurring basis (e.g., monthly, annually) as per the plan you select.",
        },
        {
          title: "2.3. Payment",
          content:
            "Payment is processed through our third-party payment processor. You must provide accurate and complete payment information. By providing your payment details, you authorize us to charge the subscription fees to your selected payment method.",
        },
        {
          title: "2.4. Automatic Renewal",
          content:
            "Subscriptions automatically renew at the end of each billing cycle unless you cancel your subscription before the renewal date. Your payment method will be charged at the start of each new billing cycle.",
        },
        {
          title: "2.5. Cancellations and Refunds",
          content:
            "You may cancel your subscription at any time through your account settings on our website. Cancellations will take effect at the end of the current billing cycle. Subscription fees are non-refundable, except as required by law.",
        },
      ],
    },
    {
      id: "account-management",
      title: "3. Account Management",
      subsections: [
        {
          title: "3.1. Account Creation",
          content:
            "To access our Services, you must create an account. You agree to provide accurate and complete information when creating your account and to keep your account credentials secure.",
        },
        {
          title: "3.2. Responsibility",
          content:
            "You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.",
        },
        {
          title: "3.3. Account Termination",
          content:
            "We reserve the right to suspend or terminate your account if you violate these Terms or if we believe that your use of our Services poses a risk to our platform or other users.",
        },
      ],
    },
    {
      id: "use-of-services",
      title: "4. Use of Services",
      subsections: [
        {
          title: "4.1. License",
          content:
            "We grant you a limited, non-exclusive, non-transferable license to access and use our Services for personal, non-commercial purposes, subject to these Terms.",
        },
        {
          title: "4.2. Restrictions",
          content:
            "You agree not to use our Services for any unlawful purpose or in any way that could damage, disable, or impair our website or interfere with other users' access to our Services. You must not attempt to gain unauthorised access to our systems or accounts.",
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "5. Intellectual Property",
      subsections: [
        {
          title: "5.1. Ownership",
          content:
            "All content, software, and other materials on our website and within our Services are owned by us or our licensors and are protected by intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from our content without our prior written consent.",
        },
        {
          title: "5.2. User Content",
          content:
            "You retain ownership of any content you upload or create using our Services. By submitting content to our website, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content for the purposes of operating and improving our Services.",
        },
      ],
    },
    {
      id: "limitation-of-liability",
      title: "6. Limitation of Liability",
      subsections: [
        {
          title: "6.1. Disclaimer",
          content:
            'Our Services are provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not guarantee that our Services will be error-free or uninterrupted.',
        },
        {
          title: "6.2. Limitation of Liability",
          content:
            "To the maximum extent permitted by law, we are not liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our Services or these Terms. Our total liability for any claim arising out of these Terms or your use of our Services is limited to the amount paid by you for the subscription giving rise to the claim.",
        },
      ],
    },
    {
      id: "indemnification",
      title: "7. Indemnification",
      content:
        "You agree to indemnify, defend, and hold harmless Tradeboard, its affiliates, and their respective officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or related to your use of our Services, your violation of these Terms, or your infringement of any third-party rights.",
    },
    {
      id: "changes-to-terms",
      title: "8. Changes to Terms",
      content:
        "We reserve the right to update or modify these Terms at any time. Any changes will be posted on our website with an updated effective date. Your continued use of our Services following any changes constitutes your acceptance of the revised Terms.",
    },
    {
      id: "governing-law",
      title: "9. Governing Law",
      content:
        "These Terms are governed by and construed in accordance with the laws of India, without regard to its conflict of laws principles. Any disputes arising out of or related to these Terms or your use of our Services will be resolved in the courts located in India.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground/90 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-foreground/60">
            Please read these terms carefully before using our services
          </p>
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
                  {section.content && (
                    <p className="text-foreground/70 leading-relaxed mb-4">
                      {section.content}
                    </p>
                  )}
                  {section.subsections && (
                    <div className="space-y-4 ml-4">
                      {section.subsections.map((subsection, index) => (
                        <div key={index}>
                          <h3 className="text-lg font-medium text-foreground/80 mb-2">
                            {subsection.title}
                          </h3>
                          <p className="text-foreground/70 leading-relaxed">
                            {subsection.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {section.id !== "governing-law" && (
                    <Separator className="mt-8" />
                  )}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
