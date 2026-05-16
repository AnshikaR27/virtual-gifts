import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1a0a2e',

        /* ── Primary ── */
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          container: 'hsl(var(--primary-container))',
          fixed: 'hsl(var(--primary-fixed))',
          'fixed-dim': 'hsl(var(--primary-fixed-dim))',
        },
        'on-primary': {
          DEFAULT: 'hsl(var(--on-primary))',
          container: 'hsl(var(--on-primary-container))',
          fixed: 'hsl(var(--on-primary-fixed))',
          'fixed-variant': 'hsl(var(--on-primary-fixed-variant))',
        },
        'inverse-primary': 'hsl(var(--inverse-primary))',
        'surface-tint': 'hsl(var(--surface-tint))',

        /* ── Secondary ── */
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          container: 'hsl(var(--secondary-container))',
          fixed: 'hsl(var(--secondary-fixed))',
          'fixed-dim': 'hsl(var(--secondary-fixed-dim))',
        },
        'on-secondary': {
          DEFAULT: 'hsl(var(--on-secondary))',
          container: 'hsl(var(--on-secondary-container))',
          fixed: 'hsl(var(--on-secondary-fixed))',
          'fixed-variant': 'hsl(var(--on-secondary-fixed-variant))',
        },

        /* ── Tertiary ── */
        tertiary: {
          DEFAULT: 'hsl(var(--tertiary))',
          container: 'hsl(var(--tertiary-container))',
          fixed: 'hsl(var(--tertiary-fixed))',
          'fixed-dim': 'hsl(var(--tertiary-fixed-dim))',
        },
        'on-tertiary': {
          DEFAULT: 'hsl(var(--on-tertiary))',
          container: 'hsl(var(--on-tertiary-container))',
          fixed: 'hsl(var(--on-tertiary-fixed))',
          'fixed-variant': 'hsl(var(--on-tertiary-fixed-variant))',
        },

        /* ── Surface ── */
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          bright: 'hsl(var(--surface-bright))',
          dim: 'hsl(var(--surface-dim))',
          'container-lowest': 'hsl(var(--surface-container-lowest))',
          'container-low': 'hsl(var(--surface-container-low))',
          container: 'hsl(var(--surface-container))',
          'container-high': 'hsl(var(--surface-container-high))',
          'container-highest': 'hsl(var(--surface-container-highest))',
          variant: 'hsl(var(--surface-variant))',
        },
        background: 'hsl(var(--background))',
        'inverse-surface': 'hsl(var(--inverse-surface))',
        'inverse-on-surface': 'hsl(var(--inverse-on-surface))',

        /* ── Text ── */
        'on-surface': {
          DEFAULT: 'hsl(var(--on-surface))',
          variant: 'hsl(var(--on-surface-variant))',
        },
        'on-background': 'hsl(var(--on-background))',

        /* ── Outline ── */
        outline: {
          DEFAULT: 'hsl(var(--outline))',
          variant: 'hsl(var(--outline-variant))',
        },

        /* ── Error ── */
        error: {
          DEFAULT: 'hsl(var(--error))',
          container: 'hsl(var(--error-container))',
        },
        'on-error': {
          DEFAULT: 'hsl(var(--on-error))',
          container: 'hsl(var(--on-error-container))',
        },

        /* ── Compat aliases (shadcn) ── */
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
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
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-outfit)', 'sans-serif'],
        ui: ['var(--font-outfit)', 'sans-serif'],
        handwritten: ['var(--font-caveat)', 'cursive'],
        pixel: ['var(--font-vt323)', 'monospace'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};

export default config;
