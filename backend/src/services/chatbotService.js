/**
 * Intelligent Chatbot Service with AI Integration
 * Supports: OpenAI GPT-3.5 and Google Gemini
 * Features: Complaint guidance, similar issue detection, multilingual support
 */

const Complaint = require("../models/Complaint");
const { AI_PROVIDER, AI_CONFIG } = require("../config/ai");

// Initialize AI clients based on provider
let openai = null;
let gemini = null;

if (AI_PROVIDER === "openai" && AI_CONFIG.openai.apiKey) {
  const OpenAI = require("openai");
  openai = new OpenAI({
    apiKey: AI_CONFIG.openai.apiKey,
  });
  console.log("✅ OpenAI initialized");
} else if (AI_PROVIDER === "gemini" && AI_CONFIG.gemini.apiKey) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  gemini = new GoogleGenerativeAI(AI_CONFIG.gemini.apiKey);
  console.log("✅ Google Gemini initialized");
} else {
  console.log("⚠️ No AI provider configured - using fallback responses");
}

/**
 * Get AI-powered chat response
 */
async function getChatResponse(message, context = {}) {
  const { userId, locality, conversationHistory = [] } = context;

  // If no AI is available, use fallback
  if (!openai && !gemini) {
    return getFallbackResponse(message, context);
  }

  try {
    const systemPrompt = getSystemPrompt(locality);
    
    // Use OpenAI
    if (openai) {
      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.slice(-6),
        { role: "user", content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.7,
        max_tokens: 300,
      });

      return {
        response: completion.choices[0].message.content,
        isAI: true,
        provider: "openai"
      };
    }
    
    // Use Gemini
    if (gemini) {
      const model = gemini.getGenerativeModel({ model: "gemini-pro" });
      
      // Format conversation history for Gemini
      const conversationText = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      
      const prompt = `${systemPrompt}\n\nConversation so far:\n${conversationText}\n\nUser: ${message}\nAssistant:`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        response: text,
        isAI: true,
        provider: "gemini"
      };
    }
  } catch (error) {
    console.error("AI Error:", error.message);
    return getFallbackResponse(message, context);
  }
}

/**
 * Guide user through complaint filing
 */
async function getComplaintGuidance(stage, userInput, context = {}) {
  const { locality } = context;

  const guidanceStages = {
    start: {
      question: "I'll help you file a complaint. What issue are you facing? Please describe it briefly.",
      hints: ["Roads/potholes", "Water supply", "Electricity", "Garbage/sanitation", "Other issues"],
      nextStage: "details"
    },
    details: {
      question: "Thank you. Can you provide more details? Where exactly is this happening? (landmark, street name, area)",
      hints: ["Be specific about location", "Mention any landmarks"],
      nextStage: "evidence"
    },
    evidence: {
      question: "Great! Do you have any photos or videos of this issue? Evidence helps resolve complaints 60% faster.",
      hints: ["Upload clear photos", "Multiple angles are helpful", "Ensure good lighting"],
      nextStage: "contact"
    },
    contact: {
      question: "Would you like to be notified via SMS/Email when your complaint is assigned or resolved?",
      hints: ["Email notifications are automatic", "You can add phone number in profile"],
      nextStage: "similar"
    },
    similar: {
      question: "Let me check if similar complaints exist in your area...",
      nextStage: "submit"
    },
    submit: {
      question: "Perfect! Your complaint is ready to submit. Shall I create it for you?",
      hints: ["Review your details", "You can edit later"],
      nextStage: "complete"
    }
  };

  const currentStage = guidanceStages[stage] || guidanceStages.start;
  
  // Check for similar complaints if at that stage
  let similarComplaints = [];
  if (stage === "similar" && userInput) {
    similarComplaints = await findSimilarComplaints(userInput, locality);
  }

  return {
    question: currentStage.question,
    hints: currentStage.hints,
    nextStage: currentStage.nextStage,
    similarComplaints: similarComplaints,
  };
}

/**
 * Find similar complaints in the area
 */
async function findSimilarComplaints(description, locality, limit = 3) {
  try {
    const keywords = extractKeywords(description);
    
    // Search for complaints with similar keywords in the same locality
    const query = {
      locality: locality,
      status: { $in: ["resolved", "closed"] }, // Show resolved ones as reference
      $or: [
        { title: { $regex: keywords.join("|"), $options: "i" } },
        { description: { $regex: keywords.join("|"), $options: "i" } }
      ]
    };

    const similar = await Complaint.find(query)
      .select("title description status department resolvedAt createdAt")
      .limit(limit)
      .sort({ resolvedAt: -1 });

    return similar.map(c => ({
      id: c._id,
      title: c.title,
      description: c.description.substring(0, 100) + "...",
      department: c.department,
      status: c.status,
      resolutionTime: c.resolvedAt ? 
        Math.round((new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24)) : null
    }));
  } catch (error) {
    console.error("Similar complaints error:", error);
    return [];
  }
}

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  const stopWords = ["the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "in", "on", "at", "to", "for"];
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word));
  
  return [...new Set(words)].slice(0, 5); // Unique, max 5 keywords
}

/**
 * Translate text using AI
 */
