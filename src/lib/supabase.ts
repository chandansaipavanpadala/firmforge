// =============================================================================
// FirmForge — Supabase Client & Share Functions
// =============================================================================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Client initialization (gracefully degrades if env vars are not set)
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let supabase: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

/** Check if the share feature is available (Supabase is configured) */
export function isShareEnabled(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

// ---------------------------------------------------------------------------
// Short ID generation (6 chars, URL-safe)
// ---------------------------------------------------------------------------

function generateShortId(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ---------------------------------------------------------------------------
// Share API
// ---------------------------------------------------------------------------

export interface ShareMetadata {
  type: "snippet" | "rtos";
  mcu?: string;
  peripheral?: string;
  rtos?: string;
  codeStyle?: string;
  label?: string;
}

export interface SharedSnippet {
  short_id: string;
  code: string;
  metadata: ShareMetadata;
  created_at: string;
}

/**
 * Create a shareable link for generated code.
 * Returns the short ID, or null if Supabase is not configured.
 */
export async function createShareLink(
  code: string,
  metadata: ShareMetadata
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const shortId = generateShortId();

  const { error } = await client.from("snippets").insert({
    short_id: shortId,
    code,
    metadata,
  });

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error("Failed to create share link. Please try again.");
  }

  return shortId;
}

/**
 * Retrieve a shared snippet by its short ID.
 * Returns null if not found.
 */
export async function getSharedSnippet(
  shortId: string
): Promise<SharedSnippet | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from("snippets")
    .select("short_id, code, metadata, created_at")
    .eq("short_id", shortId)
    .single();

  if (error || !data) return null;
  return data as SharedSnippet;
}
