import type { Meta, StoryObj } from '@storybook/react';
import {
  Navbar,
  HeroSection,
  FeaturesScroll,
  HowItWorks,
  SpecialFeatures,
  LetterSection,
  AudioInterviewSection,
  TrustStats,
  CTASection,
  FAQ,
  Footer,
  FloatingBottomBar,
  FloatingShareButton,
} from '@/components/landing';

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesScroll />
      <TrustStats />
      <HowItWorks />
      <SpecialFeatures />
      <LetterSection />
      <AudioInterviewSection />
      <CTASection />
      <FAQ />
      <Footer />
      <FloatingBottomBar />
      <FloatingShareButton />
    </div>
  );
}

const meta = {
  title: 'Pages/LandingPage',
  component: LandingPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof LandingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};
