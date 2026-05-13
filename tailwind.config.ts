import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        ink: {
          DEFAULT: '#0E1116',
          soft: '#1B1F27',
          muted: '#5B6473',
        },
        paper: {
          DEFAULT: '#FBFAF6', // warm off-white
          card: '#FFFFFF',
          line: '#E8E5DD',
        },
        brand: {
          DEFAULT: '#5B5FE9', // indigo
          dark: '#3F44C9',
          soft: '#EEF0FF',
        },
        success: '#16A34A',
        danger: '#DC2626',
        warn: '#D97706',
      },
      fontFamily: {
        display: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Tighter, more editorial scale
        'display-xl': ['clamp(2.75rem, 6vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2rem, 4.5vw, 3rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        card: '0 1px 0 rgba(14,17,22,0.04), 0 8px 24px -12px rgba(14,17,22,0.08)',
        cardHover: '0 1px 0 rgba(14,17,22,0.06), 0 16px 32px -16px rgba(14,17,22,0.12)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
      maxWidth: {
        readable: '68ch',
      },
    },
  },
  plugins: [],
};

export default config;
