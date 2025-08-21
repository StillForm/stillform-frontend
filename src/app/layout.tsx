import type { Metadata } from 'next';
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";

import { cn } from "@/lib/utils";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { Header } from "@/components/header";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tangible - Multi-chain NFT Art Platform",
  description: "Create, collect, and materialize unique NFT art.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <WalletProvider>
          <div className="relative flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}