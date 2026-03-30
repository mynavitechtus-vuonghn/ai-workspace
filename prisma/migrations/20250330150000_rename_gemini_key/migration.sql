-- Rename stored key column: Anthropic → Google Generative AI (Gemini)
ALTER TABLE "UserSettings" RENAME COLUMN "anthropicApiKey" TO "googleGenerativeAiApiKey";
