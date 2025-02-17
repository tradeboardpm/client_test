import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const navItems = [
  { name: "Home", href: "home" },
  { name: "Why Tradeboard", href: "why_tradeboard" },
  { name: "Pricing", href: "pricing" },
  { name: "Tutorials", href: "https://www.youtube.com/@tradeboard_in" },
  { name: "FAQs", href: "faqs" },
];

const HeroSection = ({ heroSectionRef }) => {
  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      <div className="bg-transparent">
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
            {navItems.map((item, index) => {
              return item.href.startsWith("http") ? (
                // External link
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-all duration-300 ease-in-out"
                >
                  {item.name}
                </a>
              ) : (
                // Internal link
                <button
                  key={item.name}
                  onClick={() => handleScroll(item.href)}
                  className={`hover:text-foreground transition-all duration-300 ease-in-out ${
                    index === 0 ? "text-black" : ""
                  }`}
                >
                  {item.name}
                </button>
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
      <section
        id="home"
        ref={heroSectionRef}
        className="text-background pt-[6rem]"
      >
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-[4.15rem] mb-8 font-bold">
            Trade Better With Discipline
          </h1>
          <span className="text-[1.4rem] max-w-7xl mx-auto">
            We offer traders the tools to analyse their daily trading patterns
            and learn from <br />
            it to establish themselves as successful traders.
          </span>
          <div className="bg-gradient-to-b from-transparent from-50% to-card to-50% p-3">
            <div className="relative w-full max-w-[58rem] mx-auto aspect-video">
              <img
                src="/images/Dashboard.png"
                alt="Tradeboard Dashboard"
                layout="fill"
                className="rounded-3xl"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