async function translateText(text, targetLang = "en") {
  if (!openai && !gemini) {
    return { translated: text, detectedLanguage: "en" };
  }

  try {
    const langNames = {
      en: "English",
      hi: "Hindi",
      te: "Telugu"
    };

    const prompt = `Translate the following text to ${langNames[targetLang]}. Only return the translation, nothing else:\n\n${text}`;

    // Use OpenAI
    if (openai) {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 200,
      });

      return {
        translated: completion.choices[0].message.content.trim(),
        detectedLanguage: targetLang,
      };
    }

    // Use Gemini
    if (gemini) {
      const model = gemini.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;

      return {
        translated: response.text().trim(),
        detectedLanguage: targetLang,
      };
    }
  } catch (error) {
    console.error("Translation error:", error);
    return { translated: text, detectedLanguage: "en" };
  }
}

/**
 * Detect language of text
 */
async function detectLanguage(text) {
  if (!openai && !gemini) {
    return "en";
  }

  try {
    const prompt = `Detect the language of this text and respond with only one of these: "en" (English), "hi" (Hindi), or "te" (Telugu).\n\nText: ${text}`;

    // Use OpenAI
    if (openai) {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
        max_tokens: 10,
      });

      const detected = completion.choices[0].message.content.trim().toLowerCase();
      return ["en", "hi", "te"].includes(detected) ? detected : "en";
    }

    // Use Gemini
    if (gemini) {
      const model = gemini.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const detected = response.text().trim().toLowerCase();
      return ["en", "hi", "te"].includes(detected) ? detected : "en";
    }
  } catch (error) {
    console.error("Language detection error:", error);
    return "en";
  }
}

/**
 * Get system prompt for the chatbot
 */
function getSystemPrompt(locality) {
  return `You are a helpful assistant for a community grievance management system in ${locality || "India"}. 
Your role is to:
1. Help citizens file complaints about roads, water, electricity, sanitation, and municipal services
2. Guide them through the process step by step
3. Answer questions about complaint status and procedures
4. Be empathetic and supportive, especially with frustrated users
5. Keep responses concise (2-3 sentences max)
6. Use simple language accessible to all education levels
7. Suggest uploading evidence when relevant
8. Explain estimated resolution times

Available departments: Roads, Water Supply, Electricity, Sanitation, Municipal Services

Be friendly, professional, and helpful. If unsure, guide them to contact support.`;
}

/**
 * Fallback response when AI is not available
 */
function getFallbackResponse(message, context) {
  const msg = message.toLowerCase();

  const responses = {
    greeting: "Hello! I'm here to help you with your complaints. How can I assist you today?",
    complaint: "To file a complaint, please describe the issue you're facing. I'll guide you through the process.",
    status: "To check complaint status, go to 'My Complaints' on your dashboard. You'll see real-time updates.",
    department: "We handle: Roads, Water Supply, Electricity, Sanitation, and Municipal Services. Which one do you need?",
    help: "I can help you:\n• File new complaints\n• Check complaint status\n• Understand departments\n• Upload evidence\nWhat would you like to do?",
    location: "Click 'Detect My Location' when filing a complaint. Make sure to allow location access in your browser.",
    media: "Yes! You can upload photos, videos, or audio files as evidence. Clear photos help resolve issues faster.",
    time: "Average resolution time varies by priority:\n• High: 24-48 hours\n• Medium: 3-5 days\n• Low: 5-7 days",
    thanks: "You're welcome! Feel free to ask if you have more questions. 😊"
  };

  // Match patterns
  if (msg.match(/hello|hi|hey|namaste/)) return { response: responses.greeting, isAI: false };
  if (msg.match(/complain|issue|problem|file/)) return { response: responses.complaint, isAI: false };
  if (msg.match(/status|track|check|where|update/)) return { response: responses.status, isAI: false };
  if (msg.match(/department|category|type/)) return { response: responses.department, isAI: false };
  if (msg.match(/help|assist|guide/)) return { response: responses.help, isAI: false };
  if (msg.match(/location|gps|address/)) return { response: responses.location, isAI: false };
  if (msg.match(/photo|image|video|media|upload/)) return { response: responses.media, isAI: false };
  if (msg.match(/how long|time|when|resolve/)) return { response: responses.time, isAI: false };
  if (msg.match(/thank|thanks/)) return { response: responses.thanks, isAI: false };

  return { 
    response: "I'm here to help with complaint filing and tracking. Could you please rephrase your question?", 
    isAI: false 
  };
}

/**
 * Analyze user sentiment
 */
async function analyzeSentiment(text) {
  if (!openai && !gemini) {
    return { sentiment: "neutral", urgency: "normal" };
  }

  try {
    const prompt = `Analyze the sentiment and urgency of this message. Respond in JSON format: {"sentiment": "positive/neutral/negative/angry", "urgency": "low/normal/high", "reason": "brief explanation"}

Message: ${text}`;

    // Use OpenAI
    if (openai) {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 100,
      });

      const result = JSON.parse(completion.choices[0].message.content);
      return result;
    }

    // Use Gemini
    if (gemini) {
      const model = gemini.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return { sentiment: "neutral", urgency: "normal", reason: "Unable to analyze" };
    }
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return { sentiment: "neutral", urgency: "normal", reason: "Unable to analyze" };
  }
}

module.exports = {
  getChatResponse,
  getComplaintGuidance,
  findSimilarComplaints,
  translateText,
  detectLanguage,
  analyzeSentiment,
};
