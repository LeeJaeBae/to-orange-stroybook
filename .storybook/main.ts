import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      resolve: {
        alias: [
          { find: 'next/link', replacement: path.resolve(__dirname, '../src/mocks/next-link.tsx') },
          { find: 'next/image', replacement: path.resolve(__dirname, '../src/mocks/next-image.tsx') },
          { find: 'next/navigation', replacement: path.resolve(__dirname, '../src/mocks/next-navigation.ts') },
          { find: '@/features/auth/index.client', replacement: path.resolve(__dirname, '../src/mocks/auth.ts') },
          { find: '@/features/auth/hooks/useAuth', replacement: path.resolve(__dirname, '../src/mocks/auth.ts') },
          { find: '@/lib/analytics/tracker', replacement: path.resolve(__dirname, '../src/mocks/analytics.ts') },
          { find: '@/lib/seo/metadata', replacement: path.resolve(__dirname, '../src/mocks/seo.ts') },
          { find: /^@\//, replacement: path.resolve(__dirname, '../src') + '/' },
        ],
      },
    });
  },
};

export default config;
