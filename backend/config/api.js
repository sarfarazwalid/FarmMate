// config/api.js
// NOTE: This file's API_CONFIG object is populated lazily via getter function
// to avoid the issue where dotenv.config() hasn't been called yet at import time.

export const getOpenRouterApiKey = () => {
  return process.env.OPENROUTER_API_KEY || '';
};

export const getApiConfig = () => ({
  OPENROUTER_API_KEY: getOpenRouterApiKey(),
  OPENROUTER_BASE_URL: "https://openrouter.ai/api/v1",
  DEFAULT_MODEL: "anthropic/claude-3-haiku",
  VISION_MODEL: "anthropic/claude-3-haiku",
});

export const validateApiKeys = () => {
  let hasErrors = false;

  // Validate MongoDB URI
  if (!process.env.MONGODB_URI) {
    console.warn("⚠️  WARNING: MONGODB_URI is not configured!");
    console.warn("   Please set MONGODB_URI in your .env file or environment variables");
    console.warn("   Get your connection string from MongoDB Atlas: https://cloud.mongodb.com/");
    hasErrors = true;
  } else {
    console.log("✅ MONGODB_URI is configured");
  }

  // Validate JWT Secret
  if (!process.env.JWT_SECRET) {
    console.warn("⚠️  WARNING: JWT_SECRET is not configured!");
    console.warn("   Please set JWT_SECRET in your .env file or environment variables");
    hasErrors = true;
  } else {
    console.log("✅ JWT_SECRET is configured");
  }

  // Validate Google AI API Key
  if (!process.env.GOOGLE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
    console.warn("⚠️  WARNING: GOOGLE_AI_API_KEY is not configured!");
    console.warn("   Please set GOOGLE_AI_API_KEY in your .env file or environment variables");
    console.warn("   Get your API key from: https://makersuite.google.com/app/apikey");
    hasErrors = true;
  } else {
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    console.log("✅ GOOGLE_AI_API_KEY is configured");
  }

  // Validate OpenRouter API Key
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("⚠️  WARNING: OPENROUTER_API_KEY not configured!");
    console.warn("   Please set OPENROUTER_API_KEY in your .env file or environment variables");
    console.warn("   Get your API key from: https://openrouter.ai/keys");
    hasErrors = true;
  } else {
    console.log("✅ OPENROUTER_API_KEY is configured");
  }

  if (hasErrors) {
    console.warn("\n⚠️  Some API keys are missing. The application may not function correctly.\n");
  } else {
    console.log("\n✅ All API keys configured successfully.\n");
  }
};
