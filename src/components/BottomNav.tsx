"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { HomeIcon, InfoIcon, QuestionIcon } from "./icons";
import styles from "./BottomNav.module.css";

type NavItem = { href: string; label: string; icon: ReactNode };

// Exactly three destinations, in RTL order (first item renders on the right).
const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "בית", icon: <HomeIcon /> },
  { href: "/trivia", label: "טריוויה", icon: <QuestionIcon /> },
  { href: "/about", label: "אודות", icon: <InfoIcon /> },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="ניווט ראשי">
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href} className={styles.item}>
              <Link
                href={item.href}
                className={`${styles.link} ${isActive ? styles.active : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon}
                <span className={styles.label}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
