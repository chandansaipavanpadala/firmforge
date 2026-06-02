// =============================================================================
// FirmForge — Streaming RTOS Architect API Route
// POST /api/generate-rtos
// Calls Gemini API with streaming, generates 3 structured files (main.c,
// tasks.h, config.h) and pipes the raw text back as a ReadableStream.
// The frontend is responsible for parsing the ===FILE:=== delimiters.
// =============================================================================

import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured. Add it to .env.local",
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

    // ── Call Gemini API with streaming using official SDK ────────────────
    let resultStream = null;
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-flash-latest"
    ];

    let lastError: any = null;
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          generationConfig: {
            maxOutputTokens: 8192,
          },
        });

        resultStream = await model.generateContentStream({
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        });

        // Break on successful model content stream initialization
        break;
      } catch (err: any) {
        console.warn(`⚠️ Model ${modelName} failed. Trying next candidate. Error:`, err.message || err);
        lastError = err;
      }
    }

    if (!resultStream) {
      console.error("Gemini API error — all models failed:", lastError);
      return new Response(
        JSON.stringify({
          error: `Gemini API error: ${lastError?.message || lastError}`,
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
