import type { Preview } from '@storybook/react-vite'
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from '../src/mocks/handlers';
import '../src/styles/tokens/index.css'  // 디자인 토큰 전역 로드
import '../src/App.css'  // App.css 로드 (--primary-color, --secondary-color 등)

// Initialize MSW
initialize({
  onUnhandledRequest: 'bypass',
});

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
    msw: {
      handlers,
    },
  },
  loaders: [mswLoader],
};

export default preview;