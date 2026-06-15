import React from 'react';
import '../src/index.css';
import { withPocketLabStoryMocks } from '../src/stories/pocketlabTier9MockApi.js';

/** @type { import('@storybook/react').Preview } */
const preview = {
  decorators: [
    (Story) => React.createElement('div', { className: 'theme-control-plane-graphite min-h-screen bg-slate-950 text-slate-100' }, React.createElement(Story)),
    withPocketLabStoryMocks,
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'pocket-lab-dark',
      values: [
        { name: 'pocket-lab-dark', value: '#020617' },
        { name: 'docs-light', value: '#f8fafc' },
      ],
    },
    options: {
      storySort: {
        order: ['Pocket Lab', ['Tier 9 UI Screens']],
      },
    },
  },
};

export default preview;
