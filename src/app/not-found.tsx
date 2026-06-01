"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="text-8xl font-mono font-bold text-[#00D4FF]/10">
          404
        </div>
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Page not found
        </h1>
        <p className="text-[#6B6B8A] text-sm">
          This route doesn&apos;t exist in the firmware.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-[#00D4FF] text-black rounded-lg font-bold text-sm hover:bg-cyan-300 transition-all"
        >
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
