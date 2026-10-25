// Temporary home illustration (DESIGN 2.6): puzzle piece, question mark and light bulb.
export default function HomeIllustration() {
  return (
    <svg
      viewBox="0 0 320 220"
      width="100%"
      role="img"
      aria-label="איור של פאזל, סימן שאלה ונורה"
      style={{ maxWidth: 360, display: "block", margin: "0 auto" }}
    >
      {/* Soft background blob */}
      <ellipse cx="160" cy="120" rx="140" ry="88" fill="#BDEAF5" opacity="0.55" />

      {/* Puzzle piece (left) */}
      <g transform="translate(28 78) rotate(-12 50 50)">
        <path
          d="M10 22h24a12 12 0 1 1 22 0h24v24a12 12 0 1 1 0 22v24H56a12 12 0 1 0-22 0H10z"
          fill="#F87A7A"
          stroke="#2D2D2D"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <text x="45" y="78" textAnchor="middle" fontSize="40" fontWeight="700" fill="#F9E68C" fontFamily="Arial, sans-serif">
          ?
        </text>
      </g>

      {/* Big question mark (center) */}
      <g>
        <circle cx="160" cy="104" r="58" fill="#FFFFFF" stroke="#2D2D2D" strokeWidth="3" />
        <text x="160" y="134" textAnchor="middle" fontSize="88" fontWeight="700" fill="#6B8DD6" fontFamily="Arial, sans-serif">
          ?
        </text>
      </g>

      {/* Light bulb (right) */}
      <g transform="translate(232 52)">
        <circle cx="34" cy="40" r="30" fill="#F9E68C" stroke="#2D2D2D" strokeWidth="3" />
        <rect x="21" y="68" width="26" height="22" rx="4" fill="#6B8DD6" stroke="#2D2D2D" strokeWidth="3" />
        <path d="M24 77h20M24 84h20" stroke="#2D2D2D" strokeWidth="2" />
        <text x="34" y="53" textAnchor="middle" fontSize="36" fontWeight="700" fill="#F87A7A" fontFamily="Arial, sans-serif">
          ?
        </text>
      </g>

      {/* Sparkles */}
      <g stroke="#FBC78B" strokeWidth="5" strokeLinecap="round">
        <path d="M222 30l8-14M246 26l14-8M290 52l14-4" />
        <path d="M34 54l-10-10M60 40l-4-14" />
      </g>
      <g fill="#F9E68C">
        <circle cx="110" cy="200" r="6" />
        <circle cx="214" cy="196" r="5" />
      </g>
    </svg>
  );
}
