// =============================================================================
// FirmForge — Streaming Snippet Generation API Route
// POST /api/generate-snippet
// Calls Claude API with streaming, pipes raw text back as ReadableStream
// =============================================================================

import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are FirmForge, an expert embedded systems engineer with deep knowledge of microcontroller programming. You generate production-ready, professional embedded C code that is:
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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      return new Response(
        JSON.stringify({
          error: "ANTHROPIC_API_KEY is not configured. Add it to .env.local",
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

    // ── Call Anthropic API with streaming ────────────────────────────────
    const anthropicResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          stream: true,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        }),
      }
    );

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("Anthropic API error:", anthropicResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: `Anthropic API error: ${anthropicResponse.status}`,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Stream SSE → plain text TransformStream ─────────────────────────
    const stream = new ReadableStream({
      async start(controller) {
        const reader = anthropicResponse.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Process complete SSE lines
            const lines = buffer.split("\n");
            // Keep the last potentially incomplete line in the buffer
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;

              const data = line.slice(6).trim();
              if (data === "[DONE]") {
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(data);

                if (parsed.type === "content_block_delta") {
                  const text = parsed.delta?.text;
                  if (text) {
                    controller.enqueue(new TextEncoder().encode(text));
                  }
                }

                if (parsed.type === "message_stop") {
                  controller.close();
                  return;
                }
              } catch {
                // Skip non-JSON lines (event: lines, empty lines, etc.)
              }
            }
          }

          // Process any remaining buffer
          if (buffer.startsWith("data: ")) {
            const data = buffer.slice(6).trim();
            if (data && data !== "[DONE]") {
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === "content_block_delta") {
                  const text = parsed.delta?.text;
                  if (text) {
                    controller.enqueue(new TextEncoder().encode(text));
                  }
                }
              } catch {
                // Ignore parse errors on final buffer
              }
            }
          }

          controller.close();
        } catch (err) {
          console.error("Stream processing error:", err);
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
