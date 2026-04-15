import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cosmic-radial': 'radial-gradient(ellipse at center, #4C1D95 0%, #030712 70%)',
        'gold-radial': 'radial-gradient(ellipse at center, rgba(250,204,21,0.15) 0%, transparent 70%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        gold: {
          '50': '#FFFBEB',
          '100': '#FEF3C7',
          '200': '#FDE68A',
          '300': '#FCD34D',
          '400': '#FBBF24',
          '500': '#FACC15',
          '600': '#D97706',
          '700': '#B45309',
          '800': '#92400E',
          '900': '#78350F',
        },
        cosmic: {
          '900': '#030712',
          '800': '#0A0F1E',
          '700': '#111827',
          '600': '#1F2937',
          '500': '#374151',
          'deep': '#4C1D95',
          'purple': '#6D28D9',
          'violet': '#7C3AED',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      boxShadow: {
        'gold-sm': '0 0 10px rgba(250,204,21,0.3)',
        'gold-md': '0 0 20px rgba(250,204,21,0.4), 0 0 40px rgba(250,204,21,0.15)',
        'gold-lg': '0 0 40px rgba(250,204,21,0.5), 0 0 80px rgba(250,204,21,0.2)',
        'cosmic': '0 0 30px rgba(76,29,149,0.5), 0 0 60px rgba(76,29,149,0.2)',
        'card-dark': '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'glow-pulse': {
          '0%, 100%': {
            filter: 'brightness(1) drop-shadow(0 0 12px rgba(250,204,21,0.4))',
          },
          '50%': {
            filter: 'brightness(1.2) drop-shadow(0 0 30px rgba(250,204,21,0.8))',
          },
        },
        'aura-expand': {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.1)' },
        },
        'float-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'meter-fill': {
          '0%': { strokeDashoffset: 'var(--full-dash)' },
          '100%': { strokeDashoffset: 'var(--target-dash)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'aura-expand': 'aura-expand 4s ease-in-out infinite',
        'float-up': 'float-up 0.6s ease-out forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'fade-in': 'fade-in 0.8s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
