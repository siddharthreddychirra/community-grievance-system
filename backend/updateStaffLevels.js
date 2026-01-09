require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

async function updateStaffLevels() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Update existing staff with default levels
    const result = await User.updateMany(
      { role: "staff", staffLevel: { $exists: false } },
      { $set: { staffLevel: "junior", maxPriority: "low" } }
    );

    console.log(`✅ Updated ${result.modifiedCount} staff members with default levels`);

    // Show all staff
    const allStaff = await User.find({ role: "staff" }).select("name email department staffLevel");
    console.log("\n📋 All Staff Members:");
    allStaff.forEach(s => {
      console.log(`  ${s.name} (${s.email}) - ${s.department} - Level: ${s.staffLevel || 'junior'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

updateStaffLevels();
