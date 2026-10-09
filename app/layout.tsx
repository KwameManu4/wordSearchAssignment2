import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styling/Index.css";
import { ThemeProvider } from "./Components/ThemeContext";
import PageVisitTracker from "./Components/PageVisitTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // each route's layout sets its own title, which fills the %s
  title: {
    default: "Phoneme Word Search",
    template: "%s | Phoneme Word Search",
  },
  description: "Phoneme Wordle and Word Search builder for speech pathology",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <PageVisitTracker/>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
