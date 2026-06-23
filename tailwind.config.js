/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          soft: 'rgb(var(--ink-soft) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)',
          faint: 'rgb(var(--ink-faint) / <alpha-value>)',
        },
        // "navy" = the primary action colour (themed via CSS vars)
        navy: {
          50: 'rgb(var(--primary-soft) / <alpha-value>)',
          400: 'rgb(var(--primary-hover) / <alpha-value>)',
          500: 'rgb(var(--primary-hover) / <alpha-value>)',
          600: 'rgb(var(--primary) / <alpha-value>)',
          700: 'rgb(var(--primary-strong) / <alpha-value>)',
        },
        accent: 'rgb(var(--accent) / <alpha-value>)',
        lime: {
          DEFAULT: '#cdf24a',
          dark: '#bce232',
        },
        line: 'var(--line)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
        lift: 'var(--shadow-lift)',
        pill: 'var(--shadow-pill)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float 11s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
