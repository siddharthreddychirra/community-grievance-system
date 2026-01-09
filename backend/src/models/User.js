const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["citizen", "staff", "admin"],
      default: "citizen",
    },

    department: {
      type: String,
      default: null, // only relevant for staff
      validate: {
        validator: function(value) {
          // If value is null/undefined, it's valid for admin/citizen
          if (!value) return true;
          
          // If value is provided, it must be a valid department
          const validDepts = ["roads", "water", "sanitation", "electricity", "municipal", "others"];
          return validDepts.includes(value);
        },
        message: props => `${props.value} is not a valid department`
      }
    },

    // Locality assignment
    locality: {
      type: String,
      required: true,
      enum: ["jangaon", "warangal", "narapally", "pocharam", "karimnagar", "all"],
      lowercase: true,
    },

    // Staff hierarchy level
    staffLevel: {
      type: String,
      enum: ["junior", "mid", "senior"],
      default: "junior", // only relevant for staff
    },

    // Max priority that this staff can handle
    maxPriority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },

    phone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Password comparison method
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("User", UserSchema);

