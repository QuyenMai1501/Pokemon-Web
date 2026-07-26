import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";
import Navbar from "@/components/Navbar";
import "./globals.css";
import styles from "./layout.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokémon Web",
  description: "Pokémon Web App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={styles.body}>
        <SessionWrapper>
          <Navbar />
          <main className={styles.main}>{children}</main>
        </SessionWrapper>
      </body>
    </html>
  );
}
