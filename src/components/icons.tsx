// Simple inline SVG icons (no external icon library, per DESIGN 2.6).
type IconProps = { size?: number };

export function HomeIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M3 11.2 12 3.5l9 7.7V20a1 1 0 0 1-1 1h-5.2v-6h-5.6v6H4a1 1 0 0 1-1-1z"
        fill="currentColor"
      />
    </svg>
  );
}

export function QuestionIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M8.5 8.6a3.6 3.6 0 0 1 7 1.1c0 2.4-3.5 3-3.5 5.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="19.2" r="1.7" fill="currentColor" />
    </svg>
  );
}

export function InfoIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="7.6" r="1.4" fill="currentColor" />
      <path d="M12 11v6.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
