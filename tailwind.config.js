/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bp: {
          black: '#000000',
          brand: '#6ccaf1',
          white: '#ffffff',
          band: '#121416',
          ink: '#f0f1fa',
          ghost: '#14171b',
          'pill-dark': '#22272b',
          'pill-light': '#e6eef2',
          field: '#f0f1fa',
          trough: '#34393f',
          'rule-card': '#cfe9f5',
          'fluid-0': '#6ccaf1',
          'fluid-1': '#2a8ec4',
          'fluid-2': '#0b3a56',
        },
        primary: '#6ccaf1',
      },
      fontFamily: {
        sans: ['"Zen Kaku Gothic New"', '"Hiragino Kaku Gothic ProN"', 'sans-serif'],
        latin: ['"Instrument Sans"', '"Zen Kaku Gothic New"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      spacing: { margin: 'var(--bp-margin)' },
      zIndex: {
        canvas: '0',
        grid: '1',
        scroll: '2',
        tube: '4',
        ui: '10',
        header: '50',
        overlay: '90',
        transition: '100',
        preloader: '110',
      },
      transitionTimingFunction: { bp: 'cubic-bezier(.2,.8,.2,1)' },
      borderRadius: { sm: '8px', md: '12px', lg: '16px' },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.text-label': {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '11px',
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: '1',
        },
        '.text-num': {
          fontFamily: '"JetBrains Mono", monospace',
          fontVariantNumeric: 'tabular-nums',
        },
        '.skew-italic': { transform: 'skewX(-10deg)' },
        '.palt': { fontFeatureSettings: '"palt"' },
        '.mask-line': { overflow: 'hidden', display: 'block' },
        '.gpu': { willChange: 'transform', backfaceVisibility: 'hidden' },
        '.surface-dark': { background: 'transparent', color: 'var(--bp-ink)' },
        '.surface-brand': { background: 'var(--bp-brand)', color: 'var(--bp-ink-dark)' },
        '.surface-light': { background: 'var(--bp-white)', color: 'var(--bp-ink-dark)' },
        '.surface-band': { background: 'var(--bp-band)', color: 'var(--bp-ink)' },
      });
    }),
  ],
};
