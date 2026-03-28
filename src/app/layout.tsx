import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import "./globals.css";

// Configure your custom display font
const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
});

// Configure your custom mono font
const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

// Update the SEO metadata for your actual project
export const metadata: Metadata = {
  title: "AI Stack Matchmaker | Professional Developer Infrastructure Discovery",
  description: "Algorithmically discover the perfect AI and deployment stack. Eliminate project bottlenecks with personalized infrastructure recommendations for Next.js, Cloud Hosting, and Automation.",
  keywords: ["AI Stack", "Developer Tools", "Infrastructure Discovery", "Next.js", "DigitalOcean", "Software Engineering", "Tech Stack Optimization"],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "AI Stack Matchmaker",
    description: "The intelligent way to build your next project's infrastructure.",
    type: "website",
    locale: "en_US",
    url: "https://ai-stack-matchmaker.vercel.app",
    siteName: "AI Stack Matchmaker",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Stack Matchmaker",
    description: "Stop guessing your tech stack. Start building with precision.",
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
      // Inject your custom font variables directly into the HTML tree
      className={`${syne.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080808] text-white">
        {children}
      </body>
    </html>
  );
}