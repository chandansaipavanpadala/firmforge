"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="text-6xl font-mono text-[#00D4FF] opacity-20">ERR</div>
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Something went wrong
        </h1>
        <p className="text-[#6B6B8A] text-sm font-mono">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-[#12121A] border border-[#1E1E2E] text-[#00D4FF] rounded-lg font-mono text-sm hover:border-[#00D4FF]/40 transition-all cursor-pointer"
        >
          Try again
        </button>
      </motion.div>
    </div>
  );
}
