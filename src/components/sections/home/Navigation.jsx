"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Home", href: "#home" },
  { name: "Why Tradeboard", href: "#why_tradeboard" },
  { name: "Pricing", href: "#pricing" },
  { name: "Tutorials", href: "https://www.youtube.com/@tradeboard_in" },
  // { name: "Blog", href: "#" },
  { name: "FAQs", href: "#faqs" },
];

const Navigation = ({ isSticky, showNav }) => {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-50% 0px",
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    navItems.forEach((item) => {
      const sectionId = item.href.replace("#", "");
      if (sectionId && document.getElementById(sectionId)) {
        observer.observe(document.getElementById(sectionId));
      }
    });

    return () => observer.disconnect();
  }, []);

  const handleScroll = (e, href) => {
    e.preventDefault();

    // If it's not a hash link (like Tutorials or Blog), don't handle scroll
    if (!href.startsWith("#")) return;

    const sectionId = href.replace("#", "");
    const element = document.getElementById(sectionId);

    if (element) {
      const navHeight = 80; // Adjust this value based on your nav height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showNav ? "translate-y-0" : "-translate-y-full"
      } ${isSticky ? "bg-primary shadow-md" : "bg-primary"}`}
    >
      <nav className="flex items-center justify-between p-4 text-background mx-auto container max-w-[84rem]">
        <div className="flex items-center space-x-2">
          <Image
            src="/images/home_logo.png"
            alt="Tradeboard.in Logo"
            width={240}
            height={60}
          />
        </div>
        <div className="hidden md:flex space-x-7 text-sm">
          {navItems.map((item) => {
            const sectionId = item.href.startsWith("#")
              ? item.href.replace("#", "")
              : null;
            const isActive = sectionId === activeSection;

            return item.href.startsWith("#") ? (
              // Internal links
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleScroll(e, item.href)}
                className={`transition-all duration-300 ease-in-out cursor-pointer ${
                  isActive
                    ? "text-foreground font-medium"
                    : "hover:text-foreground"
                }`}
              >
                {item.name}
              </a>
            ) : (
              // External links
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 ease-in-out cursor-pointer hover:text-foreground"
              >
                {item.name}
              </a>
            );
          })}
        </div>
        <div className="flex items-center space-x-6 text-lg">
          <Link href="/login">
            <Button variant="link" className="text-base text-background">
              Login
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-background text-base text-foreground hover:bg-secondary px-10 rounded-xl py-6 font-medium">
              Sign up
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Navigation;
