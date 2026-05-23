// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: '#00d992',
          50:  '#e6fff4',
          100: '#b3ffde',
          200: '#80ffc8',
          300: '#4dffb2',
          400: '#1aff9c',
          500: '#00d992',
          600: '#00b07a',
          700: '#008760',
          800: '#005e44',
          900: '#003528',
        },
        status: {
          warn:    '#f5b243',
          danger:  '#ff5d6c',
          info:    '#4fb3ff',
          success: '#00d992',
        },
        surface: {
          bg:       '#0f1117',
          card:     '#161920',
          elevated: '#1d2029',
          border:   '#252830',
          input:    '#1a1d26',
          sunken:   '#0b0d12',
        },
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '10px',
        xl: '14px',
      },
      transitionTimingFunction: {
        'qz-out': 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      transitionDuration: {
        '120': '120ms',
        '180': '180ms',
        '260': '260ms',
      },
    },
  },
  plugins: [],
};

export default config;
