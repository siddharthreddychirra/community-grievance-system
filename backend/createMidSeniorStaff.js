const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./src/models/User");

const staffMembers = [
  // Mid-level staff for each department
  {
    name: "Rajesh Kumar (Mid)",
    email: "rajesh.mid@staff.com",
    password: "staff123",
    department: "roads",
    staffLevel: "mid",
    maxPriority: "medium",
  },
  {
    name: "Priya Sharma (Mid)",
    email: "priya.mid@staff.com",
    password: "staff123",
    department: "water",
    staffLevel: "mid",
    maxPriority: "medium",
  },
  {
    name: "Amit Patel (Mid)",
    email: "amit.mid@staff.com",
    password: "staff123",
    department: "sanitation",
    staffLevel: "mid",
    maxPriority: "medium",
  },
  {
    name: "Sneha Reddy (Mid)",
    email: "sneha.mid@staff.com",
    password: "staff123",
    department: "electricity",
    staffLevel: "mid",
    maxPriority: "medium",
  },
  {
    name: "Vikram Singh (Mid)",
    email: "vikram.mid@staff.com",
    password: "staff123",
    department: "municipal",
    staffLevel: "mid",
    maxPriority: "medium",
  },
  {
    name: "Anjali Gupta (Mid)",
    email: "anjali.mid@staff.com",
    password: "staff123",
    department: "others",
    staffLevel: "mid",
    maxPriority: "medium",
  },
  
  // Senior-level staff for each department
  {
    name: "Dr. Suresh Verma (Senior)",
    email: "suresh.senior@staff.com",
    password: "staff123",
    department: "roads",
    staffLevel: "senior",
    maxPriority: "high",
  },
  {
    name: "Mrs. Kavita Nair (Senior)",
    email: "kavita.senior@staff.com",
    password: "staff123",
    department: "water",
    staffLevel: "senior",
    maxPriority: "high",
  },
  {
    name: "Mr. Arun Joshi (Senior)",
    email: "arun.senior@staff.com",
    password: "staff123",
    department: "sanitation",
    staffLevel: "senior",
    maxPriority: "high",
  },
  {
    name: "Eng. Deepak Rao (Senior)",
    email: "deepak.senior@staff.com",
    password: "staff123",
    department: "electricity",
    staffLevel: "senior",
    maxPriority: "high",
  },
  {
    name: "Commissioner Meena Shah (Senior)",
    email: "meena.senior@staff.com",
    password: "staff123",
    department: "municipal",
    staffLevel: "senior",
    maxPriority: "high",
  },
  {
    name: "Chief Officer Ramesh Kumar (Senior)",
    email: "ramesh.senior@staff.com",
    password: "staff123",
    department: "others",
    staffLevel: "senior",
    maxPriority: "high",
  },
];

async function createStaff() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    for (const staffData of staffMembers) {
      // Check if staff already exists
      const existing = await User.findOne({ email: staffData.email });
      if (existing) {
        console.log(`⏭️  Staff already exists: ${staffData.email}`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(staffData.password, salt);

      // Create staff member
      const staff = new User({
        name: staffData.name,
        email: staffData.email,
        passwordHash,
        role: "staff",
        department: staffData.department,
        staffLevel: staffData.staffLevel,
        maxPriority: staffData.maxPriority,
      });

      await staff.save();
      console.log(`✅ Created ${staffData.staffLevel} staff: ${staffData.name} (${staffData.department})`);
    }

    console.log("\n🎉 All mid and senior level staff created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating staff:", error);
    process.exit(1);
  }
}

createStaff();
