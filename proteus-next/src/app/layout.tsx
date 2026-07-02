import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import DotGrid from "@/components/DotGrid";
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
  title: {
    default: "PROTEUS — AI Resume Analyzer & Cover Letter Generator",
    template: "%s | PROTEUS",
  },
  description:
    "Analyze your resume against any job description using a 5-agent AI pipeline. Get semantic match scores, gap analysis, bullet-level rewrite suggestions, and tailored cover letters — all from a single paste.",
  keywords: [
    "resume analyzer",
    "AI resume scanner",
    "ATS score checker",
    "job description matcher",
    "cover letter generator",
    "resume optimization tool",
    "job application AI",
    "resume gap analysis",
    "bullet point rewriter",
    "career tools AI",
    "resume vs job description",
    "hiring algorithm simulator",
    "resume scoring",
    "job match score",
    "AI cover letter writer",
    "resume builder AI",
    "job application optimizer",
    "semantic resume matching",
    "NVIDIA NIM AI",
    "full-stack developer resume",
  ],
  authors: [{ name: "Daniel Deshmukh" }],
  creator: "Daniel Deshmukh",
  metadataBase: new URL("https://proteus-beta.vercel.app"),
  openGraph: {
    title: "PROTEUS — AI Resume Analyzer & Cover Letter Generator",
    description:
      "Paste a resume and a job description. Get a semantic match score, gap analysis, rewrite suggestions, and a tailored cover letter in under 60 seconds.",
    url: "https://proteus-beta.vercel.app",
    siteName: "PROTEUS",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PROTEUS — AI Resume Analyzer & Cover Letter Generator",
    description:
      "Semantic match scores, gap analysis, rewrite suggestions, and cover letters from a single JD. Powered by NVIDIA NIM.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#111315" />
      </head>
      <body className="min-h-full flex flex-col bg-[#111315] text-white">
        <DotGrid />
        {children}
      </body>
    </html>
  );
}
