/**
 * Chatbot API Routes
 * Handles AI-powered chat, complaint guidance, and voice input
 */

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getChatResponse,
  getComplaintGuidance,
  findSimilarComplaints,
  translateText,
  detectLanguage,
  analyzeSentiment,
} = require("../services/chatbotService");
const User = require("../models/User");

// ===============================
// CHAT WITH AI ASSISTANT
// ===============================
router.post("/chat", auth, async (req, res) => {
  try {
    const { message, conversationHistory = [], language = "en" } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get user context
    const user = await User.findById(req.user.id || req.user._id);
    const context = {
      userId: user._id,
      locality: user.locality,
      conversationHistory: conversationHistory,
    };

    // Detect language if not provided
    let detectedLang = language;
    if (language === "auto") {
      detectedLang = await detectLanguage(message);
    }

    // Get AI response
    let result = await getChatResponse(message, context);

    // Translate response if needed
    if (detectedLang !== "en") {
      const translated = await translateText(result.response, detectedLang);
      result.response = translated.translated;
      result.language = detectedLang;
    }

    // Analyze sentiment for tracking
    const sentiment = await analyzeSentiment(message);

    res.json({
      response: result.response,
      isAI: result.isAI,
      language: detectedLang,
      sentiment: sentiment,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to get response", message: error.message });
  }
});

// ===============================
// GUIDED COMPLAINT FILING
// ===============================
router.post("/guide-complaint", auth, async (req, res) => {
  try {
    const { stage = "start", userInput, complaintData = {} } = req.body;

    const user = await User.findById(req.user.id || req.user._id);
    const context = {
      userId: user._id,
      locality: user.locality,
      complaintData: complaintData,
    };

    const guidance = await getComplaintGuidance(stage, userInput, context);

    res.json({
      ...guidance,
      currentStage: stage,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Guidance error:", error);
    res.status(500).json({ error: "Failed to get guidance" });
  }
});

// ===============================
// FIND SIMILAR COMPLAINTS
// ===============================
router.post("/similar-complaints", auth, async (req, res) => {
  try {
    const { description, limit = 5 } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }

    const user = await User.findById(req.user.id || req.user._id);
    const similar = await findSimilarComplaints(description, user.locality, limit);

    res.json({
      similar: similar,
      count: similar.length,
      message: similar.length > 0 
        ? `Found ${similar.length} similar complaint(s) in your area`
        : "No similar complaints found",
    });
  } catch (error) {
    console.error("Similar complaints error:", error);
    res.status(500).json({ error: "Failed to find similar complaints" });
  }
});

// ===============================
// TRANSLATE TEXT
// ===============================
router.post("/translate", auth, async (req, res) => {
  try {
    const { text, targetLanguage = "en" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    if (!["en", "hi", "te"].includes(targetLanguage)) {
      return res.status(400).json({ error: "Unsupported language. Use: en, hi, te" });
    }

    const result = await translateText(text, targetLanguage);

    res.json({
      original: text,
      translated: result.translated,
      targetLanguage: targetLanguage,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Translation failed" });
  }
});

// ===============================
// DETECT LANGUAGE
// ===============================
router.post("/detect-language", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const language = await detectLanguage(text);

    const languageNames = {
      en: "English",
      hi: "Hindi",
      te: "Telugu"
    };

    res.json({
      text: text,
      detectedLanguage: language,
      languageName: languageNames[language] || "Unknown",
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Language detection error:", error);
    res.status(500).json({ error: "Language detection failed" });
  }
});

// ===============================
// ANALYZE SENTIMENT
// ===============================
router.post("/analyze-sentiment", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const sentiment = await analyzeSentiment(text);

    res.json({
      text: text,
      ...sentiment,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    res.status(500).json({ error: "Sentiment analysis failed" });
  }
});

// ===============================
// VOICE TO TEXT (Frontend handles, this validates)
// ===============================
router.post("/voice-input", auth, async (req, res) => {
  try {
    const { transcript, language = "en" } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    // Process the transcript (detect language, analyze, etc.)
    const detectedLang = await detectLanguage(transcript);
    const sentiment = await analyzeSentiment(transcript);

    res.json({
      transcript: transcript,
      detectedLanguage: detectedLang,
      sentiment: sentiment,
      processed: true,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Voice input error:", error);
    res.status(500).json({ error: "Voice input processing failed" });
  }
});

// ===============================
// GET CHATBOT STATUS (Check if AI is available)
// ===============================
router.get("/status", auth, async (req, res) => {
  try {
    const { AI_PROVIDER, AI_CONFIG } = require("../config/ai");
    
    const hasOpenAI = !!AI_CONFIG.openai.apiKey;
    const hasGemini = !!AI_CONFIG.gemini.apiKey;
    const aiAvailable = hasOpenAI || hasGemini;
    
    res.json({
      aiAvailable: aiAvailable,
      provider: aiAvailable ? AI_PROVIDER : "fallback",
      providers: {
        openai: hasOpenAI,
        gemini: hasGemini,
      },
      features: {
        chat: true,
        guidance: true,
        similarComplaints: true,
        translation: aiAvailable,
        voiceInput: true,
        sentiment: aiAvailable,
      },
      supportedLanguages: ["en", "hi", "te"],
      limits: AI_PROVIDER === "gemini" ? {
        requestsPerMinute: 60,
        requestsPerDay: 1500,
        cost: "FREE"
      } : AI_PROVIDER === "openai" ? {
        cost: "$0.002 per request"
      } : {},
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Status error:", error);
    res.status(500).json({ error: "Failed to get status" });
  }
});

module.exports = router;
