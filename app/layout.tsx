import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FIFA 2026 World Cup Tracker",
  description: "Live standings, schedules, scores, leaderboard, chatbot and alerts for FIFA 2026 World Cup — powered by ESPN API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
