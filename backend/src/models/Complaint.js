const mongoose = require("mongoose");
const departments = require("../constants/departments");

const ComplaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    media: [
      {
        type: {
          type: String,
          enum: ["image", "video", "audio"],
          required: true,
        },
        url: { type: String, required: true },
        originalName: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    audioTranscript: { type: String },

    // ✅ Location info
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      area: { type: String, default: "" },
    },

    // Locality assignment
    locality: {
      type: String,
      required: true,
      enum: ["jangaon", "warangal", "narapally", "pocharam", "karimnagar"],
      lowercase: true,
    },

    department: {
      type: String,
      enum: departments, // ["roads","water","sanitation","electricity","others"]
      default: "others",
    },

    departmentSource: {
      type: String,
      enum: ["manual", "auto"],
      default: "manual",
    },

    status: {
      type: String,
      enum: [
        "submitted",
        "triaged",
        "assigned",
        "in-progress",
        "resolved",
        "closed",
        "escalated",
      ],
      default: "submitted",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    escalationLevel: {
      type: Number,
      default: 0,
    },

    escalationRisk: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Citizen Rating & Feedback
    citizenRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    citizenFeedback: {
      type: String,
      default: null,
    },

    ratedAt: {
      type: Date,
      default: null,
    },

    slaDeadline: {
      type: Date,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    staffRemark: {
      type: String,
      default: "",
    },

    // Resolution media uploaded by staff
    resolutionMedia: [
      {
        type: {
          type: String,
          enum: ["image", "video", "audio", "other"],
          required: true,
        },
        url: { type: String, required: true },
        originalName: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Track if this location is a hotspot
    isHotspot: {
      type: Boolean,
      default: false,
    },

    hotspotCount: {
      type: Number,
      default: 0,
    },

    assignedAt: {
      type: Date,
      default: null,
    },

    inProgressAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    prioritySetBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    escalationHistory: [
      {
        level: Number,
        escalatedAt: Date,
        reason: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
