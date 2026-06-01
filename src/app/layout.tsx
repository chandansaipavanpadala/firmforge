import type { Metadata } from "next";
import { JetBrains_Mono, DM_Sans, Syne } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FirmForge — Firmware from a Single Prompt",
    template: "%s | FirmForge",
  },
  description:
    "Generate production-ready embedded C firmware for STM32, ESP32, " +
    "Arduino and more. Peripheral snippets and full RTOS architectures " +
    "from plain English prompts.",
  keywords: [
    "embedded C",
    "STM32",
    "ESP32",
    "FreeRTOS",
    "firmware generator",
    "microcontroller",
    "UART",
    "SPI",
    "I2C",
    "AI coding tool",
    "ECE",
  ],
  authors: [{ name: "FirmForge" }],
  openGraph: {
    title: "FirmForge — Firmware from a Single Prompt",
    description:
      "Generate embedded C firmware for STM32, ESP32, Arduino and " +
      "more using AI. Peripheral snippets and full RTOS architectures.",
    url: "https://firmforge.vercel.app",
    siteName: "FirmForge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FirmForge — Firmware from a Single Prompt",
    description:
      "AI-powered embedded C firmware generator for ECE engineers.",
  },
  robots: {
    index: true,
    follow: true,
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
      data-scroll-behavior="smooth"
      className={`${jetbrainsMono.variable} ${dmSans.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0A0F] text-[#E8E8F0]">
        <TooltipProvider delay={200}>
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </TooltipProvider>
      </body>
    </html>
  );
}
