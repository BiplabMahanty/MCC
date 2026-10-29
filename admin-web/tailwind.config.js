/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1A5C38',
          dark: '#0D3D24',
          accent: '#1DB954',
          light: '#E8F5EE',
        },
        surface: '#F5F7F5',
        card: '#FFFFFF',
        'text-primary': '#111827',
        'text-muted': '#6B7280',
        border: '#E5E7EB',
        up: '#16A34A',
        down: '#EA580C',
        // Status
        success: '#15803D',
        'success-surface': '#F0FDF4',
        warning: '#B45309',
        'warning-surface': '#FFFBEB',
        error: '#B91C1C',
        'error-surface': '#FEF2F2',
        // Icon backgrounds
        'icon-bg-green': '#DCFCE7',
        'icon-bg-blue': '#DBEAFE',
        'icon-bg-purple': '#EDE9FE',
        'icon-bg-orange': '#FEF3C7',
        'icon-bg-pink': '#FCE7F3',
        'icon-bg-teal': '#CCFBF1',
        // Icon foregrounds
        'icon-green': '#16A34A',
        'icon-blue': '#2563EB',
        'icon-purple': '#7C3AED',
        'icon-orange': '#D97706',
        'icon-pink': '#DB2777',
        'icon-teal': '#0D9488',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
