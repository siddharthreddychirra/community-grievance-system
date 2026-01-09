const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./src/models/User");

const localities = ["jangaon", "warangal", "narapally", "pocharam", "karimnagar"];
const departments = ["roads", "water", "sanitation", "electricity", "municipal", "others"];

async function createLocalityAccounts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    for (const locality of localities) {
      console.log(`\n📍 Creating accounts for ${locality.toUpperCase()}...`);

      // Create Admin for this locality
      const adminEmail = `admin@${locality}.gov`;
      const existingAdmin = await User.findOne({ email: adminEmail });
      
      if (!existingAdmin) {
        const adminPasswordHash = await bcrypt.hash("admin123", 10);
        await User.create({
          name: `${locality.charAt(0).toUpperCase() + locality.slice(1)} Admin`,
          email: adminEmail,
          passwordHash: adminPasswordHash,
          role: "admin",
          locality: locality.toLowerCase(),
        });
        console.log(`  ✅ Created admin: ${adminEmail}`);
      } else {
        console.log(`  ⏭️  Admin exists: ${adminEmail}`);
      }

      // Create staff for each department in this locality
      for (const dept of departments) {
        const staffLevels = [
          { level: "junior", name: `${locality} ${dept} Junior` },
          { level: "mid", name: `${locality} ${dept} Mid` },
          { level: "senior", name: `${locality} ${dept} Senior` }
        ];

        for (const { level, name } of staffLevels) {
          const email = `${dept}.${level}@${locality}.staff`;
          const existing = await User.findOne({ email });

          if (!existing) {
            const passwordHash = await bcrypt.hash("staff123", 10);
            const maxPriority = level === "senior" ? "high" : level === "mid" ? "medium" : "low";

            await User.create({
              name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              email,
              passwordHash,
              role: "staff",
              department: dept,
              locality: locality.toLowerCase(),
              staffLevel: level,
              maxPriority,
            });
            console.log(`    ✅ Created ${level} staff: ${email}`);
          } else {
            console.log(`    ⏭️  Staff exists: ${email}`);
          }
        }
      }
    }

    console.log("\n🎉 All locality-based accounts created successfully!");
    console.log("\n📝 Login Credentials:");
    console.log("   Admins: admin@{locality}.gov / admin123");
    console.log("   Staff: {dept}.{level}@{locality}.staff / staff123");
    console.log("\n   Localities: jangaon, warangal, narapally, pocharam, karimnagar");
    console.log("   Departments: roads, water, sanitation, electricity, municipal, others");
    console.log("   Levels: junior, mid, senior");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createLocalityAccounts();
