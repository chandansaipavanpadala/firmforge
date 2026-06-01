// =============================================================================
// FirmForge — Streaming RTOS Architect API Route
// POST /api/generate-rtos
// Calls Claude API with streaming, generates 3 structured files (main.c,
// tasks.h, config.h) and pipes the raw text back as a ReadableStream.
// The frontend is responsible for parsing the ===FILE:=== delimiters.
// =============================================================================

import { NextRequest } from "next/server";

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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      return new Response(
        JSON.stringify({
          error: "ANTHROPIC_API_KEY is not configured. Add it to .env.local",
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
          max_tokens: 8192,
          stream: true,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      }
    );

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error(
        "Anthropic API error:",
        anthropicResponse.status,
        errorText
      );
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
