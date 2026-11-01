import type { ReactNode } from "react";
import BottomNav from "./BottomNav";
import styles from "./AppShell.module.css";

// Three short decorative dashes beside the brand title, as in the Mockups.
function Sparkle({ colors, mirrored = false }: { colors: [string, string, string]; mirrored?: boolean }) {
  return (
    <svg
      className={styles.sparkle}
      width="22"
      height="28"
      viewBox="0 0 22 28"
      aria-hidden="true"
      focusable="false"
      style={mirrored ? { transform: "scaleX(-1)" } : undefined}
    >
      <g strokeWidth="3.5" strokeLinecap="round">
        <path d="M4 5l7 5" stroke={colors[0]} />
        <path d="M3 15h10" stroke={colors[1]} />
        <path d="M4 25l7-5" stroke={colors[2]} />
      </g>
    </svg>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.brand}>
          <Sparkle colors={["#F9E68C", "#F87A7A", "#F9E68C"]} />
          חכמולוגים
          <Sparkle colors={["#6B8DD6", "#F9E68C", "#6B8DD6"]} mirrored />
        </h1>
      </header>
      <main className={styles.main}>{children}</main>
      <BottomNav />
    </div>
  );
}
