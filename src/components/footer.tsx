import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#1E1E2E] bg-[#0A0A0F]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Copyright & Attribution */}
          <div className="flex flex-col gap-1 items-center sm:items-start">
            <p
              className="text-sm text-[#6B6B8A]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              FirmForge © 2026 · Built for ECE Engineers · HackIndia 2026
            </p>
            <p
              className="text-xs text-[#6B6B8A]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Developed by Team No_Name:{" "}
              <a
                href="https://github.com/chandansaipavanpadala"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00D4FF] transition-colors underline decoration-dotted"
              >
                Chandan Sai Pavan Padala
              </a>{" "}
              &amp;{" "}
              <a
                href="https://github.com/rushikesh-D69"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00D4FF] transition-colors underline decoration-dotted"
              >
                D Rushikesh
              </a>
            </p>
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#6B6B8A] hover:text-[#00D4FF] transition-colors"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              GitHub
            </a>
            <Link
              href="/docs"
              className="text-sm text-[#6B6B8A] hover:text-[#00D4FF] transition-colors"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Docs
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#6B6B8A] hover:text-[#00D4FF] transition-colors"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Report Bug
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
