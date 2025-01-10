/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core purple palette
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Complementary colors
        lavender: '#e6e6fa',
        periwinkle: '#ccccff',
        plum: '#dda0dd',
        lilac: '#c8a2c8',
        // Semantic colors
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: '#9333ea',
        secondary: '#c084fc',
        accent: '#e9d5ff',
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        // UI colors
        surface: "var(--surface)",
        'surface-hover': '#faf5ff',
        'surface-active': '#f3e8ff',
        border: '#e9d5ff',
        'border-focus': '#c084fc',
        // Status colors
        success: '#4ade80',
        warning: '#fbbf24',
        error: '#ef4444',
        info: '#3b82f6'
      },
      // Optional: Add matching box shadows
      boxShadow: {
        'soft-purple': '0 4px 14px 0 rgba(147, 51, 234, 0.1)',
      }
    },
  },

  plugins: [require('@tailwindcss/typography')],
};