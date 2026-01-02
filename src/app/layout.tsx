import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learn Your Way - AI-Augmented Textbook",
  description: "Transform and augment textbooks using generative AI, adding layers of multiple representations and personalization while maintaining content integrity and quality.",
  keywords: ["Learn Your Way", "AI", "Education", "Personalized Learning", "Textbook", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"],
  authors: [{ name: "Learn Your Way Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Learn Your Way - AI-Augmented Textbook",
    description: "Personalized learning experience with AI-powered textbook transformations",
    url: "https://chat.z.ai",
    siteName: "Learn Your Way",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn Your Way - AI-Augmented Textbook",
    description: "Personalized learning experience with AI-powered textbook transformations",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
