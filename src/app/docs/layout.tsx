import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "FirmForge supported MCUs, peripherals, example prompts and quick start guide",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
