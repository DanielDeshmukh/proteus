import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "PROTEUS — AI-Powered Job Application Intelligence",
  description:
    "PROTEUS analyzes your resume against any job description using a 5-agent AI pipeline. Get semantic match scores, gap analysis, bullet-level rewrite suggestions, and tailored cover letters.",
  keywords: [
    "resume optimizer",
    "job description match",
    "ATS score",
    "cover letter generator",
    "AI resume builder",
  ],
  openGraph: {
    title: "PROTEUS — AI-Powered Job Application Intelligence",
    description:
      "One pipeline. One JD. Every output stays consistent.",
    url: "https://proteus-review.netlify.app",
    siteName: "PROTEUS",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PROTEUS — AI-Powered Job Application Intelligence",
    description:
      "Semantic match scores, gap analysis, rewrite suggestions, and cover letters from a single JD.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#111315] text-white">
        {children}
      </body>
    </html>
  );
}
