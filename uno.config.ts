import {
  defineConfig,
  presetIcons,
  presetUno,
  presetWebFonts,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetWebFonts({
      provider: 'bunny',
      fonts: {
        sans: 'Outfit:400;500;600;700',
        mono: 'Space Mono:400;700',
      },
    }),
  ],

  theme: {
    colors: {
      'bg': 'rgb(var(--c-bg))',
      'surface': 'rgb(var(--c-surface))',
      'surface-raised': 'rgb(var(--c-surface-raised))',
      'text': {
        DEFAULT: 'rgb(var(--c-text))',
        muted: 'rgb(var(--c-text-muted))',
        dimmed: 'rgb(var(--c-text-dimmed))',
      },
      'primary': {
        DEFAULT: 'rgb(var(--c-primary))',
        hover: 'rgb(var(--c-primary-hover))',
        active: 'rgb(var(--c-primary-active))',
        text: 'rgb(var(--c-primary-text))',
        soft: 'rgb(var(--c-primary-soft))',
      },
      'accent': {
        DEFAULT: 'rgb(var(--c-accent))',
        hover: 'rgb(var(--c-accent-hover))',
        text: 'rgb(var(--c-accent-text))',
      },
      'pop': {
        DEFAULT: 'rgb(var(--c-pop))',
        hover: 'rgb(var(--c-pop-hover))',
      },
      'blush': 'rgb(var(--c-blush))',
      'border': {
        DEFAULT: 'rgb(var(--c-border))',
        emphasis: 'rgb(var(--c-border-emphasis))',
      },
      'card': {
        bg: 'rgb(var(--c-card-bg))',
        border: 'rgb(var(--c-card-border))',
      },
      'input': {
        bg: 'rgb(var(--c-input-bg))',
        border: 'rgb(var(--c-input-border))',
        focus: 'rgb(var(--c-input-focus))',
      },
      'code': {
        bg: 'rgb(var(--c-code-bg))',
        text: 'rgb(var(--c-code-text))',
      },
      'danger': {
        DEFAULT: 'rgb(var(--c-danger))',
        hover: 'rgb(var(--c-danger-hover))',
        text: 'rgb(var(--c-danger-text))',
      },
      'success': 'rgb(var(--c-success))',
    },
    animation: {
      keyframes: {
        'shimmer': '{ 0% { transform: translateX(-100%) } 100% { transform: translateX(100%) } }',
        'sparkle-pulse': '{ 0%, 100% { opacity: 0.4; transform: scale(0.8) rotate(0deg) } 50% { opacity: 1; transform: scale(1.2) rotate(15deg) } }',
        'float': '{ 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }',
        'spin-slow': '{ from { transform: rotate(0deg) } to { transform: rotate(360deg) } }',
        'pulse-glow': '{ 0%, 100% { box-shadow: 0 0 0 0 var(--c-glow-primary) } 50% { box-shadow: 0 0 20px 4px var(--c-glow-primary) } }',
        'slide-up': '{ from { opacity: 0; transform: translate(-50%, -48%) scale(0.96) } to { opacity: 1; transform: translate(-50%, -50%) scale(1) } }',
        'fade-in': '{ from { opacity: 0 } to { opacity: 1 } }',
        'check-bounce': '{ 0% { transform: scale(0) } 50% { transform: scale(1.2) } 100% { transform: scale(1) } }',
        'chevron-bounce': '{ 0%, 100% { transform: translateX(0) } 50% { transform: translateX(3px) } }',
      },
      durations: {
        'shimmer': '1.8s',
        'sparkle-pulse': '2.4s',
        'float': '3.5s',
        'spin-slow': '1.5s',
        'pulse-glow': '2.5s',
        'slide-up': '0.3s',
        'fade-in': '0.2s',
        'check-bounce': '0.35s',
        'chevron-bounce': '0.6s',
      },
      timingFns: {
        'shimmer': 'ease-in-out',
        'sparkle-pulse': 'ease-in-out',
        'float': 'ease-in-out',
        'spin-slow': 'linear',
        'pulse-glow': 'ease-in-out',
        'slide-up': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in': 'ease-out',
        'check-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'chevron-bounce': 'ease-in-out',
      },
      counts: {
        'shimmer': 'infinite',
        'sparkle-pulse': 'infinite',
        'float': 'infinite',
        'spin-slow': 'infinite',
        'pulse-glow': 'infinite',
        'chevron-bounce': 'infinite',
      },
    },
  },

  shortcuts: {
    /* ——— Layout ——— */
    'page-container': 'max-w-3xl mx-auto w-full px-6',
    'section-gap': 'flex flex-col gap-20',

    /* ——— Typography ——— */
    'heading-1': 'font-mono text-2xl sm:text-3xl font-bold tracking-tight',
    'heading-2': 'font-mono text-lg sm:text-xl font-bold tracking-tight',
    'heading-3': 'font-mono text-base font-bold tracking-tight',
    'text-gradient': 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent',

    /* ——— Buttons (base) ——— */
    'btn': 'inline-flex items-center justify-center gap-2 rounded-full font-mono font-bold transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.97] no-underline whitespace-nowrap',

    /* ——— Button variants ——— */
    'btn-primary': 'btn bg-primary text-primary-text hover:bg-primary-hover shadow-md hover:shadow-lg hover:shadow-primary/20',
    'btn-secondary': 'btn border-2 border-accent text-accent hover:bg-accent hover:text-accent-text',
    'btn-accent': 'btn bg-pop text-neutral-900 hover:bg-pop-hover hover:shadow-lg hover:shadow-pop/25 font-bold',
    'btn-ghost': 'btn text-text hover:bg-surface-raised',
    'btn-danger': 'btn bg-danger text-danger-text hover:bg-danger-hover',

    /* ——— Button sizes ——— */
    'btn-sm': 'text-xs px-3.5 py-1.5',
    'btn-md': 'text-sm px-5 py-2.5',
    'btn-lg': 'text-base px-7 py-3',

    /* ——— Cards ——— */
    'card': 'bg-card-bg border border-card-border rounded-xl transition-all duration-200',
    'card-interactive': 'card hover:-translate-y-0.5 hover:shadow-lg hover:border-border-emphasis cursor-pointer',
    'card-highlight': 'card border-transparent ring-1 ring-primary/30 bg-gradient-to-br from-primary/5 to-accent/5',

    /* ——— Skeleton ——— */
    'skeleton': 'bg-surface-raised rounded relative overflow-hidden',
    'skeleton-shimmer': 'after:content-empty after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-primary/10 after:to-transparent after:animate-shimmer',

    /* ——— Links ——— */
    'link-accent': 'text-accent hover:text-accent-hover transition-colors underline underline-offset-2 decoration-accent/30 hover:decoration-accent',

    /* ——— Forms ——— */
    'input-base': 'w-full bg-input-bg border border-input-border rounded-lg px-3 py-2 font-mono text-sm text-text transition-colors focus:outline-none focus:border-input-focus focus:ring-1 focus:ring-input-focus',

    /* ——— Badges ——— */
    'badge': 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-bold',
    'badge-primary': 'badge bg-primary/15 text-primary',
    'badge-accent': 'badge bg-accent/15 text-accent',
    'badge-muted': 'badge bg-surface-raised text-text-muted',

    /* ——— Utility ——— */
    'animate-reveal': 'motion-safe:animate-[reveal_0.5s_ease-out_var(--reveal-delay,0s)_both]',
    'loading-spinner': 'w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin-slow',
  },

  safelist: [
    /* Button variant+size combos used dynamically */
    'btn-primary', 'btn-secondary', 'btn-accent', 'btn-ghost', 'btn-danger',
    'btn-sm', 'btn-md', 'btn-lg',
    /* Card variants */
    'card', 'card-interactive', 'card-highlight',
    /* Padding variants */
    'p-3', 'p-5', 'p-8',
    /* Skeleton variants */
    'h-4', 'h-8', 'h-32', 'w-48', 'rounded-lg', 'rounded-xl',
  ],

  rules: [
    /* Stagger delay for reveal animations */
    [/^reveal-delay-(\d+)$/, ([, d]) => ({ '--reveal-delay': `${Number(d) * 0.1}s` })],
  ],
})
