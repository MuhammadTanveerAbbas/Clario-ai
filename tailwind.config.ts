import type {Config} from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['ui-monospace', 'monospace'],
    },
    extend: {
      fontFamily: {
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        headline: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        code: ['ui-monospace', 'monospace'],
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
        paper: 'var(--color-paper)',
        brand: 'var(--brand)',
        'brand-hover': 'var(--brand-hover)',
        'brand-soft': 'var(--brand-soft)',
        'brand-strong': 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-ink': 'var(--color-accent-ink)',
        'paper-2': 'var(--color-paper-2)',
        rule: 'var(--color-rule)',
        ink: 'var(--color-ink)',
        'ink-2': 'var(--color-ink-2)',
        'body-muted': 'var(--color-muted)',
        'form-line': 'var(--form-line)',
        'code-muted': 'var(--color-code-muted)',
        danger: 'var(--color-danger)',
        'danger-hover': 'var(--color-danger-hover)',
        'danger-rule': 'var(--color-danger-rule)',
        'danger-rule-soft': 'var(--color-danger-rule-soft)',
        'danger-wash': 'var(--color-danger-wash)',
        'ink-wash': 'var(--color-ink-wash)',
        'danger-wash-soft': 'var(--color-danger-wash-soft)',
        'success-wash': 'var(--color-success-wash)',
        success: 'var(--color-success)',
        'success-rule': 'var(--color-success-rule)',
        overlay: 'var(--color-overlay)',
        scrim: 'var(--color-scrim)',
        'code-ink': 'var(--color-code-ink)',
        'code-surface': 'var(--color-code-surface)',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(23, 20, 18, 0.05)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      transitionDuration: {
        250: '250ms',
        400: '400ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        signature: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'button-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px 2px hsl(var(--accent) / 0.4)',
          },
          '50%': {
            boxShadow: '0 0 10px 5px hsl(var(--accent) / 0.2)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'button-glow': 'button-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
  safelist: [
    'duration-250',
    'duration-400',
    'ease-smooth',
    'ease-signature',
  ],
} satisfies Config;
