/**
 * Default Gemini model for chat. Prefer a current Flash variant — some older ids (e.g. gemini-2.0-flash)
 * can show "free_tier_requests limit: 0" on certain API keys/projects even when the key is valid.
 * Override with env AI_MODEL_ID.
 */
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash" as const;
