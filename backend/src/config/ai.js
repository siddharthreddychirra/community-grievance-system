/**
 * AI Configuration
 * Supports: OpenAI GPT, Google Gemini, and HuggingFace
 */

const AI_PROVIDER = process.env.AI_PROVIDER || "gemini"; // "openai", "gemini", or "huggingface"
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || "";

// Model configurations
const AI_CONFIG = {
  openai: {
    apiKey: OPENAI_API_KEY,
    baseURL: "https://api.openai.com/v1",
    model: "gpt-3.5-turbo",
    embeddingModel: "text-embedding-ada-002",
  },
  gemini: {
    apiKey: GEMINI_API_KEY,
    model: "gemini-pro",
    // Free tier: 60 requests/minute, 1500 requests/day
    // Get key from: https://makersuite.google.com/app/apikey
  },
  huggingface: {
    apiKey: HUGGINGFACE_API_KEY,
    baseURL: "https://api-inference.huggingface.co/models",
    classificationModel: "facebook/bart-large-mnli",
    embeddingModel: "sentence-transformers/all-MiniLM-L6-v2",
  },
};

module.exports = {
  AI_PROVIDER,
  AI_CONFIG,
};
