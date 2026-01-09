const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    // Keywords used for auto-categorization
    keywords: {
      type: [String],
      default: [],
    },

    priority: {
      type: Number,
      default: 1, // lower number = higher priority
    },

    contactInfo: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", DepartmentSchema);
