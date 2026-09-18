export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        canvas: '#f6f7f9',
        ink: {
          DEFAULT: '#0f172a',
          muted: '#5a6478',
          subtle: '#8b93a5',
        },
        line: {
          DEFAULT: '#e6e8ee',
          strong: '#d5d9e2',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#282a67',
        },
        live: {
          50: '#ecfdf3',
          100: '#d1fadf',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
        },
        warn: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#d97706',
          600: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#dc2626',
          600: '#b91c1c',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.05)',
        lift: '0 4px 6px -2px rgba(15, 23, 42, 0.06), 0 12px 24px -8px rgba(15, 23, 42, 0.12)',
        modal: '0 24px 48px -12px rgba(15, 23, 42, 0.28)',
      },
      transitionTimingFunction: {
        swift: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      keyframes: {
        'live-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '70%': { transform: 'scale(2.4)', opacity: '0' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        'flash-row': {
          '0%': { backgroundColor: 'rgba(79, 70, 229, 0.09)' },
          '100%': { backgroundColor: 'rgba(79, 70, 229, 0)' },
        },
        'count-bump': {
          '0%': { transform: 'translateY(4px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'delta-rise': {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '18%': { transform: 'translateY(0)', opacity: '1' },
          '75%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-8px)', opacity: '0' },
        },
        'skeleton-sweep': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'live-ring': 'live-ring 1.9s cubic-bezier(0.23, 1, 0.32, 1) infinite',
        'flash-row': 'flash-row 900ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'count-bump': 'count-bump 220ms cubic-bezier(0.23, 1, 0.32, 1)',
        'delta-rise': 'delta-rise 1800ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'skeleton-sweep': 'skeleton-sweep 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
