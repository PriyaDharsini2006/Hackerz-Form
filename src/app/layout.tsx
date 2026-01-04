import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from './components/AuthProvider'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hackerz Forms",
  description: "Built for Hackerz. Click. Submit. Hack the event.",
  openGraph: {
    title: "Hackerz Forms",
    description: "Forms, but make it Hackerz.",
    url: "https://hackerz-form.vercel.app",
    siteName: "Hackerz Forms",
    images: [
      {
        url: "https://hackerz-form.vercel.app/url_logo.png",
        width: 1200,
        height: 630,
        alt: "Hackerz Forms Preview",
      },
    ],
    type: "website",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
