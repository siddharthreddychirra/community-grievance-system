const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./src/models/User");

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Create Super Admin (System Admin) - has access to ALL localities
    const superAdminEmail = "superadmin@system.gov";
    const existingSuperAdmin = await User.findOne({ email: superAdminEmail });
    
    if (!existingSuperAdmin) {
      const passwordHash = await bcrypt.hash("superadmin123", 10);
      await User.create({
        name: "System Super Admin",
        email: superAdminEmail,
        passwordHash,
        role: "admin",
        locality: "all", // Special locality value for super admin
        phone: "0000000000",
      });
      console.log(`✅ Created Super Admin: ${superAdminEmail}`);
    } else {
      console.log(`⏭️  Super Admin already exists: ${superAdminEmail}`);
    }

    // Create "others" department staff for all localities
    const localities = ["jangaon", "warangal", "narapally", "pocharam", "karimnagar"];
    
    console.log("\n📦 Creating 'others' department staff for all localities...");
    
    for (const locality of localities) {
      console.log(`\n📍 ${locality.toUpperCase()}:`);
      
      const staffLevels = [
        { level: "junior", name: `${locality} Others Junior` },
        { level: "mid", name: `${locality} Others Mid` },
        { level: "senior", name: `${locality} Others Senior` }
      ];

      for (const { level, name } of staffLevels) {
        const email = `others.${level}@${locality}.staff`;
        const existing = await User.findOne({ email });

        if (!existing) {
          const passwordHash = await bcrypt.hash("staff123", 10);
          const maxPriority = level === "senior" ? "high" : level === "mid" ? "medium" : "low";

          await User.create({
            name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            email,
            passwordHash,
            role: "staff",
            department: "others",
            locality: locality.toLowerCase(),
            staffLevel: level,
            maxPriority,
            phone: "9999999999",
          });
          console.log(`  ✅ Created ${level} staff: ${email}`);
        } else {
          console.log(`  ⏭️  Staff exists: ${email}`);
        }
      }
    }

    console.log("\n🎉 Super Admin and 'others' department staff created successfully!");
    console.log("\n" + "=".repeat(70));
    console.log("📝 NEW LOGIN CREDENTIALS:");
    console.log("=".repeat(70));
    console.log("\n🔐 SUPER ADMIN (Access to ALL localities):");
    console.log("   Email: superadmin@system.gov");
    console.log("   Password: superadmin123");
    console.log("\n📦 'Others' Department Staff:");
    console.log("   Format: others.{level}@{locality}.staff / staff123");
    console.log("   Levels: junior, mid, senior");
    console.log("   Localities: jangaon, warangal, narapally, pocharam, karimnagar");
    console.log("\n   Examples:");
    console.log("   - others.junior@jangaon.staff / staff123");
    console.log("   - others.mid@warangal.staff / staff123");
    console.log("   - others.senior@narapally.staff / staff123");
    console.log("=".repeat(70));
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createSuperAdmin();
