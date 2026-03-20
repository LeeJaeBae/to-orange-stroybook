// Mock Google Analytics for Storybook
export const GA_TRACKING_ID = 'G-MOCK';

export const pageview = (url: string) => {
  console.log('GA pageview:', url);
};

export const event = ({ action, category, label, value }: any) => {
  console.log('GA event:', { action, category, label, value });
};
