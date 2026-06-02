// =============================================================================
// FirmForge — Streaming Snippet Generation API Route
// POST /api/generate-snippet
// Calls Gemini API with streaming, pipes raw text back as ReadableStream
// =============================================================================

import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const SYSTEM_TEMPLATE = `You are FirmForge, an expert embedded systems engineer with deep knowledge of microcontroller programming. You generate production-ready, professional embedded C code that is:
- Correct for the specific MCU's exact register names and addresses
- Well-commented with inline explanations of what each register bit does
- Properly structured with includes, defines, and function signatures
- Safe — includes error handling and hardware validation where appropriate
- Copy-paste ready for the specified IDE/toolchain

When generating code, always:
1. Start with a brief comment block: MCU, Peripheral, Style, and key parameters
2. Include all necessary #include statements
3. Define any needed constants/macros at the top
4. Write a clean init function: Peripheral_Init()
5. Write a clean usage example function showing how to use it
6. End with a short "// Usage:" comment showing how to call these functions

NEVER generate placeholder comments like "// add your code here".
NEVER truncate the code. Always output the complete, working implementation.
Output ONLY the C code — no markdown, no backticks, no explanation outside comments.`;

interface RequestBody {
  mcu: string;
  peripheral: string;
  codeStyle: string;
  parameters: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ───────────────────────────────────────────────────
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const { allowed, resetIn } = checkRateLimit(ip);

    if (!allowed) {
      return Response.json(
        {
          error: `Rate limit exceeded. Try again in ${Math.ceil(resetIn / 1000)} seconds.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(resetIn / 1000)) },
        }
      );
    }

    // ── Parse and validate ──────────────────────────────────────────────
    const body = (await request.json()) as Partial<RequestBody>;

    if (!body.mcu || !body.peripheral || !body.codeStyle || !body.parameters) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: mcu, peripheral, codeStyle, parameters",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const secretToken = process.env.GEMINI_TOKEN;
    if (!secretToken || secretToken === "your_key_here") {
      return new Response(
        JSON.stringify({
          error: "GEMINI_TOKEN is not configured. Add it to .env.local",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Build the user prompt ───────────────────────────────────────────
    const paramLines = Object.entries(body.parameters)
      .filter(([, v]) => v && v.trim() !== "")
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n");

    const userPrompt = `Generate ${body.codeStyle} code for ${body.mcu} to initialize and use ${body.peripheral}.

Parameters:
${paramLines}

Output only the complete C code file, ready to use.`;

    // ── Call Gemini REST endpoint with streaming ─────────────────────────
    let googleResponse;
    try {
      googleResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${secretToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            system_instruction: {
              parts: [{ text: SYSTEM_TEMPLATE }],
            },
            generationConfig: {
              maxOutputTokens: 2048,
            },
          }),
        }
      );
    } catch (fetchErr: any) {
      console.error("Gemini network error:", fetchErr);
      return new Response(
        JSON.stringify({
          error: `Gemini communication failure: ${fetchErr.message || fetchErr}`,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!googleResponse.ok) {
      const errorText = await googleResponse.text();
      console.error("Gemini service response error:", googleResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: `Gemini service error: ${googleResponse.status}`,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Stream and parse chunk-by-chunk to the client ────────────────────
    const stream = new ReadableStream({
      async start(controller) {
        const reader = googleResponse.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            // Keep the last potentially incomplete line in the buffer
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data: ")) continue;

              const dataStr = trimmed.slice(6).trim();
              try {
                const parsed = JSON.parse(dataStr);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  controller.enqueue(new TextEncoder().encode(text));
                }
              } catch {
                // Ignore parse errors on individual SSE lines
              }
            }
          }

          // Process remaining buffer
          if (buffer.trim().startsWith("data: ")) {
            const dataStr = buffer.trim().slice(6).trim();
            try {
              const parsed = JSON.parse(dataStr);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                controller.enqueue(new TextEncoder().encode(text));
              }
            } catch {
              // Ignore
            }
          }

          controller.close();
        } catch (err: any) {
          console.error("Gemini stream parser error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("Generate snippet error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
