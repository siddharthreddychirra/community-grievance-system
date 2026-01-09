/**
 * Escalation Background Job
 * Runs every hour to check for complaints that have breached SLA
 * Automatically escalates to higher level staff
 */

const cron = require("node-cron");
const Complaint = require("../models/Complaint");
const User = require("../models/User");

/**
 * Calculate SLA deadline based on priority
 * High: 24 hours, Medium: 72 hours, Low: 168 hours (1 week)
 */
function calculateSLADeadline(priority, createdAt) {
  const hours = {
    high: 24,
    medium: 72,
    low: 168,
  };

  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + (hours[priority] || 72));
  return deadline;
}

/**
 * Escalate complaint to higher level staff
 */
async function escalateToHigherLevel(complaint) {
  try {
    // Get current assigned staff
    const currentStaff = await User.findById(complaint.assignedTo);
    
    if (!currentStaff) {
      console.log("No staff assigned to complaint:", complaint._id);
      return false;
    }

    const currentLevel = currentStaff.staffLevel || "junior";
    let nextLevel = null;

    // Determine next level
    if (currentLevel === "junior") {
      nextLevel = "mid";
    } else if (currentLevel === "mid") {
      nextLevel = "senior";
    } else {
      // Already at senior level, can't escalate further
      console.log("Complaint already at senior level:", complaint._id);
      return false;
    }

    // Find higher level staff in same department
    const higherStaff = await User.findOne({
      role: "staff",
      department: complaint.department,
      staffLevel: nextLevel,
    });

    if (!higherStaff) {
      console.log(`No ${nextLevel} staff found for department:`, complaint.department);
      return false;
    }

    // Update complaint assignment
    complaint.assignedTo = higherStaff._id;
    complaint.escalationLevel = (complaint.escalationLevel || 0) + 1;
    complaint.status = "escalated";
    complaint.escalationRisk = 100;
    
    // Add to escalation history
    if (!complaint.escalationHistory) {
      complaint.escalationHistory = [];
    }
    
    complaint.escalationHistory.push({
      level: complaint.escalationLevel,
      escalatedAt: new Date(),
      reason: `SLA breach - escalated from ${currentLevel} to ${nextLevel} staff (${higherStaff.name})`,
    });

    await complaint.save();

    console.log(
      `✅ Complaint ${complaint._id} escalated from ${currentStaff.name} (${currentLevel}) to ${higherStaff.name} (${nextLevel})`
    );
    return true;
  } catch (error) {
    console.error("Escalation error:", error);
    return false;
  }
}

/**
 * Escalation logic
 */
async function checkAndEscalateComplaints() {
  try {
    console.log(`[${new Date().toISOString()}] Running escalation job...`);

    const now = new Date();

    // Find complaints that are past SLA deadline and not resolved
    const complaints = await Complaint.find({
      status: { $nin: ["resolved", "closed"] },
      slaDeadline: { $lte: now },
      assignedTo: { $ne: null },
    }).populate("assignedTo", "name email staffLevel");

    let escalatedCount = 0;

    for (const complaint of complaints) {
      // Check if already escalated recently (within last hour)
      const lastEscalation = complaint.escalationHistory?.[complaint.escalationHistory.length - 1];
      
      if (lastEscalation) {
        const hoursSinceLastEscalation = (now - new Date(lastEscalation.escalatedAt)) / (1000 * 60 * 60);
        
        if (hoursSinceLastEscalation < 1) {
          console.log(`Skipping ${complaint._id} - escalated recently`);
          continue;
        }
      }

      const escalated = await escalateToHigherLevel(complaint);
      if (escalated) {
        escalatedCount++;
      }
    }

    if (escalatedCount > 0) {
      console.log(`✅ Escalated ${escalatedCount} complaints`);
    } else {
      console.log("✅ No complaints to escalate");
    }
  } catch (error) {
    console.error("❌ Escalation job error:", error.message);
  }
}

/**
 * Set SLA deadlines for complaints that don't have one
 */
async function setSLADeadlines() {
  try {
    const complaints = await Complaint.find({
      slaDeadline: null,
    });

    for (const complaint of complaints) {
      complaint.slaDeadline = calculateSLADeadline(
        complaint.priority,
        complaint.createdAt
      );
      await complaint.save();
    }

    if (complaints.length > 0) {
      console.log(`✅ Set SLA deadlines for ${complaints.length} complaints`);
    }
  } catch (error) {
    console.error("❌ SLA deadline setting error:", error.message);
  }
}

/**
 * Start escalation cron job
 * Runs every hour
 */
function startEscalationJob() {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    await checkAndEscalateComplaints();
  });

  // Also run on startup
  setTimeout(async () => {
    await setSLADeadlines();
    await checkAndEscalateComplaints();
  }, 5000);

  console.log("🕐 Escalation cron job started (runs every hour)");
}

module.exports = {
  startEscalationJob,
  calculateSLADeadline,
  checkAndEscalateComplaints,
};
