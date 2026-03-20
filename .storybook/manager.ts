import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

const toOrangeTheme = create({
  base: 'light',
  brandTitle: 'To Orange Design System',
  brandUrl: '/',
  colorPrimary: '#e8590c',
  colorSecondary: '#d9480f',
  appBg: '#fff7ed',
  appContentBg: '#ffffff',
  appBorderColor: '#fed7aa',
  textColor: '#292524',
  textInverseColor: '#ffffff',
  barTextColor: '#78716c',
  barSelectedColor: '#e8590c',
  barBg: '#ffffff',
});

addons.setConfig({
  theme: toOrangeTheme,
});
