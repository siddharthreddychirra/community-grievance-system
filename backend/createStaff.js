require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./src/models/User");

const STAFF_ACCOUNTS = [
  {
    name: "Rajesh Kumar - Roads Manager",
    email: "rajesh.roads@grievance.com",
    password: "Roads@2026",
    department: "roads",
    role: "staff"
  },
  {
    name: "Priya Sharma - Water Supply Head",
    email: "priya.water@grievance.com",
    password: "Water@2026",
    department: "water",
    role: "staff"
  },
  {
    name: "Amit Reddy - Sanitation Officer",
    email: "amit.sanitation@grievance.com",
    password: "Sanitation@2026",
    department: "sanitation",
    role: "staff"
  },
  {
    name: "Lakshmi Devi - Electricity Department",
    email: "lakshmi.electricity@grievance.com",
    password: "Electricity@2026",
    department: "electricity",
    role: "staff"
  },
  {
    name: "Suresh Babu - Municipal Services",
    email: "suresh.municipal@grievance.com",
    password: "Municipal@2026",
    department: "municipal",
    role: "staff"
  }
];

async function createStaffAccounts() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/grievance_db");
    console.log("✅ Connected to MongoDB");

    // Check if staff already exist
    for (const staffData of STAFF_ACCOUNTS) {
      const exists = await User.findOne({ email: staffData.email });
      
      if (exists) {
        console.log(`⚠️  Staff already exists: ${staffData.email}`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(staffData.password, 10);

      // Create staff
      await User.create({
        name: staffData.name,
        email: staffData.email,
        passwordHash: hashedPassword,
        role: staffData.role,
        department: staffData.department
      });

      console.log(`✅ Created: ${staffData.name} (${staffData.email})`);
    }

    console.log("\n🎉 All staff accounts created successfully!");
    console.log("\n📋 STAFF CREDENTIALS:");
    console.log("=" .repeat(80));
    STAFF_ACCOUNTS.forEach((staff) => {
      console.log(`\n${staff.name}`);
      console.log(`Department: ${staff.department.toUpperCase()}`);
      console.log(`Email: ${staff.email}`);
      console.log(`Password: ${staff.password}`);
    });
    console.log("\n" + "=".repeat(80));

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

createStaffAccounts();
