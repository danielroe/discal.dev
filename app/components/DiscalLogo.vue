<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
}>(), {
  size: 'md',
  animate: false,
})

const sizeClasses: Record<string, string> = {
  sm: 'w-8 h-8',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-40 h-40 sm:w-48 sm:h-48',
}
</script>

<template>
  <div :class="sizeClasses[size]">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      class="w-full h-full"
      role="img"
      aria-label="discal mascot"
    >
      <defs>
        <radialGradient
          id="ball"
          cx="38%"
          cy="32%"
          r="60%"
        >
          <stop
            offset="0%"
            stop-color="var(--c-mascot-ball-highlight)"
          />
          <stop
            offset="60%"
            stop-color="var(--c-mascot-ball-mid)"
          />
          <stop
            offset="100%"
            stop-color="var(--c-mascot-ball-edge)"
          />
        </radialGradient>
        <linearGradient
          id="hat"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="rgb(var(--c-primary))"
          />
          <stop
            offset="100%"
            stop-color="rgb(var(--c-primary-active))"
          />
        </linearGradient>
      </defs>

      <!-- Shadow -->
      <ellipse
        cx="256"
        cy="468"
        rx="110"
        ry="18"
        fill="var(--c-mascot-shadow)"
      />

      <!-- Disco ball body -->
      <circle
        cx="256"
        cy="272"
        r="186"
        fill="url(#ball)"
        stroke="var(--c-mascot-ball-stroke)"
        stroke-width="4"
      />

      <!-- Facet grid - horizontal -->
      <path
        d="M 115 190 Q 256 168 397 190"
        fill="none"
        stroke="var(--c-mascot-facet)"
        stroke-width="3.5"
      />
      <path
        d="M 82 235 Q 256 210 430 235"
        fill="none"
        stroke="var(--c-mascot-facet)"
        stroke-width="3.5"
      />
      <path
        d="M 72 280 Q 256 255 440 280"
        fill="none"
        stroke="var(--c-mascot-facet)"
        stroke-width="3.5"
      />
      <path
        d="M 76 325 Q 256 300 436 325"
        fill="none"
        stroke="var(--c-mascot-facet)"
        stroke-width="3.5"
      />
      <path
        d="M 90 365 Q 256 340 422 365"
        fill="none"
        stroke="var(--c-mascot-facet)"
        stroke-width="3.5"
      />
      <path
        d="M 125 400 Q 256 378 387 400"
        fill="none"
        stroke="var(--c-mascot-facet)"
        stroke-width="3.5"
      />

      <!-- Facet grid - vertical -->
      <path
        d="M 180 90 Q 168 272 180 454"
        fill="none"
        stroke="var(--c-mascot-facet)"
        stroke-width="3.5"
      />
      <path
        d="M 256 86 Q 256 272 256 458"
        fill="none"
        stroke="var(--c-mascot-facet)"
        stroke-width="3.5"
      />
      <path
        d="M 332 90 Q 344 272 332 454"
        fill="none"
        stroke="var(--c-mascot-facet)"
        stroke-width="3.5"
      />

      <!-- Highlights -->
      <rect
        x="135"
        y="195"
        width="38"
        height="30"
        rx="4"
        fill="var(--c-mascot-white)"
        opacity="0.45"
        transform="rotate(-4 154 210)"
      />
      <rect
        x="270"
        y="190"
        width="38"
        height="30"
        rx="4"
        fill="var(--c-mascot-white)"
        opacity="0.5"
        transform="rotate(3 289 205)"
      />
      <rect
        x="190"
        y="280"
        width="38"
        height="30"
        rx="4"
        fill="var(--c-mascot-white)"
        opacity="0.35"
        transform="rotate(-2 209 295)"
      />
      <rect
        x="310"
        y="320"
        width="38"
        height="30"
        rx="4"
        fill="var(--c-mascot-white)"
        opacity="0.3"
        transform="rotate(4 329 335)"
      />
      <rect
        x="200"
        y="155"
        width="30"
        height="24"
        rx="4"
        fill="var(--c-mascot-white)"
        opacity="0.55"
      />

      <!-- Specular shine -->
      <circle
        cx="210"
        cy="190"
        r="60"
        fill="var(--c-mascot-white)"
        opacity="0.15"
      />

      <!-- Party hat -->
      <polygon
        points="256,30 190,148 322,148"
        fill="url(#hat)"
        stroke="rgb(var(--c-primary-active))"
        stroke-width="4"
        stroke-linejoin="round"
      />
      <path
        d="M 198 140 Q 256 156 314 140"
        fill="none"
        stroke="rgb(var(--c-pop))"
        stroke-width="7"
        stroke-linecap="round"
      />
      <circle
        cx="256"
        cy="30"
        r="18"
        fill="rgb(var(--c-pop))"
      />
      <circle
        cx="256"
        cy="30"
        r="11"
        fill="rgb(var(--c-pop-hover))"
      />

      <!-- Eyes -->
      <ellipse
        cx="206"
        cy="262"
        rx="42"
        ry="46"
        fill="var(--c-mascot-white)"
        stroke="var(--c-mascot-ball-stroke)"
        stroke-width="3"
      />
      <ellipse
        cx="214"
        cy="264"
        rx="24"
        ry="28"
        fill="var(--c-mascot-eye)"
      />
      <ellipse
        cx="224"
        cy="252"
        rx="10"
        ry="11"
        fill="var(--c-mascot-white)"
      />
      <circle
        cx="206"
        cy="274"
        r="5"
        fill="var(--c-mascot-white)"
        opacity="0.4"
      />

      <ellipse
        cx="306"
        cy="262"
        rx="42"
        ry="46"
        fill="var(--c-mascot-white)"
        stroke="var(--c-mascot-ball-stroke)"
        stroke-width="3"
      />
      <ellipse
        cx="298"
        cy="264"
        rx="24"
        ry="28"
        fill="var(--c-mascot-eye)"
      />
      <ellipse
        cx="288"
        cy="252"
        rx="10"
        ry="11"
        fill="var(--c-mascot-white)"
      />
      <circle
        cx="306"
        cy="274"
        r="5"
        fill="var(--c-mascot-white)"
        opacity="0.4"
      />

      <!-- Smile -->
      <path
        d="M 222 314 Q 256 346 290 314"
        fill="none"
        stroke="rgb(var(--c-primary-active))"
        stroke-width="5"
        stroke-linecap="round"
      />

      <!-- Blush -->
      <ellipse
        cx="172"
        cy="305"
        rx="20"
        ry="12"
        fill="rgb(var(--c-blush))"
        opacity="0.5"
      />
      <ellipse
        cx="340"
        cy="305"
        rx="20"
        ry="12"
        fill="rgb(var(--c-blush))"
        opacity="0.5"
      />

      <!-- Sparkles -->
      <g transform="translate(420, 120)">
        <g
          :class="animate ? 'motion-safe:animate-sparkle-pulse' : ''"
          style="transform-origin: 0 0"
        >
          <line
            x1="0"
            y1="-22"
            x2="0"
            y2="22"
            stroke="rgb(var(--c-accent))"
            stroke-width="5"
            stroke-linecap="round"
          />
          <line
            x1="-22"
            y1="0"
            x2="22"
            y2="0"
            stroke="rgb(var(--c-accent))"
            stroke-width="5"
            stroke-linecap="round"
          />
          <line
            x1="-13"
            y1="-13"
            x2="13"
            y2="13"
            stroke="rgb(var(--c-accent))"
            stroke-width="3.5"
            stroke-linecap="round"
          />
          <line
            x1="13"
            y1="-13"
            x2="-13"
            y2="13"
            stroke="rgb(var(--c-accent))"
            stroke-width="3.5"
            stroke-linecap="round"
          />
        </g>
      </g>
      <g transform="translate(88, 150)">
        <g
          :class="animate ? 'motion-safe:animate-sparkle-pulse' : ''"
          style="transform-origin: 0 0; animation-delay: 0.7s"
        >
          <line
            x1="0"
            y1="-16"
            x2="0"
            y2="16"
            stroke="rgb(var(--c-pop))"
            stroke-width="4.5"
            stroke-linecap="round"
          />
          <line
            x1="-16"
            y1="0"
            x2="16"
            y2="0"
            stroke="rgb(var(--c-pop))"
            stroke-width="4.5"
            stroke-linecap="round"
          />
          <line
            x1="-10"
            y1="-10"
            x2="10"
            y2="10"
            stroke="rgb(var(--c-pop))"
            stroke-width="3"
            stroke-linecap="round"
          />
          <line
            x1="10"
            y1="-10"
            x2="-10"
            y2="10"
            stroke="rgb(var(--c-pop))"
            stroke-width="3"
            stroke-linecap="round"
          />
        </g>
      </g>
      <g transform="translate(440, 360)">
        <g
          :class="animate ? 'motion-safe:animate-sparkle-pulse' : ''"
          style="transform-origin: 0 0; animation-delay: 1.3s"
        >
          <line
            x1="0"
            y1="-13"
            x2="0"
            y2="13"
            stroke="rgb(var(--c-accent))"
            stroke-width="4"
            stroke-linecap="round"
          />
          <line
            x1="-13"
            y1="0"
            x2="13"
            y2="0"
            stroke="rgb(var(--c-accent))"
            stroke-width="4"
            stroke-linecap="round"
          />
        </g>
      </g>
      <g transform="translate(78, 380)">
        <g
          :class="animate ? 'motion-safe:animate-sparkle-pulse' : ''"
          style="transform-origin: 0 0; animation-delay: 0.4s"
        >
          <line
            x1="0"
            y1="-10"
            x2="0"
            y2="10"
            stroke="rgb(var(--c-pop))"
            stroke-width="3.5"
            stroke-linecap="round"
          />
          <line
            x1="-10"
            y1="0"
            x2="10"
            y2="0"
            stroke="rgb(var(--c-pop))"
            stroke-width="3.5"
            stroke-linecap="round"
          />
        </g>
      </g>
    </svg>
  </div>
</template>
