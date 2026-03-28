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
  title: "AI Stack Intelligence | Find Your Perfect AI Stack",
  description: "Answer 3 questions about your workflow. Get a personalized dashboard of AI tools that eliminates your biggest bottleneck.",
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