// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#00d992',
          50:  '#e6fff7',
          100: '#b3ffe6',
          200: '#66ffcc',
          300: '#00ffaa',
          400: '#00eea0',
          500: '#00d992',
          600: '#00b877',
          700: '#008f5c',
          800: '#006642',
          900: '#003d27',
        },
        surface: {
          bg:       '#0f1117',
          card:     '#161920',
          elevated: '#1d2029',
          border:   '#252830',
          input:    '#1a1d26',
        },
      },
    },
  },
  plugins: [],
};

export default config;
