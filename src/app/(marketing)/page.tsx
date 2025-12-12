'use client';

import { useState } from 'react';
import {
  LandingHeader,
  MobileNav,
  HeroSection,
  PreviewSection,
  FeaturesGrid,
  StepsSection,
  PricingSection,
  CTASection,
  LandingFooter,
} from '@/components/landing';

export default function LandingPage() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleMobileNavToggle = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const handleMobileNavClose = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <>
      <LandingHeader onMobileMenuClick={handleMobileNavToggle} />
      <MobileNav isOpen={isMobileNavOpen} onClose={handleMobileNavClose} />

      <main>
        <HeroSection />
        <PreviewSection />
        <FeaturesGrid />
        <StepsSection />
        <PricingSection />
        <CTASection />
      </main>

      <LandingFooter />
    </>
  );
}
