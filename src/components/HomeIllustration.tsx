// Temporary home illustration (DESIGN 2.6), in the Style Guide's flat, outlined style:
// puzzle piece, big question mark and light bulb. Replaced by
// public/images/home-illustration.png if one is supplied.
const OUTLINE = "#2D2D2D";

// Question mark on a 24x24 grid, reused for the big center mark.
const QUESTION_PATH = "M8.5 8.6a3.6 3.6 0 0 1 7 1.1c0 2.4-3.5 3-3.5 5.3";

export default function HomeIllustration() {
  return (
    <svg
      viewBox="0 0 360 260"
      width="100%"
      role="img"
      aria-label="איור של פאזל, סימן שאלה ונורה"
      style={{ maxWidth: 400, display: "block", margin: "0 auto" }}
    >
      {/* Soft pastel blobs behind the scene */}
      <path
        d="M70 150c-10-60 50-110 120-104 60 5 120 30 112 92-7 56-60 86-128 82-60-4-96-22-104-70z"
        fill="#BDEAF5"
        opacity="0.6"
      />
      <ellipse cx="250" cy="190" rx="70" ry="40" fill="#F9E68C" opacity="0.45" />

      {/* Dashed curly trail */}
      <path
        d="M30 236c40-30 80 10 110-12s10-40-12-30 4 44 50 42 70-14 92-4"
        fill="none"
        stroke={OUTLINE}
        strokeWidth="2"
        strokeDasharray="6 6"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* Puzzle piece (left) */}
      <g transform="translate(34 92) rotate(-14 40 50)">
        <path
          d="M0 10h25a12 12 0 1 1 30 0h25v25a12 12 0 1 1 0 30v25H55a12 12 0 1 0-30 0H0z"
          fill="#F87A7A"
          stroke={OUTLINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <g transform="translate(14 22) scale(2.2)">
          <path
            d={QUESTION_PATH}
            fill="none"
            stroke="#F9E68C"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(-6 -4)"
          />
          <circle cx="6" cy="15.2" r="1.7" fill="#F9E68C" />
        </g>
      </g>

      {/* Big question mark (center): dark outline under a blue stroke */}
      <g transform="translate(108 30) scale(6)">
        <path
          d={QUESTION_PATH}
          fill="none"
          stroke={OUTLINE}
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={QUESTION_PATH}
          fill="none"
          stroke="#6B8DD6"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="19.4" r="2" fill="#6B8DD6" stroke={OUTLINE} strokeWidth="0.5" />
      </g>

      {/* Light bulb (right) */}
      <g transform="translate(246 58) rotate(10 36 50)">
        <path
          d="M36 4C18 4 6 18 6 34c0 11 6 19 12 25 3 3 4 6 4 10h28c0-4 1-7 4-10 6-6 12-14 12-25C66 18 54 4 36 4z"
          fill="#F9E68C"
          stroke={OUTLINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <rect x="22" y="69" width="28" height="9" rx="3" fill="#6B8DD6" stroke={OUTLINE} strokeWidth="3" />
        <rect x="24" y="78" width="24" height="9" rx="3" fill="#6B8DD6" stroke={OUTLINE} strokeWidth="3" />
        <path d="M30 87h12v4a6 6 0 0 1-12 0z" fill={OUTLINE} />
        <g transform="translate(22 14) scale(1.25)">
          <path
            d={QUESTION_PATH}
            fill="none"
            stroke="#E35D5D"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(-1 -3)"
          />
          <circle cx="11" cy="16.4" r="1.8" fill="#E35D5D" />
        </g>
      </g>

      {/* Star */}
      <path
        transform="translate(214 40)"
        d="M0-14 3.53-4.85 13.31-4.33 5.71 1.85 8.23 11.33 0 6-8.23 11.33-5.71 1.85-13.31-4.33-3.53-4.85z"
        fill="#F9E68C"
        stroke={OUTLINE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Sparkle dashes */}
      <g strokeWidth="5" strokeLinecap="round">
        <path d="M262 36l6-14M286 44l13-7" stroke="#FBC78B" />
        <path d="M322 98l14-3" stroke="#6B8DD6" />
        <path d="M30 80l-12-8M48 62l-4-14" stroke="#F9E68C" />
        <path d="M92 40l-8-10" stroke="#F87A7A" />
      </g>
    </svg>
  );
}
