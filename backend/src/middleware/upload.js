const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const uploadDirs = [
  "uploads/images",
  "uploads/videos",
  "uploads/audio",
  "uploads/others"
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/others";

    if (file.mimetype.startsWith("image")) folder = "uploads/images";
    else if (file.mimetype.startsWith("video")) folder = "uploads/videos";
    else if (file.mimetype.startsWith("audio")) folder = "uploads/audio";

    cb(null, folder);
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept images, videos, and audio
    if (file.mimetype.startsWith("image/") || 
        file.mimetype.startsWith("video/") || 
        file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image, video, and audio files are allowed!"), false);
    }
  }
});

module.exports = upload;
