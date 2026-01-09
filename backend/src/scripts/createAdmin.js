/**
 * Seed Script - Create Admin and Staff Users
 * Run: npm run seed
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Admin user
    const adminEmail = "admin@grievance.com";
    const adminPassword = "admin123";

    let existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hash = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: "System Admin",
        email: adminEmail,
        passwordHash: hash,
        role: "admin",
        phone: "9999999999"
      });
      console.log("✅ Admin created:", adminEmail);
    } else {
      console.log("⚠️ Admin already exists");
    }

    // Staff users (one per department)
    const staffData = [
      {
        name: "Roads Staff",
        email: "roads.staff@grievance.com",
        password: "staff123",
        department: "roads",
      },
      {
        name: "Water Staff",
        email: "water.staff@grievance.com",
        password: "staff123",
        department: "water",
      },
      {
        name: "Electricity Staff",
        email: "electricity.staff@grievance.com",
        password: "staff123",
        department: "electricity",
      },
      {
        name: "Sanitation Staff",
        email: "sanitation.staff@grievance.com",
        password: "staff123",
        department: "sanitation",
      },
      {
        name: "Municipal Staff",
        email: "municipal.staff@grievance.com",
        password: "staff123",
        department: "municipal",
      },
    ];

    for (const staff of staffData) {
      const exists = await User.findOne({ email: staff.email });
      if (!exists) {
        const hashedPassword = await bcrypt.hash(staff.password, 10);
        await User.create({
          name: staff.name,
          email: staff.email,
          passwordHash: hashedPassword,
          role: "staff",
          department: staff.department,
          phone: "8888888888",
        });
        console.log(`✅ Staff created: ${staff.email}`);
      } else {
        console.log(`⚠️ Staff ${staff.email} already exists`);
      }
    }

    console.log("\n🎉 Seeding complete!");
    console.log("\nLogin Credentials:");
    console.log("==================");
    console.log("Admin: admin@grievance.com / admin123");
    console.log("Roads Staff: roads.staff@grievance.com / staff123");
    console.log("Water Staff: water.staff@grievance.com / staff123");
    console.log("Electricity Staff: electricity.staff@grievance.com / staff123");
    console.log("Sanitation Staff: sanitation.staff@grievance.com / staff123");
    console.log("Municipal Staff: municipal.staff@grievance.com / staff123");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

createAdmin();
