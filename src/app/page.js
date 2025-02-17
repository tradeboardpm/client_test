// app/page.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import Navigation from "@/components/sections/home/Navigation";
import HeroSection from "@/components/sections/home/HeroSection";
import TradingPsychologySection from "@/components/sections/home/TradingPsychologySection";
import WhyTradeboardSection from "@/components/sections/home/WhyTradeboardSection";
import PricingSection from "@/components/sections/home/PricingSection";
import FAQSection from "@/components/sections/home/FAQSection";
import Footer from "@/components/sections/home/Footer";
import TradingJourneySection from "@/components/sections/home/TradingJourneySection";
import TradingDisciplineSection from "@/components/sections/home/TradingDisciplineSection";
import CTASection from "@/components/sections/home/CTASection";


export default function LandingPage() {
  const [isSticky, setIsSticky] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const heroSectionRef = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (heroSectionRef.current) {
        const heroBottom =
          heroSectionRef.current.getBoundingClientRect().bottom;
        const isInHeroSection = heroBottom > 0;

        if (isInHeroSection) {
          setShowNav(false);
          setIsSticky(false);
        } else {
          setShowNav(true);
          setIsSticky(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="primary_gradient" id="home">
        <Navigation isSticky={isSticky} showNav={showNav} />
        <HeroSection heroSectionRef={heroSectionRef} />
      </div>

      <main>
        <AnimatedSection>
          <TradingPsychologySection />
        </AnimatedSection>
        <AnimatedSection>
          <WhyTradeboardSection />
        </AnimatedSection>
        <AnimatedSection>
          <TradingDisciplineSection />
        </AnimatedSection>

        <AnimatedSection>
          <TradingJourneySection />
        </AnimatedSection>

        <AnimatedSection>
          <PricingSection />
        </AnimatedSection>
        <AnimatedSection>
          <FAQSection />
        </AnimatedSection>
      </main>
<CTASection/>
      <Footer />
    </div>
  );
}
