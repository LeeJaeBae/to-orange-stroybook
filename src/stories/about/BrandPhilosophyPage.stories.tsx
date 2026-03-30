import type { Meta, StoryObj } from '@storybook/react';
import { BrandPhilosophyPage } from '@/components/about/BrandPhilosophyPage';
import { Navbar } from '@/components/landing/components/Navbar';
import { Footer } from '@/components/landing/components/Footer';

function FullBrandPhilosophyPage() {
  return (
    <>
      <Navbar />
      <BrandPhilosophyPage />
      <Footer />
    </>
  );
}

const meta: Meta = {
  title: 'About/BrandPhilosophyPage',
  component: FullBrandPhilosophyPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
