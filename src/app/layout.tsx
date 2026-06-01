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
  title: "FirmForge — AI Firmware Code Generator for Embedded Engineers",
  description:
    "Generate production-ready embedded C code for STM32, ESP32, Arduino and more. From peripheral snippets to full RTOS architectures — powered by AI.",
  keywords: [
    "firmware",
    "embedded C",
    "STM32",
    "ESP32",
    "Arduino",
    "RTOS",
    "FreeRTOS",
    "code generator",
    "microcontroller",
    "ECE",
  ],
  authors: [{ name: "FirmForge" }],
  openGraph: {
    title: "FirmForge — AI Firmware Code Generator",
    description:
      "Generate production-ready embedded C code for STM32, ESP32, Arduino and more.",
    type: "website",
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
