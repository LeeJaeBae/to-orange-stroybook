import type { Meta, StoryObj } from '@storybook/react';
import { Navbar } from '@/components/landing/components/Navbar';
import { LandingPage } from '@/components/landing/LandingPage';
import { Footer } from '@/components/landing/components/Footer';

function FullLandingPage() {
  return (
    <>
      <Navbar />
      <LandingPage />
      <Footer />
    </>
  );
}

const meta: Meta = {
  title: 'Pages/LandingPage',
  component: FullLandingPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
