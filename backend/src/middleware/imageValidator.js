/**
 * Image Validation Middleware
 * Uses AI to validate uploaded images are relevant to grievances
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Validate if an image is relevant to a grievance complaint
 * @param {string} filePath - Path to the uploaded image
 * @returns {Promise<{isValid: boolean, reason: string}>}
 */
async function validateImage(filePath) {
  try {
    // Read image as base64
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");
    
    // Get file extension
    const ext = path.extname(filePath).toLowerCase();
    let mimeType = "image/jpeg";
    if (ext === ".png") mimeType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
    else if (ext === ".webp") mimeType = "image/webp";

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an EXTREMELY STRICT image validator for a civic grievance system. 

Your job is to determine if this image shows a REAL PHOTOGRAPHED public infrastructure issue.

✅ VALID images MUST show ACTUAL PHOTOGRAPHS of:
- Damaged roads (potholes, cracks, broken pavement)
- Broken streetlights or public lighting issues
- Water leaks, drainage problems, flooding
- Overflowing garbage bins in PUBLIC MUNICIPAL AREAS ONLY
- Damaged public property (parks, benches, sidewalks)
- Traffic signal malfunctions
- Building structure problems in public buildings
- Public facility maintenance issues

❌ STRICTLY INVALID - REJECT immediately if image shows:
- **SIGNATURES** (handwritten or digital signatures, any signature mark)
- **HANDWRITTEN TEXT** (notes, forms, letters, written documents)
- **DOCUMENTS** (printed papers, forms, certificates, IDs, official papers)
- **SCREENSHOTS** (from phones, computers, apps, social media)
- **SCANNED IMAGES** (scanned documents, photocopies, scanned forms)
- **TEXT-HEAVY IMAGES** (notices, posters, text documents)
- **DRAWINGS or DIAGRAMS** (sketches, plans, illustrations, blueprints)
- **MEMES, CARTOONS, or GRAPHICS** (any edited or graphic images)
- **SELFIES or personal photos of people** (any human faces or portraits)
- **ANIMALS** (dogs, cats, cattle, birds, ANY animals) - YES, even stray animals
- **PERSONAL ITEMS** (phones, wallets, bags, clothes, shoes)
- **HOUSEHOLD TRASH** (kitchen garbage, personal waste, home garbage)
- **INDOOR SCENES** (unless clearly showing PUBLIC building issues)
- **FOOD or restaurant scenes**
- **UNRELATED LANDSCAPES** (nature photos, scenic views without issues)
- **BLANK or MOSTLY WHITE IMAGES** (blank papers, empty forms, white pages)
- **VERY HIGH CONTRAST BLACK & WHITE** (likely scanned/signature images)
- **PEN MARKS or HANDWRITING** (any handwritten content)

🚨 CRITICAL REJECTION RULES:
1. If you see ANY handwriting → INVALID
2. If you see ANY signature or signature-like marks → INVALID  
3. If image looks like a scanned document or form → INVALID
4. If image is primarily TEXT on paper → INVALID
5. If you see ANIMALS anywhere in the image → INVALID
6. If it looks like a DOCUMENT, FORM, or PAPER → INVALID
7. If you're unsure whether it's a real outdoor photo → INVALID
8. If image has PEN STROKES, SIGNATURES, or WRITING → INVALID

The image MUST be a CLEAR OUTDOOR PHOTOGRAPH showing a VISIBLE PUBLIC INFRASTRUCTURE PROBLEM.

Return ONLY a JSON object in this exact format:
{
  "isValid": true/false,
  "reason": "brief explanation"
}`;


    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    const responseText = result.response.text().trim();
    
    // Try to parse JSON from the response
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const validation = JSON.parse(jsonMatch[0]);
      return {
        isValid: validation.isValid === true,
        reason: validation.reason || "No reason provided"
      };
    }

    // Fallback: if we can't parse JSON, check for keywords
    const lowerResponse = responseText.toLowerCase();
    if (lowerResponse.includes("valid") && !lowerResponse.includes("invalid")) {
      return { isValid: true, reason: "Image appears relevant to civic complaints" };
    }

    return { isValid: false, reason: "Image validation failed or unclear" };

  } catch (error) {
    console.error("Image validation error:", error);
    // In case of error, allow the image to pass (fail-open approach)
    return { isValid: true, reason: "Validation service unavailable" };
  }
}

/**
 * Middleware to validate uploaded images
 */
const validateUploadedImages = async (req, res, next) => {
  try {
    // If no files uploaded, proceed
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const invalidFiles = [];

    // Validate each image file
    for (const file of req.files) {
      // Only validate image files
      if (file.mimetype.startsWith("image/")) {
        const validation = await validateImage(file.path);
        
        if (!validation.isValid) {
          invalidFiles.push({
            filename: file.originalname,
            reason: validation.reason
          });
          
          // Delete the invalid file
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error("Error deleting invalid file:", err);
          }
        }
      }
    }

    // If any files were invalid, return error
    if (invalidFiles.length > 0) {
      // Delete all uploaded files
      req.files.forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          console.error("Error cleaning up files:", err);
        }
      });

      return res.status(400).json({
        error: "Invalid images detected",
        details: invalidFiles,
        message: "❌ Image Rejected: Please upload a CLEAR OUTDOOR PHOTOGRAPH showing a PUBLIC INFRASTRUCTURE ISSUE (damaged roads, broken streetlights, water leaks, overflowing municipal bins, etc.). We DO NOT accept: signatures, documents, handwritten text, screenshots, scanned images, forms, drawings, animals, personal items, selfies, memes, household trash, blank papers, or text documents."
      });
    }

    // All images valid, proceed
    next();

  } catch (error) {
    console.error("Image validation middleware error:", error);
    // In case of error, allow to proceed (fail-open)
    next();
  }
};

module.exports = {
  validateImage,
  validateUploadedImages
};
