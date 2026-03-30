import { HeroSection } from './sections/client/HeroSection';
import { SpecialFeatures } from './sections/client/SpecialFeatures';
import { LetterSection } from './sections/client/LetterSection';
import { AudioInterviewSection } from './sections/client/AudioInterviewSection';
import { TrustStats } from './sections/client/TrustStats';
import { HowItWorks } from './sections/client/HowItWorks';
import { FeaturesScroll } from './sections/client/FeaturesScroll';
import { FAQ } from './sections/client/FAQ';
import { CTASection } from './sections/client/CTASection';
import { FloatingBottomBar } from './components/client/FloatingBottomBar';
import { FloatingShareButton } from './components/client/FloatingShareButton';

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <SpecialFeatures />
      <LetterSection />
      <AudioInterviewSection />
      <TrustStats />
      <HowItWorks />
      <FeaturesScroll />
      <FAQ />
      <CTASection />
      <FloatingBottomBar />
      <FloatingShareButton />
    </>
  );
}
