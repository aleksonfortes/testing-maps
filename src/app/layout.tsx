import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Testing Maps — Mind Map Testing in the Age of AI",
  description:
    "The definitive tool for mapping testing scenarios. Bridge the gap between requirements and code with visual mind maps.",
  openGraph: {
    type: "website",
    url: "https://testingmaps.com",
    title: "Testing Maps — Mind Map Testing in the Age of AI",
    description:
      "The definitive tool for mapping testing scenarios. Bridge the gap between requirements and code with visual mind maps.",
    siteName: "Testing Maps",
  },
  twitter: {
    card: "summary_large_image",
    title: "Testing Maps — Mind Map Testing in the Age of AI",
    description:
      "The definitive tool for mapping testing scenarios. Bridge the gap between requirements and code with visual mind maps.",
  },
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  );
}

