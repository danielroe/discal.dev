import {
  defineConfig,
  presetUno,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno({
      dark: 'class',
    }),
  ],

  transformers: [
    transformerDirectives(),
  ],

  // ── Semantic color tokens via CSS variables ────────────────────────
  // Templates only ever use these names (bg-surface, text-ink, etc.)
  // Light/dark values are swapped via :root / .dark selectors in preflights.
  // Fonts are loaded by @nuxt/fonts (auto-detected from font-family references).
  theme: {
    fontFamily: {
      sans: 'Nunito, ui-sans-serif, system-ui, sans-serif',
      mono: 'JetBrains Mono, ui-monospace, monospace',
    },
    colors: {
      primary: {
        DEFAULT: 'rgb(var(--c-primary) / %alpha)',
        hover: 'rgb(var(--c-primary-hover) / %alpha)',
        active: 'rgb(var(--c-primary-active) / %alpha)',
        subtle: 'rgb(var(--c-primary-subtle) / %alpha)',
        muted: 'rgb(var(--c-primary-muted) / %alpha)',
        text: 'rgb(var(--c-primary-text) / %alpha)',
      },
      accent: {
        DEFAULT: 'rgb(var(--c-accent) / %alpha)',
        hover: 'rgb(var(--c-accent-hover) / %alpha)',
        active: 'rgb(var(--c-accent-active) / %alpha)',
        subtle: 'rgb(var(--c-accent-subtle) / %alpha)',
        muted: 'rgb(var(--c-accent-muted) / %alpha)',
        text: 'rgb(var(--c-accent-text) / %alpha)',
        ink: 'rgb(var(--c-accent-ink) / %alpha)',
      },
      blush: {
        DEFAULT: 'rgb(var(--c-blush) / %alpha)',
        subtle: 'rgb(var(--c-blush-subtle) / %alpha)',
      },
      surface: {
        DEFAULT: 'rgb(var(--c-surface) / %alpha)',
        raised: 'rgb(var(--c-surface-raised) / %alpha)',
        sunken: 'rgb(var(--c-surface-sunken) / %alpha)',
        overlay: 'var(--c-surface-overlay)',
      },
      ink: {
        DEFAULT: 'rgb(var(--c-ink) / %alpha)',
        secondary: 'rgb(var(--c-ink-secondary) / %alpha)',
        muted: 'rgb(var(--c-ink-muted) / %alpha)',
        inverse: 'rgb(var(--c-ink-inverse) / %alpha)',
      },
      line: {
        DEFAULT: 'rgb(var(--c-line) / %alpha)',
        subtle: 'rgb(var(--c-line-subtle) / %alpha)',
        strong: 'rgb(var(--c-line-strong) / %alpha)',
      },
      success: {
        DEFAULT: 'rgb(var(--c-success) / %alpha)',
        subtle: 'rgb(var(--c-success-subtle) / %alpha)',
        text: 'rgb(var(--c-success-text) / %alpha)',
      },
      danger: {
        DEFAULT: 'rgb(var(--c-danger) / %alpha)',
        subtle: 'rgb(var(--c-danger-subtle) / %alpha)',
        text: 'rgb(var(--c-danger-text) / %alpha)',
      },
      warning: {
        DEFAULT: 'rgb(var(--c-warning) / %alpha)',
        subtle: 'rgb(var(--c-warning-subtle) / %alpha)',
        text: 'rgb(var(--c-warning-text) / %alpha)',
      },
    },
  },

  shortcuts: {
    // ── Layout ─────────────────────────────────────
    'page-container': 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8',

    // ── Buttons ────────────────────────────────────
    'btn': 'inline-flex items-center justify-center gap-2 rounded-full font-600 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary select-none',
    'btn-sm': 'btn px-3.5 py-1.5 text-sm',
    'btn-md': 'btn px-5 py-2.5 text-sm',
    'btn-lg': 'btn px-7 py-3 text-base',
    'btn-primary': 'btn-md bg-primary text-ink-inverse hover:bg-primary-hover active:bg-primary-active shadow-sm hover:shadow-md active:shadow-sm',
    'btn-secondary': 'btn-md bg-primary-subtle text-primary-text hover:bg-primary-muted active:bg-primary-subtle border border-primary/20',
    'btn-accent': 'btn-md bg-accent text-accent-ink hover:bg-accent-hover active:bg-accent-active shadow-sm hover:shadow-md',
    'btn-ghost': 'btn-md text-ink-secondary hover:bg-line/50 hover:text-ink active:bg-line/70',
    'btn-danger': 'btn-md bg-danger text-ink-inverse hover:bg-danger/90 active:bg-danger/80',
    'btn-icon': 'btn p-2 rounded-xl text-ink-secondary hover:bg-line/50 hover:text-ink',

    // ── Cards ──────────────────────────────────────
    'card': 'rounded-2xl border border-line bg-surface transition-all duration-200',
    'card-interactive': 'card group/card hover:border-primary/40 hover:shadow-md cursor-pointer',
    'card-highlight': 'card border-primary/30 bg-primary-subtle/30',

    // ── Badges ─────────────────────────────────────
    'badge': 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-600',
    'badge-primary': 'badge bg-primary-subtle text-primary-text',
    'badge-accent': 'badge bg-accent-muted text-accent-text',
    'badge-success': 'badge bg-success-subtle text-success-text',
    'badge-blush': 'badge bg-blush-subtle text-primary-text',

    // ── Form elements ──────────────────────────────
    'input-base': 'w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
    'select-base': 'input-base appearance-none cursor-pointer',

    // ── Code ───────────────────────────────────────
    'code-block': 'block w-full rounded-xl bg-surface-sunken border border-line px-4 py-3 text-sm font-mono text-ink overflow-x-auto',
    'code-inline': 'rounded-md bg-surface-sunken border border-line px-1.5 py-0.5 text-sm font-mono text-primary-text',

    // ── Skeleton loading ───────────────────────────
    'skeleton': 'rounded-xl bg-surface-raised border border-line animate-skeleton-glow',
    'skeleton-text': 'skeleton h-4 rounded-md',
    'skeleton-heading': 'skeleton h-8 w-48 rounded-lg',
    'skeleton-card': 'skeleton h-32 rounded-2xl',

    // ── Section/page titles ────────────────────────
    'heading-1': 'text-3xl sm:text-4xl font-800 text-ink tracking-tight',
    'heading-2': 'text-xl sm:text-2xl font-700 text-ink tracking-tight',
    'heading-3': 'text-lg font-700 text-ink',
    'text-body': 'text-base text-ink-secondary leading-relaxed',
    'text-small': 'text-sm text-ink-muted',

    // ── Gradient text ──────────────────────────────
    'gradient-text': 'bg-gradient-to-r from-primary via-primary-active to-accent bg-clip-text text-transparent',

    // ── Dialog ─────────────────────────────────────
    'dialog-overlay': 'fixed inset-0 bg-ink/30 backdrop-blur-sm z-50 animate-fade-in',
    'dialog-content': 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-2rem)] max-w-md rounded-2xl bg-surface border border-line shadow-xl p-6 animate-scale-in',

    // ── Nav items (consistent height) ──────────────
    'nav-item': 'inline-flex items-center justify-center h-8 px-3 rounded-lg text-sm font-500 text-ink-secondary hover:bg-line/50 hover:text-ink transition-colors duration-150 cursor-pointer select-none',
    'nav-badge': 'inline-flex items-center h-8 rounded-lg px-3 text-xs font-600 bg-primary-subtle text-primary-text gap-1.5',

    // ── Misc ───────────────────────────────────────
    'glass': 'bg-surface-overlay backdrop-blur-lg border-b border-line-subtle',
    'focus-ring': 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    'link': 'text-primary hover:text-primary-hover underline underline-offset-2 decoration-primary/30 hover:decoration-primary/60 transition-colors duration-150',
  },

  rules: [
    [/^animate-skeleton-glow$/, () => ({ animation: 'skeleton-glow 2.5s ease-in-out infinite' })],
    [/^animate-sparkle$/, () => ({ animation: 'sparkle 2s ease-in-out infinite' })],
    [/^animate-float$/, () => ({ animation: 'float 3s ease-in-out infinite' })],
    [/^animate-fade-in$/, () => ({ animation: 'fade-in 200ms ease-out' })],
    [/^animate-scale-in$/, () => ({ animation: 'scale-in 200ms ease-out' })],
    [/^animate-bounce-in$/, () => ({ animation: 'bounce-in 500ms cubic-bezier(0.34, 1.56, 0.64, 1)' })],
    [/^animate-pulse-dot$/, () => ({ animation: 'pulse-dot 2s ease-in-out infinite' })],
    [/^animate-spin-slow$/, () => ({ animation: 'spin 2s linear infinite' })],
  ],

  preflights: [
    {
      getCSS: () => /* css */`
        /* ── Light mode (default) ─────────────────────── */
        :root {
          /* Brand: violet */
          --c-primary: 139 92 246;
          --c-primary-hover: 124 58 237;
          --c-primary-active: 109 40 217;
          --c-primary-subtle: 237 233 254;
          --c-primary-muted: 221 214 254;
          --c-primary-text: 91 33 182;

          /* Brand: gold */
          --c-accent: 251 191 36;
          --c-accent-hover: 245 158 11;
          --c-accent-active: 217 119 6;
          --c-accent-subtle: 255 251 235;
          --c-accent-muted: 253 230 138;
          --c-accent-text: 180 83 9;
          --c-accent-ink: 78 53 5;

          /* Blush */
          --c-blush: 249 168 212;
          --c-blush-subtle: 252 231 243;

          /* Mascot (fixed, not theme-dependent) */
          --c-mascot-ball-highlight: #e8e8f0;
          --c-mascot-ball-mid: #c0c0d4;
          --c-mascot-ball-edge: #8888aa;
          --c-mascot-ball-stroke: #7777a0;
          --c-mascot-facet: rgba(153, 153, 187, 0.35);
          --c-mascot-white: #ffffff;
          --c-mascot-eye: #1e1b4b;
          --c-mascot-shadow: rgba(0, 0, 0, 0.04);

          /* Surface */
          --c-surface: 255 255 255;
          --c-surface-raised: 250 248 255;
          --c-surface-sunken: 240 238 245;
          --c-surface-overlay: rgba(255, 255, 255, 0.85);

          /* Ink (text) */
          --c-ink: 30 27 75;
          --c-ink-secondary: 119 119 160;
          --c-ink-muted: 153 153 187;
          --c-ink-inverse: 255 255 255;

          /* Lines (borders) */
          --c-line: 232 232 240;
          --c-line-subtle: 240 238 245;
          --c-line-strong: 192 192 212;

          /* Feedback */
          --c-success: 34 197 94;
          --c-success-subtle: 240 253 244;
          --c-success-text: 21 128 61;
          --c-danger: 239 68 68;
          --c-danger-subtle: 254 242 242;
          --c-danger-text: 185 28 28;
          --c-warning: 245 158 11;
          --c-warning-subtle: 255 251 235;
          --c-warning-text: 180 83 9;

          color-scheme: light;
        }

        /* ── Dark mode ────────────────────────────────── */
        .dark {
          --c-primary: 167 139 250;
          --c-primary-hover: 196 181 253;
          --c-primary-active: 139 92 246;
          --c-primary-subtle: 30 27 75;
          --c-primary-muted: 46 38 94;
          --c-primary-text: 196 181 253;

          --c-accent: 251 191 36;
          --c-accent-hover: 252 211 77;
          --c-accent-active: 245 158 11;
          --c-accent-subtle: 30 25 15;
          --c-accent-muted: 50 40 20;
          --c-accent-text: 253 230 138;
          --c-accent-ink: 78 53 5;

          --c-blush: 244 114 182;
          --c-blush-subtle: 40 20 32;

          --c-mascot-ball-highlight: #d0d0e0;
          --c-mascot-ball-mid: #9999bb;
          --c-mascot-ball-edge: #666688;
          --c-mascot-ball-stroke: #555580;
          --c-mascot-facet: rgba(200, 200, 230, 0.2);
          --c-mascot-shadow: rgba(0, 0, 0, 0.15);

          --c-surface: 15 10 26;
          --c-surface-raised: 26 26 46;
          --c-surface-sunken: 10 6 18;
          --c-surface-overlay: rgba(15, 10, 26, 0.85);

          --c-ink: 240 238 245;
          --c-ink-secondary: 153 153 187;
          --c-ink-muted: 119 119 160;
          --c-ink-inverse: 30 27 75;

          --c-line: 51 51 85;
          --c-line-subtle: 35 35 60;
          --c-line-strong: 85 85 128;

          --c-success: 74 222 128;
          --c-success-subtle: 10 30 20;
          --c-success-text: 134 239 172;
          --c-danger: 248 113 113;
          --c-danger-subtle: 35 15 15;
          --c-danger-text: 252 165 165;
          --c-warning: 251 191 36;
          --c-warning-subtle: 30 25 15;
          --c-warning-text: 253 230 138;

          color-scheme: dark;
        }

        /* ── Keyframes ────────────────────────────────── */
        @keyframes skeleton-glow {
          0%, 100% { border-color: rgb(var(--c-line)); opacity: 0.7; }
          50% { border-color: rgb(var(--c-primary) / 0.25); opacity: 1; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.6; transform: scale(0.85) rotate(15deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes bounce-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }

        /* ── View Transitions ─────────────────────────── */
        ::view-transition-old(root) {
          animation: 150ms ease-out both fade-out;
        }
        ::view-transition-new(root) {
          animation: 150ms ease-in both fade-in, 200ms ease-out both slide-in;
        }
        @keyframes fade-out {
          to { opacity: 0; }
        }
        @keyframes slide-in {
          from { transform: translateY(8px); }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          ::view-transition-old(root),
          ::view-transition-new(root) {
            animation: none !important;
          }
        }

        /* ── Base ─────────────────────────────────────── */
        body {
          font-family: Nunito, ui-sans-serif, system-ui, sans-serif;
          background-color: rgb(var(--c-surface));
          color: rgb(var(--c-ink));
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `,
    },
  ],
})
