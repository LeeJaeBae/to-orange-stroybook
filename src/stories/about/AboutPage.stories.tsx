import type { Meta, StoryObj } from '@storybook/react';
import { AboutPage } from '@/components/about/AboutPage';
import { Navbar } from '@/components/landing/components/Navbar';
import { Footer } from '@/components/landing/components/Footer';

function FullAboutPage() {
  return (
    <>
      <Navbar />
      <AboutPage />
      <Footer />
    </>
  );
}

const meta: Meta = {
  title: 'About/AboutPage',
  component: FullAboutPage,
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
