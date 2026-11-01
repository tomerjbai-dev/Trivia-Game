import Link from "next/link";
import HomeIllustration from "@/components/HomeIllustration";
import buttonStyles from "@/components/Button.module.css";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.home}>
      <p className={styles.subtitle}>שאלות מעניינות על כל מה שמסקרן אתכם</p>
      {/* Illustration and button share the remaining height, centered */}
      <div className={styles.stage}>
        <HomeIllustration />
        <Link href="/trivia" className={buttonStyles.primary}>
          בואו נשחק!
        </Link>
      </div>
    </div>
  );
}
