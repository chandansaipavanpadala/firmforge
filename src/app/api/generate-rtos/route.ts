// =============================================================================
// FirmForge — Streaming RTOS Architect API Route
// POST /api/generate-rtos
// Calls Gemini API with streaming, generates 3 structured files (main.c,
// tasks.h, config.h) and pipes the raw text back as a ReadableStream.
// The frontend is responsible for parsing the ===FILE:=== delimiters.
// =============================================================================

import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

interface RequestBody {
  prompt: string;
  mcu: string;
  rtos: string;
  options: {
    includeSchedulingDiagram: boolean;
    includeHeaders: boolean;
    addDetailedComments: boolean;
  };
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

    if (!body.prompt || body.prompt.trim().length < 10) {
      return new Response(
        JSON.stringify({
          error: "Please describe your firmware behavior in more detail.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!body.mcu || !body.rtos) {
      return new Response(
        JSON.stringify({ error: "MCU and RTOS are required." }),
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

    const { prompt, mcu, rtos, options } = body as RequestBody;

    // ── Build the system prompt ─────────────────────────────────────────
    const systemPrompt = `You are FirmForge, an expert embedded systems architect specializing in ${rtos} firmware for ${mcu} microcontrollers. You generate complete, production-ready firmware project scaffolds.

Your output MUST follow this EXACT format with these EXACT delimiters — no exceptions:

===FILE:main.c===
[complete main.c content here]
===FILE:tasks.h===
[complete tasks.h content here]
===FILE:config.h===
[complete config.h content here]
===END===

Rules:
- Each file must be complete and compilable — no truncation, no placeholders
- main.c: includes all inits, task creation, scheduler start, main loop
- tasks.h: all task function declarations, queue handles, semaphore handles, task parameters/structs, extern declarations
- config.h: all #define constants — pin numbers, timing values, thresholds, buffer sizes, RTOS config overrides, WiFi/MQTT credentials as placeholders
- Every function must have a comment block explaining what it does
- Use correct ${mcu}-specific APIs and register names throughout
- FreeRTOS tasks must use proper xTaskCreate() with correct stack sizes
- Include proper error handling: if a peripheral init fails, log it and halt
${options.addDetailedComments ? "- Add EXTREMELY detailed comments explaining every non-obvious line" : "- Add concise but clear comments on key sections"}
${options.includeHeaders ? "- Include full list of required headers in a comment at top of main.c" : ""}
Output ONLY the 3 files in the exact format above. No markdown. No explanation.`;

    // ── Build the user prompt ───────────────────────────────────────────
    const userPrompt = `Generate a complete ${rtos} firmware project for ${mcu}.

Behavior description:
${prompt}

Requirements:
- Target MCU: ${mcu}
- RTOS: ${rtos}
- Include all necessary peripheral initialization
- All tasks must be properly scheduled with appropriate priorities and stack sizes
- Use meaningful task, queue, and semaphore names based on the behavior

Generate all 3 files now.`;

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
              parts: [{ text: systemPrompt }],
            },
            generationConfig: {
              maxOutputTokens: 8192,
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
        "Content-Type": "text/plain",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Generate RTOS error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
