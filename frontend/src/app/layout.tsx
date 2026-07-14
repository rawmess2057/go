import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "@/components/AppWalletProvider";
import Header from "@/components/Header";
import I18nClient from "@/components/I18nClient";
import ThemeProviders from "@/components/ThemeProviders";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gig",
  description: "Solana gig platform — non-custodial escrow, instant payouts",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col antialiased bg-background text-foreground">
        <ThemeProviders>
        <AppWalletProvider>
          <I18nClient>
            <Header />
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                {children}
              </ErrorBoundary>
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
