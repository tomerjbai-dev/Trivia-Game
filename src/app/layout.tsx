import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import AppShell from "@/components/AppShell";
import { TriviaSessionProvider } from "@/state/TriviaSessionContext";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "700"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "חכמולוגים",
  description: "שאלות מעניינות על כל מה שמסקרן אתכם",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
