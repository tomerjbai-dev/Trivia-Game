import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import AppShell from "@/components/AppShell";
import { TriviaSessionProvider } from "@/state/TriviaSessionContext";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "700", "800"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "חכמולוגים",
  description: "שאלות מעניינות על כל מה שמסקרן אתכם",
  // Name and icon for "Add to Home Screen" on iOS
  appleWebApp: { capable: true, title: "חכמולוגים", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F8F8F8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body>
        <TriviaSessionProvider>
          <AppShell>{children}</AppShell>
        </TriviaSessionProvider>
      </body>
    </html>
  );
}
