import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Orbitron } from "next/font/google";
import ContextProvider from "@/context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Bridge.SecureChain.ai",
  description:
    "Cross-chain bridge for the SecureChain AI ecosystem. Connect a wallet and move assets with security evidence close at hand.",
  icons: { icon: "/favicon.png" },
};

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");

  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-background font-sans text-foreground"
        suppressHydrationWarning
      >
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  );
}
