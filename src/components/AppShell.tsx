import type { ReactNode } from "react";
import BottomNav from "./BottomNav";
import styles from "./AppShell.module.css";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.brand}>חכמולוגים</h1>
      </header>
      <main className={styles.main}>{children}</main>
      <BottomNav />
    </div>
  );
}
