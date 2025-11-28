import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HabitProvider } from "@/contexts/HabitContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Track your daily habits and build better routines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <HabitProvider>
            {children}
          </HabitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
