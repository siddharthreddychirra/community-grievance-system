/**
 * AI Service - Department Classification, Priority Prediction, Escalation Risk
 * Supports OpenAI and HuggingFace APIs
 */

const { AI_PROVIDER, AI_CONFIG } = require("../config/ai");
const departments = require("../constants/departments");

/**
 * Classify complaint into department using AI
 */
async function classifyDepartment(title, description) {
  try {
    const text = `${title}. ${description}`.toLowerCase();

    // Fallback keyword-based classification if AI fails
    const keywordMap = {
      electricity: ["power", "electricity", "light", "wire", "transformer", "outage", "blackout", "voltage", "pole"],
      roads: ["road", "pothole", "street", "highway", "pavement", "traffic", "signal", "footpath", "sidewalk", "divider"],
      water: ["water", "supply", "tap", "leak", "pipeline", "drainage", "sewage", "pump", "tank", "overflow"],
      sanitation: ["garbage", "waste", "trash", "cleanliness", "sweeping", "dustbin", "litter", "dump", "smell"],
      municipal: ["tax", "property", "license", "permit", "certificate", "document", "stray", "dog", "dogs", "animal", "animals", "cattle", "menace", "park", "garden", "playground", "public space"],
    };

    if (AI_PROVIDER === "openai" && AI_CONFIG.openai.apiKey) {
      return await classifyWithOpenAI(title, description);
    } else if (AI_PROVIDER === "huggingface" && AI_CONFIG.huggingface.apiKey) {
      return await classifyWithHuggingFace(title, description);
    } else {
      // Keyword-based fallback
      for (const [dept, keywords] of Object.entries(keywordMap)) {
        if (keywords.some(kw => text.includes(kw))) {
          return dept;
        }
      }
      return "others";
    }
  } catch (error) {
    console.error("AI Classification Error:", error.message);
    return "others"; // fallback
  }
}

/**
 * OpenAI-based classification
 */
async function classifyWithOpenAI(title, description) {
  const prompt = `Classify the following complaint into one of these departments: ${departments.join(", ")}.

Complaint Title: ${title}
Description: ${description}

Return ONLY the department name, nothing else.`;

  const response = await fetch(`${AI_CONFIG.openai.baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${AI_CONFIG.openai.apiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.openai.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 20,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const result = data.choices[0]?.message?.content?.trim().toLowerCase();

  // Validate result is a valid department
  return departments.includes(result) ? result : "others";
}

/**
 * HuggingFace-based classification (zero-shot)
 */
async function classifyWithHuggingFace(title, description) {
  const text = `${title}. ${description}`;

  const response = await fetch(
    `${AI_CONFIG.huggingface.baseURL}/${AI_CONFIG.huggingface.classificationModel}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AI_CONFIG.huggingface.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          candidate_labels: departments,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Return the highest scoring label
  if (data.labels && data.labels.length > 0) {
    return data.labels[0];
  }

  return "others";
}

/**
 * Predict priority based on complaint text
 * Returns: "low", "medium", "high"
 */
async function predictPriority(title, description) {
  try {
    const text = `${title}. ${description}`.toLowerCase();

    // Keyword-based priority detection
    const urgentKeywords = [
      "urgent", "emergency", "immediate", "danger", "critical", "severe",
      "life-threatening", "accident", "fire", "flood", "broken", "burst"
    ];

    const mediumKeywords = [
      "problem", "issue", "concern", "delay", "disruption", "inconvenience"
    ];

    const urgentCount = urgentKeywords.filter(kw => text.includes(kw)).length;
    
    if (urgentCount >= 2) return "high";
    if (urgentCount >= 1) return "medium";
    if (mediumKeywords.some(kw => text.includes(kw))) return "medium";

    return "low";
  } catch (error) {
    console.error("Priority Prediction Error:", error.message);
    return "medium"; // default
  }
}

/**
 * Predict escalation risk
 * Returns: 0-100 (likelihood of SLA breach)
 */
async function predictEscalationRisk(complaint) {
  try {
    let riskScore = 0;

    // Factor 1: Priority
    const priority = await predictPriority(complaint.title, complaint.description);
    if (priority === "high") riskScore += 40;
    else if (priority === "medium") riskScore += 20;

    // Factor 2: Department workload (if multiple complaints)
    // This would require a database query, simplified here
    riskScore += 20;

    // Factor 3: Time since submission
    const hoursSinceSubmission = (Date.now() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceSubmission > 48) riskScore += 30;
    else if (hoursSinceSubmission > 24) riskScore += 15;

    // Factor 4: Status
    if (complaint.status === "submitted") riskScore += 10;

    return Math.min(riskScore, 100);
  } catch (error) {
    console.error("Escalation Risk Prediction Error:", error.message);
    return 50; // default medium risk
  }
}

/**
 * Generate text embeddings for semantic similarity
 */
async function generateEmbedding(text) {
  try {
    if (AI_PROVIDER === "openai" && AI_CONFIG.openai.apiKey) {
      const response = await fetch(`${AI_CONFIG.openai.baseURL}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${AI_CONFIG.openai.apiKey}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.openai.embeddingModel,
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI Embedding API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } else if (AI_PROVIDER === "huggingface" && AI_CONFIG.huggingface.apiKey) {
      const response = await fetch(
        `${AI_CONFIG.huggingface.baseURL}/${AI_CONFIG.huggingface.embeddingModel}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${AI_CONFIG.huggingface.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: text,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HuggingFace Embedding API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } else {
      // Simple hash-based embedding fallback (not semantic)
      return simpleEmbedding(text);
    }
  } catch (error) {
    console.error("Embedding Generation Error:", error.message);
    return simpleEmbedding(text);
  }
}

/**
 * Fallback: Simple word-based embedding
 */
function simpleEmbedding(text) {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0); // Fixed dimension
  
  words.forEach((word, idx) => {
    const hash = word.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    embedding[hash % 384] += 1;
  });

  return embedding;
}

/**
 * Calculate cosine similarity between two embeddings
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

module.exports = {
  classifyDepartment,
  predictPriority,
  predictEscalationRisk,
  generateEmbedding,
  cosineSimilarity,
};
