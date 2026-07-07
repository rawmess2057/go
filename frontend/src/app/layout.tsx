import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "@/components/AppWalletProvider";
import Header from "@/components/Header";
import I18nClient from "@/components/I18nClient";
import ThemeProviders from "@/components/ThemeProviders";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "इनाम",
  description: "Solana इनाम platform — non-custodial escrow, instant payouts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col antialiased bg-background text-foreground">
        <ThemeProviders>
        <AppWalletProvider>
          <I18nClient>
            <Header />
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 pb-24 md:pb-8">
              {children}
            </main>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  borderRadius: "12px",
                  fontSize: "14px",
                },
              }}
            />
          </I18nClient>
        </AppWalletProvider>
        </ThemeProviders>
      </body>
    </html>
  );
}
