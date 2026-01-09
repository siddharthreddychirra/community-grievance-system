require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const { startEscalationJob } = require("./jobs/escalationJob");

const authRoutes = require("./routes/auth");
const complaintRoutes = require("./routes/complaints");
const adminRoutes = require("./routes/admin");
const staffRoutes = require("./routes/staff");
const analyticsRoutes = require("./routes/analytics");
const chatbotRoutes = require("./routes/chatbot");
const departmentRoutes = require("./routes/departments");

const app = express();

app.use(cors({ 
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  credentials: true 
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

connectDB();

// Start background jobs
startEscalationJob();

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/departments", departmentRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.send("Backend OK");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
