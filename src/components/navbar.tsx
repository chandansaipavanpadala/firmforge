"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NAV_LINKS } from "@/lib/constants";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 navbar-blur transition-all duration-300 ${
        scrolled ? "border-b border-[#1E1E2E]" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Chip-like SVG icon */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-300 group-hover:rotate-12"
            >
              <rect
                x="6"
                y="6"
                width="16"
                height="16"
                rx="2"
                fill="#00D4FF"
                fillOpacity="0.15"
                stroke="#00D4FF"
                strokeWidth="1.5"
              />
              <rect x="10" y="10" width="8" height="8" rx="1" fill="#00D4FF" />
              {/* Pins */}
              <line x1="14" y1="2" x2="14" y2="6" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="14" y1="22" x2="14" y2="26" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="14" x2="6" y2="14" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="22" y1="14" x2="26" y2="14" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="8" y1="2" x2="8" y2="6" stroke="#00D4FF" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
              <line x1="20" y1="2" x2="20" y2="6" stroke="#00D4FF" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
              <line x1="8" y1="22" x2="8" y2="26" stroke="#00D4FF" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
              <line x1="20" y1="22" x2="20" y2="26" stroke="#00D4FF" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
            </svg>
            <span
              className="text-xl font-bold tracking-tight text-[#E8E8F0]"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Firm<span className="text-[#00D4FF]">Forge</span>
            </span>
          </Link>

          {/* Center Nav Links */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "text-[#00D4FF]"
                      : "text-[#6B6B8A] hover:text-[#E8E8F0]"
                  }`}
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* GitHub icon */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[#6B6B8A] hover:text-[#E8E8F0] hover:bg-[#1E1E2E] transition-colors"
              aria-label="GitHub"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>

            {/* Try Free button */}
            <Link
              href="/generate"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg border border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all duration-200 glow-cyan-sm"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Try Free
            </Link>

            {/* Mobile menu button */}
            <button
              className="sm:hidden p-2 rounded-lg text-[#6B6B8A] hover:text-[#E8E8F0] hover:bg-[#1E1E2E] transition-colors"
              aria-label="Menu"
              onClick={() => {
                const mobileMenu = document.getElementById("mobile-menu");
                mobileMenu?.classList.toggle("hidden");
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className="hidden sm:hidden border-t border-[#1E1E2E] pb-4"
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-[#00D4FF] bg-[#00D4FF]/10"
                    : "text-[#6B6B8A] hover:text-[#E8E8F0]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/generate"
            className="block mx-4 mt-2 px-4 py-2.5 text-sm font-semibold text-center rounded-lg border border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all"
          >
            Try Free
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
