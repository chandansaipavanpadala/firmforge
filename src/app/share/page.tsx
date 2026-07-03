"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getSharedSnippet, type SharedSnippet } from "@/lib/supabase";
import { CodeBlock } from "@/components/code-block";
import Link from "next/link";

function SharePageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [snippet, setSnippet] = useState<SharedSnippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function loadSnippet(targetId: string) {
      try {
        const data = await getSharedSnippet(targetId);
        if (data) {
          setSnippet(data);
          if (data.metadata?.label) {
            document.title = `${data.metadata.label} | FirmForge`;
          }
        } else {
          setError("Snippet not found");
        }
      } catch (err) {
        setError("Failed to load snippet");
      } finally {
        setLoading(false);
      }
    }

    loadSnippet(id);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grid-pattern-subtle">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00D4FF] mx-auto"></div>
          <p className="text-sm text-[#6B6B8A] font-medium" style={{ fontFamily: "var(--font-dm-sans)" }}>
            Loading shared snippet...
          </p>
        </div>
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-grid-pattern-subtle">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4 opacity-30 text-red-500">404</div>
          <h1
            className="text-2xl font-bold text-[#E8E8F0]"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            {error || "Snippet Not Found"}
          </h1>
          <p
            className="text-sm text-[#6B6B8A] max-w-md"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            This shared code snippet does not exist, may have been removed, or the link is invalid.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all mt-4"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Generate Your Own Code
          </Link>
        </div>
      </div>
    );
  }

  const meta = snippet.metadata;
  const createdDate = new Date(snippet.created_at).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  // For RTOS type, try to parse files
  let isRTOS = meta.type === "rtos";
  let rtosFiles: Record<string, string> = {};
  if (isRTOS) {
    try {
      rtosFiles = JSON.parse(snippet.code);
    } catch {
      isRTOS = false;
    }
  }

  return (
    <div className="min-h-screen bg-grid-pattern-subtle">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/"
              className="text-[#00D4FF]/60 hover:text-[#00D4FF] transition-colors"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              FirmForge
            </Link>
            <span className="text-[#6B6B8A]">&rarr;</span>
            <span className="text-[#6B6B8A]">Shared Snippet</span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold text-[#E8E8F0]"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            {meta.label || "Shared Code"}
          </h1>

          <div className="flex items-center gap-3 flex-wrap">
            {meta.type && (
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                  meta.type === "snippet"
                    ? "bg-[#00D4FF]/10 text-[#00D4FF]"
                    : "bg-[#7C3AED]/10 text-[#7C3AED]"
                }`}
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                {meta.type === "snippet" ? "Snippet" : "RTOS"}
              </span>
            )}
            {meta.mcu && (
              <span
                className="text-xs text-[#6B6B8A] bg-[#1E1E2E] px-2 py-0.5 rounded"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                {meta.mcu}
              </span>
            )}
            {meta.peripheral && (
              <span
                className="text-xs text-[#6B6B8A] bg-[#1E1E2E] px-2 py-0.5 rounded"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                {meta.peripheral}
              </span>
            )}
            {meta.rtos && (
              <span
                className="text-xs text-[#6B6B8A] bg-[#1E1E2E] px-2 py-0.5 rounded"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                {meta.rtos}
              </span>
            )}
            <span className="text-xs text-[#6B6B8A]/60">
              Shared on {createdDate}
            </span>
          </div>
        </div>

        {/* Code */}
        {isRTOS ? (
          <div className="space-y-6">
            {Object.entries(rtosFiles)
              .filter(([, content]) => (content as string).length > 0)
              .map(([filename, content]) => (
                <div key={filename}>
                  <CodeBlock
                    code={content as string}
                    filename={filename}
                  />
                </div>
              ))}
          </div>
        ) : (
          <CodeBlock
            code={snippet.code}
            filename={meta.label || "firmware.c"}
          />
        )}

        {/* CTA */}
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-[#00D4FF] text-black hover:bg-[#33DDFF] glow-cyan transition-all"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Generate Your Own Code
          </Link>
          <span
            className="text-xs text-[#6B6B8A]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Powered by FirmForge
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-grid-pattern-subtle">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00D4FF] mx-auto"></div>
          <p className="text-sm text-[#6B6B8A] font-medium" style={{ fontFamily: "var(--font-dm-sans)" }}>
            Loading...
          </p>
        </div>
      </div>
    }>
      <SharePageContent />
    </Suspense>
  );
}
