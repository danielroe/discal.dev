<template>
  <div
    style="display: flex; width: 1200px; height: 630px; position: relative; background: #0a0a0f; color: #f5f5f5; font-family: 'Outfit', sans-serif;"
  >
    <!-- Background gradient blobs -->
    <div
      style="position: absolute; top: -80px; right: -80px; width: 500px; height: 500px; border-radius: 9999px; background: radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%);"
    />
    <div
      style="position: absolute; bottom: -60px; left: -60px; width: 400px; height: 400px; border-radius: 9999px; background: radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%);"
    />

    <!-- Grid pattern overlay -->
    <div
      style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.04; background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 40px 40px;"
    />

    <!-- Content row -->
    <div style="display: flex; width: 100%; height: 100%; position: relative; align-items: center; padding: 60px 70px; gap: 50px;">
      <!-- Mascot -->
      <div style="display: flex; flex-shrink: 0;">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          width="260"
          height="260"
        >
          <defs>
            <clipPath id="ball-clip"><circle
              cx="256"
              cy="272"
              r="184"
            /></clipPath>
          </defs>

          <!-- Shadow -->
          <ellipse
            cx="256"
            cy="468"
            rx="110"
            ry="18"
            fill="rgba(0,0,0,0.15)"
          />

          <!-- Disco ball body -->
          <circle
            cx="256"
            cy="272"
            r="186"
            fill="#9090aa"
            stroke="#707088"
            stroke-width="4"
          />
          <!-- Lighter upper region (clipped) -->
          <ellipse
            cx="240"
            cy="210"
            rx="170"
            ry="130"
            fill="#b8b8d0"
            opacity="0.5"
            clip-path="url(#ball-clip)"
          />
          <ellipse
            cx="220"
            cy="180"
            rx="100"
            ry="80"
            fill="#c8c8dd"
            opacity="0.35"
            clip-path="url(#ball-clip)"
          />

          <!-- Facet grid + highlights (clipped) -->
          <g clip-path="url(#ball-clip)">
            <path
              d="M 115 190 Q 256 168 397 190"
              fill="none"
              stroke="rgba(200,200,230,0.2)"
              stroke-width="3.5"
            />
            <path
              d="M 82 235 Q 256 210 430 235"
              fill="none"
              stroke="rgba(200,200,230,0.2)"
              stroke-width="3.5"
            />
            <path
              d="M 72 280 Q 256 255 440 280"
              fill="none"
              stroke="rgba(200,200,230,0.2)"
              stroke-width="3.5"
            />
            <path
              d="M 76 325 Q 256 300 436 325"
              fill="none"
              stroke="rgba(200,200,230,0.2)"
              stroke-width="3.5"
            />
            <path
              d="M 90 365 Q 256 340 422 365"
              fill="none"
              stroke="rgba(200,200,230,0.2)"
              stroke-width="3.5"
            />
            <path
              d="M 180 90 Q 168 272 180 454"
              fill="none"
              stroke="rgba(200,200,230,0.2)"
              stroke-width="3.5"
            />
            <path
              d="M 256 86 Q 256 272 256 458"
              fill="none"
              stroke="rgba(200,200,230,0.2)"
              stroke-width="3.5"
            />
            <path
              d="M 332 90 Q 344 272 332 454"
              fill="none"
              stroke="rgba(200,200,230,0.2)"
              stroke-width="3.5"
            />

            <rect
              x="135"
              y="195"
              width="38"
              height="30"
              rx="4"
              fill="#e0e0ec"
              opacity="0.45"
              transform="rotate(-4 154 210)"
            />
            <rect
              x="270"
              y="190"
              width="38"
              height="30"
              rx="4"
              fill="#e0e0ec"
              opacity="0.5"
              transform="rotate(3 289 205)"
            />
            <rect
              x="190"
              y="280"
              width="38"
              height="30"
              rx="4"
              fill="#e0e0ec"
              opacity="0.35"
              transform="rotate(-2 209 295)"
            />
            <rect
              x="200"
              y="155"
              width="30"
              height="24"
              rx="4"
              fill="#e0e0ec"
              opacity="0.55"
            />
          </g>

          <!-- Party hat -->
          <polygon
            points="256,30 190,148 322,148"
            fill="#ec4899"
            stroke="#be185d"
            stroke-width="4"
            stroke-linejoin="round"
          />
          <path
            d="M 198 140 Q 256 156 314 140"
            fill="none"
            stroke="#facc15"
            stroke-width="7"
            stroke-linecap="round"
          />
          <circle
            cx="256"
            cy="30"
            r="18"
            fill="#facc15"
          />
          <circle
            cx="256"
            cy="30"
            r="11"
            fill="#eab308"
          />

          <!-- Eyes -->
          <ellipse
            cx="206"
            cy="262"
            rx="42"
            ry="46"
            fill="#d4d4e0"
            stroke="#707088"
            stroke-width="3"
          />
          <ellipse
            cx="214"
            cy="264"
            rx="24"
            ry="28"
            fill="#1e1b4b"
          />
          <ellipse
            cx="224"
            cy="252"
            rx="10"
            ry="11"
            fill="#d4d4e0"
          />
          <circle
            cx="206"
            cy="274"
            r="5"
            fill="#d4d4e0"
            opacity="0.4"
          />

          <ellipse
            cx="306"
            cy="262"
            rx="42"
            ry="46"
            fill="#d4d4e0"
            stroke="#707088"
            stroke-width="3"
          />
          <ellipse
            cx="298"
            cy="264"
            rx="24"
            ry="28"
            fill="#1e1b4b"
          />
          <ellipse
            cx="288"
            cy="252"
            rx="10"
            ry="11"
            fill="#d4d4e0"
          />
          <circle
            cx="306"
            cy="274"
            r="5"
            fill="#d4d4e0"
            opacity="0.4"
          />

          <!-- Smile -->
          <path
            d="M 222 314 Q 256 346 290 314"
            fill="none"
            stroke="#be185d"
            stroke-width="5"
            stroke-linecap="round"
          />

          <!-- Blush -->
          <ellipse
            cx="172"
            cy="305"
            rx="20"
            ry="12"
            fill="#fb7185"
            opacity="0.4"
          />
          <ellipse
            cx="340"
            cy="305"
            rx="20"
            ry="12"
            fill="#fb7185"
            opacity="0.4"
          />

          <!-- Sparkles -->
          <g transform="translate(420, 120)">
            <line
              x1="0"
              y1="-22"
              x2="0"
              y2="22"
              stroke="#22d3ee"
              stroke-width="5"
              stroke-linecap="round"
            />
            <line
              x1="-22"
              y1="0"
              x2="22"
              y2="0"
              stroke="#22d3ee"
              stroke-width="5"
              stroke-linecap="round"
            />
            <line
              x1="-13"
              y1="-13"
              x2="13"
              y2="13"
              stroke="#22d3ee"
              stroke-width="3.5"
              stroke-linecap="round"
            />
            <line
              x1="13"
              y1="-13"
              x2="-13"
              y2="13"
              stroke="#22d3ee"
              stroke-width="3.5"
              stroke-linecap="round"
            />
          </g>
          <g transform="translate(88, 150)">
            <line
              x1="0"
              y1="-16"
              x2="0"
              y2="16"
              stroke="#facc15"
              stroke-width="4.5"
              stroke-linecap="round"
            />
            <line
              x1="-16"
              y1="0"
              x2="16"
              y2="0"
              stroke="#facc15"
              stroke-width="4.5"
              stroke-linecap="round"
            />
            <line
              x1="-10"
              y1="-10"
              x2="10"
              y2="10"
              stroke="#facc15"
              stroke-width="3"
              stroke-linecap="round"
            />
            <line
              x1="10"
              y1="-10"
              x2="-10"
              y2="10"
              stroke="#facc15"
              stroke-width="3"
              stroke-linecap="round"
            />
          </g>
          <g transform="translate(440, 360)">
            <line
              x1="0"
              y1="-13"
              x2="0"
              y2="13"
              stroke="#22d3ee"
              stroke-width="4"
              stroke-linecap="round"
            />
            <line
              x1="-13"
              y1="0"
              x2="13"
              y2="0"
              stroke="#22d3ee"
              stroke-width="4"
              stroke-linecap="round"
            />
          </g>
        </svg>
      </div>

      <!-- Text content -->
      <div style="display: flex; flex-direction: column; justify-content: center; gap: 16px; flex: 1;">
        <!-- Title -->
        <div style="font-size: 72px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; color: #f472b6;">
          discal.dev
        </div>

        <!-- Description -->
        <div style="font-size: 26px; color: #a1a1aa; line-height: 1;">
          your Discord events, everywhere.
        </div>
        <div style="font-size: 26px; color: #a1a1aa; line-height: 1;">
          sync to any calendar app &ndash; or the atmosphere.
        </div>

        <!-- URL hint -->
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
          <div style="width: 8px; height: 8px; border-radius: 9999px; background: #22d3ee;" />
          <span style="font-size: 20px; color: #737373; font-family: 'Space Mono', monospace;">
            discal.dev
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
