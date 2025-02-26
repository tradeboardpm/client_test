import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  Twitter,
  Youtube,
  X,
} from "lucide-react";
import TermsOfService from "@/app/(misc)/terms/page";
import PrivacyPolicy from "@/app/(misc)/privacy/page";

const navItems = [
  { name: "Home", href: "home" },
  { name: "Pricing", href: "pricing" },
  { name: "Tutorials", href: "https://www.youtube.com/@tradeboard_in" },
  { name: "FAQs", href: "faqs" },
  { name: "Why Tradeboard", href: "why_tradeboard" },
];

const socialLinks = [
  {
    icon: Instagram,
    href: "https://www.instagram.com/tradeboard.in/",
    label: "Instagram",
  },
  {
    icon: Twitter,
    href: "https://x.com/tradeboard_in",
    label: "Twitter",
  },
  {
    icon: Facebook,
    href: "https://www.facebook.com/profile.php?id=61564127901979",
    label: "Facebook",
  },
  {
    icon: Youtube,
    href: "https://www.youtube.com/@tradeboard_in",
    label: "YouTube",
  },
];

// content for Terms and Privacy - replace with your actual content
const termsContent = {
  title: "Terms & Conditions",
  content: <TermsOfService />,
};

const privacyContent = {
  title: "Privacy Policy",
  content: <PrivacyPolicy />,
};

const LegalDrawer = ({ isOpen, onClose, content }) => (
  <Drawer open={isOpen} onOpenChange={onClose}>
    <DrawerContent>
      <DrawerHeader>
        {/* <DrawerTitle>{content.title}</DrawerTitle> */}
      </DrawerHeader>
      <div className="p-4 max-h-[70vh] overflow-y-auto">
        <p className="text-sm text-foreground">{content.content}</p>
        <div className="w-full flex items-center justify-end">
          <DrawerClose asChild className="w-32">
            <Button>Close</Button>
          </DrawerClose>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
);

const Footer = () => {
  const [openDrawer, setOpenDrawer] = useState(null);

  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLegalClick = (type) => {
    setOpenDrawer(type);
  };

  return (
    <footer className="bg-[#12141D] text-card pt-8 px-4 md:pt-12 md:px-8 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-sm">
            <h3 className="text-xl md:text-4xl font-bold mb-4">TradeBoard</h3>
            <p className="text-base">
              We offer traders the tools to analyse their daily trading patterns
              and learn from it to establish themselves as successful traders.
            </p>
            <p className="mt-3">Follow us on:</p>
            <div className="flex space-x-4 mt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#4B4B4B] rounded-full p-1 hover:bg-[#5B5B5B] transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-6 md:mt-0">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  {item.href.startsWith("http") ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base hover:underline bg-transparent border-none cursor-pointer"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <button
                      onClick={() => handleScroll(item.href)}
                      className="text-base hover:underline bg-transparent border-none cursor-pointer"
                    >
                      {item.name}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 md:mt-0">
            <h3 className="text-xl font-semibold mb-4">Contact & Support</h3>
            {/* <p className="text-base flex items-center gap-2 mb-4">
              <Phone size={14} /> +91 8457691231
            </p> */}
            <p className="text-base flex items-center gap-2 hover:underline cursor-pointer underline">
              <Mail size={14} />
              contact@tradeboard.in
            </p>
          </div>
        </div>

        <div className="mt-8 py-4 border-t border-[#BEC0CA]/50 text-xs flex flex-col md:flex-row items-center justify-between">
          <p className="text-center md:text-left mb-4 md:mb-0">
            © 2025 Rezilienza Tech Private Limited | All rights reserved
          </p>

          <p className="text-center md:text-right mt-4 md:mt-0">
            v{process.env.NEXT_PUBLIC_APP_VERSION}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLegalClick("terms")}
              className="text-background underline text-xs hover:text-primary bg-transparent border-none cursor-pointer"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => handleLegalClick("privacy")}
              className="text-background underline text-xs hover:text-primary bg-transparent border-none cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>

      <LegalDrawer
        isOpen={openDrawer === "terms"}
        onClose={() => setOpenDrawer(null)}
        content={termsContent}
      />
      <LegalDrawer
        isOpen={openDrawer === "privacy"}
        onClose={() => setOpenDrawer(null)}
        content={privacyContent}
      />
    </footer>
  );
};

export default Footer;
