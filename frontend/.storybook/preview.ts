import type { Preview } from '@storybook/react-vite'
import '../src/styles/tokens/index.css'  // 디자인 토큰 전역 로드

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#e4e4e1' },  // --color-bg-body
        { name: 'white', value: '#ffffff' },
        { name: 'dark', value: '#212529' },
      ],
    },
  },
};

export default preview;