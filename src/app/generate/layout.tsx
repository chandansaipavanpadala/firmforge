import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Generate Firmware | FirmForge",
  description:
    "Generate embedded C firmware code for STM32, ESP32, Arduino and more using AI",
};

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
