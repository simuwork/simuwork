import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Inter"', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        brand: {
          500: '#2563eb'
        }
      }
    }
  },
  plugins: []
};

export default config;
