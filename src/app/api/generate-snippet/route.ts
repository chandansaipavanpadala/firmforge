// =============================================================================
// FirmForge — Streaming Snippet Generation API Route
// POST /api/generate-snippet
// Calls Gemini API with streaming, pipes raw text back as ReadableStream
// =============================================================================

import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured. Add it to .env.local",
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

    // ── Call Gemini API with streaming ──────────────────────────────────
    let resultStream;
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          maxOutputTokens: 2048,
        },
      });

      resultStream = await model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      });
    } catch (apiErr: any) {
      console.error("Gemini API error during call:", apiErr);
      return new Response(
        JSON.stringify({
          error: `Gemini API error: ${apiErr.message || apiErr}`,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Stream chunk-by-chunk to the client ──────────────────────────────
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of resultStream.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (err: any) {
          console.error("Gemini stream processing error:", err);
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
