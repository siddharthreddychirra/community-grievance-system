/**
 * Duplicate Detection Service
 * Uses AI embeddings and semantic similarity for intelligent duplicate detection
 */

const crypto = require("crypto");
const Complaint = require("../models/Complaint");
const { generateEmbedding, cosineSimilarity } = require("./aiService");

function sha256(text) {
  return crypto.createHash("sha256").update(text || "").digest("hex");
}

function normalizeText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenOverlapScore(a, b) {
  if (!a || !b) return 0;
  const sa = new Set(a.split(" "));
  const sb = new Set(b.split(" "));
  let common = 0;
  sa.forEach((t) => { if (sb.has(t)) common++; });
  const unionSize = new Set([...sa, ...sb]).size || 1;
  return common / unionSize;
}

async function findDuplicateByChecksum(checksum) {
  if (!checksum) return null;
  return await Complaint.findOne({ textNormalizedChecksum: checksum }).select("_id");
}

/**
 * Find duplicates using AI embeddings and semantic similarity
 * Also detects hotspots - areas with frequent similar complaints
 */
async function findDuplicateBySimilarity(title, description, location, threshold = 0.75) {
  try {
    const queryText = `${title}. ${description}`;
    const queryEmbedding = await generateEmbedding(queryText);

    // Get recent complaints (last 30 days) to check for duplicates
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentComplaints = await Complaint.find({
      createdAt: { $gte: thirtyDaysAgo },
      duplicateOf: null, // Only check original complaints
    })
      .select("_id title description location isHotspot hotspotCount")
      .limit(100)
      .lean();

    let bestMatch = { id: null, score: 0, complaint: null };
    let hotspotMatches = [];

    for (const complaint of recentComplaints) {
      const complaintText = `${complaint.title}. ${complaint.description}`;
      const complaintEmbedding = await generateEmbedding(complaintText);
      
      const similarity = cosineSimilarity(queryEmbedding, complaintEmbedding);

      // Check if it's in same area (within ~500m radius)
      const isNearby = location && complaint.location && 
        Math.abs(location.lat - complaint.location.lat) < 0.005 &&
        Math.abs(location.lng - complaint.location.lng) < 0.005;

      if (similarity >= threshold) {
        if (similarity > bestMatch.score) {
          bestMatch = { id: complaint._id, score: similarity, complaint };
        }

        // Track hotspot if complaints are nearby
        if (isNearby) {
          hotspotMatches.push(complaint);
        }
      }
    }

    // Mark as hotspot if 3+ similar complaints in same area
    if (hotspotMatches.length >= 2) {
      for (const complaint of hotspotMatches) {
        await Complaint.findByIdAndUpdate(complaint._id, {
          isHotspot: true,
          hotspotCount: hotspotMatches.length + 1,
        });
      }
    }

    if (bestMatch.score >= threshold) {
      return bestMatch;
    }

    return null;
  } catch (error) {
    console.error("Duplicate detection error:", error.message);
    
    // Fallback to token-based similarity
    const normalizedText = normalizeText(`${title} ${description}`);
    const docs = await Complaint.find({}, "title description").limit(50).lean();
    
    let best = { id: null, score: 0 };
    for (const d of docs) {
      const dText = normalizeText(`${d.title} ${d.description}`);
      const score = tokenOverlapScore(normalizedText, dText);
      if (score > best.score) best = { id: d._id, score };
    }
    
    if (best.score >= 0.6) return best;
    return null;
  }
}

module.exports = {
  sha256,
  normalizeText,
  findDuplicateByChecksum,
  findDuplicateBySimilarity,
  tokenOverlapScore,
};
