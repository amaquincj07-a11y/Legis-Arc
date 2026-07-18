import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono, EB_Garamond } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.FRONTEND_URL?.trim() ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl.replace(/\/+$/, "")),
  title: {
    default: "LegisArc",
    template: "%s | LegisArc",
  },
  description:
    "Legislative Records Management & Public Transparency Platform for Local Government Units",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${geistMono.variable} ${ebGaramond.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <TooltipProvider>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
