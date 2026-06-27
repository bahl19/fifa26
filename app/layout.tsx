import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FIFA 2026 World Cup Tracker",
  description: "Live standings, schedules, scores, leaderboard, chatbot and alerts for FIFA 2026 World Cup",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
