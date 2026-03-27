import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Dark gradient neomorphic color system
      colors: {
        background: {
          DEFAULT: 'hsl(var(--bg-primary))',
          gradient: {
            start: 'var(--bg-gradient-start)',
            mid: 'var(--bg-gradient-mid)',
            end: 'var(--bg-gradient-end)',
          },
        },
        surface: {
          base: 'var(--surface-base)',
          elevated: 'var(--surface-elevated)',
          overlay: 'var(--surface-overlay)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          'primary-hover': 'var(--accent-primary-hover)',
          secondary: 'var(--accent-secondary)',
          success: 'var(--accent-success)',
          warning: 'var(--accent-warning)',
          danger: 'var(--accent-danger)',
          info: 'var(--accent-info)',
        },
        neo: {
          light: 'var(--neo-shadow-light)',
          dark: 'var(--neo-shadow-dark)',
          'inset-light': 'var(--neo-shadow-inset-light)',
          'inset-dark': 'var(--neo-shadow-inset-dark)',
        },
      },

      // Typography
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },

      // Spacing
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },

      // Border radius
      borderRadius: {
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },

      // Shadows for neomorphic design
      boxShadow: {
        'neo-raised': '6px 6px 12px var(--neo-shadow-dark), -6px -6px 12px var(--neo-shadow-light)',
        'neo-raised-lg': '10px 10px 20px var(--neo-shadow-dark), -10px -10px 20px var(--neo-shadow-light)',
        'neo-raised-sm': '3px 3px 6px var(--neo-shadow-dark), -3px -3px 6px var(--neo-shadow-light)',
        'neo-pressed': 'inset 4px 4px 8px var(--neo-shadow-inset-dark), inset -4px -4px 8px var(--neo-shadow-inset-light)',
        'neo-pressed-sm': 'inset 2px 2px 4px var(--neo-shadow-inset-dark), inset -2px -2px 4px var(--neo-shadow-inset-light)',
        'neo-flat': '2px 2px 4px var(--neo-shadow-dark), -2px -2px 4px var(--neo-shadow-light)',
        'neo-glow': '0 0 20px var(--accent-primary)',
        'neo-glow-lg': '0 0 40px var(--accent-primary)',
      },

      // Animations
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounceSubtle 0.5s ease-out',
      },

      // Keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px var(--accent-primary)' },
          '50%': { boxShadow: '0 0 40px var(--accent-primary)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
      },

      // Transition timing
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.33, 1, 0.68, 1)',
      },

      // Backdrop blur
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [typography],
} satisfies Config
