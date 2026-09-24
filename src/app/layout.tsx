import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ClerkProvider } from "@clerk/nextjs";
import ChatwootWidget from "@/components/ChatwootWidget";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Invoicipedia",
  description: "Create invoices, sell products and take payments with Stripe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen grid grid-rows-[auto_1fr_auto]`}
      >
        {/* Clerk Core 3: ClerkProvider belongs inside <body> on Next.js 16. */}
        <ClerkProvider>
          <ChatwootWidget />
          <Header />
          {children}
          <Footer />
        </ClerkProvider>
      </body>
    </html>

  );
}
