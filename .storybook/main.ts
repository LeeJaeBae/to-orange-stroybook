import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
  ],
  staticDirs: ['../public'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
      'next/link': path.resolve(__dirname, '../src/mocks/next-link.tsx'),
      'next/image': path.resolve(__dirname, '../src/mocks/next-image.tsx'),
      'next/navigation': path.resolve(__dirname, '../src/mocks/next-navigation.ts'),
      '@tanstack/react-query': path.resolve(__dirname, '../src/mocks/tanstack-query.ts'),
      '@supabase/ssr': path.resolve(__dirname, '../src/mocks/supabase.ts'),
      '@supabase/supabase-js': path.resolve(__dirname, '../src/mocks/supabase.ts'),
      '@/lib/supabase/client': path.resolve(__dirname, '../src/mocks/supabase.ts'),
      '@/lib/supabase/server': path.resolve(__dirname, '../src/mocks/supabase.ts'),
      '@to-orange/api-contracts': path.resolve(__dirname, '../src/mocks/api-contracts.ts'),
      '@to-orange/db': path.resolve(__dirname, '../src/mocks/api-contracts.ts'),
    };
    return config;
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
