# AI-Powered Community Grievance Redressal System

## 🎓 Final Year Major Project

A production-grade civic grievance management platform with AI-powered features including automatic department classification, duplicate detection, priority prediction, and escalation management.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for analytics visualizations
- **Google Maps JavaScript API** for geolocation
- **Fetch API** for HTTP requests

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **node-cron** for background jobs
- **CORS** enabled

### AI Features (Mandatory)
- **OpenAI / HuggingFace** compatible AI services
- **NLP-based** department classification
- **Semantic similarity** for duplicate detection
- **Priority prediction** using text analysis
- **Escalation risk** prediction
- **Text embeddings** for intelligent matching

---

## 📁 Project Structure

```
community_grievance/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── ai.js              # AI configuration
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT authentication
│   │   │   ├── requireRole.js     # Role-based access
│   │   │   └── upload.js          # Multer file upload
│   │   ├── models/
│   │   │   ├── User.js            # User schema
│   │   │   ├── Complaint.js       # Complaint schema
│   │   │   ├── Comment.js         # Comment schema
│   │   │   └── Department.js      # Department schema
│   │   ├── routes/
│   │   │   ├── auth.js            # Auth endpoints
│   │   │   ├── complaints.js      # Complaint CRUD
│   │   │   ├── admin.js           # Admin operations
│   │   │   └── staff.js           # Staff operations
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── complaintController.js
│   │   │   └── adminController.js
│   │   ├── services/
│   │   │   ├── aiService.js       # AI classification & prediction
│   │   │   ├── duplicateService.js # Duplicate detection
│   │   │   ├── storageService.js  # File storage
│   │   │   └── autoAssign.js      # Auto-assignment logic
│   │   ├── jobs/
│   │   │   └── escalationJob.js   # Cron job for SLA escalation
│   │   ├── constants/
│   │   │   └── departments.js     # Department list
│   │   ├── scripts/
│   │   │   └── createAdmin.js     # Seed admin & staff
│   │   └── index.js               # Server entry point
│   ├── uploads/                   # File storage directory
│   ├── .env                       # Environment variables
│   └── package.json
│
└── grievance-citizen/
    ├── src/
    │   ├── pages/
    │   │   ├── Landing.jsx        # Landing page
    │   │   ├── Login.jsx          # Login page
    │   │   ├── Register.jsx       # Registration page
    │   │   ├── Dashboard.jsx      # Citizen dashboard
    │   │   ├── RaiseComplaint.jsx # Submit complaint form
    │   │   ├── AdminDashboard.jsx # Admin dashboard
    │   │   └── StaffDashboard.jsx # Staff dashboard
    │   ├── components/
    │   │   ├── MapView.jsx        # Google Maps component
    │   │   ├── ComplaintCard.jsx  # Complaint display
    │   │   └── ProtectedRoute.jsx # Route protection
    │   ├── api.js                 # API client
    │   ├── maps.js                # Google Maps utilities
    │   ├── App.jsx                # Main app component
    │   └── main.jsx               # Entry point
    ├── index.html
    ├── .env                       # Environment variables
    └── package.json
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** v18+ 
- **MongoDB** v5+ (running locally or MongoDB Atlas)
- **Git**
- **Google Maps API Key** (required)
- **OpenAI API Key** (optional, for AI features)

### Step 1: Clone Repository
```bash
cd Desktop
git clone <your-repo-url> Major_Project
cd Major_Project
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `backend/.env`:**
```env
MONGO_URI=mongodb://localhost:27017/grievance_db
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
FRONTEND_URL=http://localhost:5173
```

**Create uploads directory:**
```bash
mkdir uploads
```

**Seed admin and staff users:**
```bash
npm run seed
```

This creates:
- **Admin:** admin@grievance.com / admin123
- **Roads Staff:** roads.staff@grievance.com / staff123
- **Water Staff:** water.staff@grievance.com / staff123
- **Electricity Staff:** electricity.staff@grievance.com / staff123
- **Sanitation Staff:** sanitation.staff@grievance.com / staff123
- **Municipal Staff:** municipal.staff@grievance.com / staff123

**Start backend server:**
```bash
npm run dev
```

Server runs on: `http://localhost:5000`

### Step 3: Frontend Setup

```bash
cd ../grievance-citizen

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `grievance-citizen/.env`:**
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

**Start frontend:**
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 👥 User Roles & Features

### 1. **Citizen** (Public Registration)
✅ Register and login  
✅ Submit complaints with:
- Title & description
- Photo/video/audio attachments
- **Automatic geolocation** (latitude/longitude)
- Manual area input (fallback)
- AI auto-detects department

✅ View complaint status in real-time  
✅ Track complaints on dashboard  
✅ View complaint history

### 2. **Staff** (Pre-seeded)
✅ Login with assigned credentials  
✅ View **only assigned complaints**  
✅ See complaint location on **Google Maps**  
✅ View all attachments (images, videos, audio)  
✅ Mark complaints as **resolved** with remarks  
✅ View escalated complaints with SLA warnings  
✅ Priority-based task list

### 3. **Admin** (Pre-seeded)
✅ **Analytics Dashboard:**
- Total, pending, resolved, escalated counts
- Department-wise breakdown (bar charts)
- Status-wise distribution (pie charts)
- Priority statistics

✅ **Google Maps View:**
- 🔴 Red markers = Active/Pending complaints
- 🟢 Green markers = Resolved complaints
- Click markers for details

✅ **Complaint Management:**
- View all complaints system-wide
- Filter by department
- Assign complaints to staff
- View complaint details & media
- Track escalated complaints

✅ **SLA Monitoring:**
- Auto-escalation visibility
- Deadline tracking
- High-risk complaint alerts

---

## 🤖 AI Features (Implementation Details)

### 1. **Department Classification**
**File:** `backend/src/services/aiService.js`

Uses NLP to classify complaints into:
- Roads
- Water
- Sanitation  
- Electricity
- Municipal
- Others

**Workflow:**
1. User submits complaint
2. AI analyzes title + description
3. Classifies into most relevant department
4. Falls back to keyword matching if AI unavailable

**APIs Supported:**
- OpenAI GPT-3.5-turbo
- HuggingFace BART (zero-shot classification)
- Keyword-based fallback

### 2. **Duplicate Detection**
**File:** `backend/src/services/duplicateService.js`

Uses semantic similarity to detect duplicate complaints.

**Algorithm:**
1. Generate text embeddings for new complaint
2. Compare with recent complaints (last 30 days)
3. Calculate cosine similarity scores
4. Mark as duplicate if similarity > 75%

**Benefits:**
- Reduces redundant work
- Links related complaints
- Improves resolution efficiency

### 3. **Priority Prediction**
**Returns:** `low`, `medium`, `high`

**Factors:**
- Urgent keywords (emergency, danger, critical)
- Problem severity indicators
- Text sentiment analysis

### 4. **Escalation Risk Prediction**
**Returns:** 0-100 score

**Factors:**
- Priority level (high = +40 points)
- Time since submission (>48h = +30 points)
- Department workload (+20 points)
- Current status (+10 points if submitted)

### 5. **Automatic Escalation**
**File:** `backend/src/jobs/escalationJob.js`

**Cron Schedule:** Every hour

**SLA Deadlines:**
- High priority: 24 hours
- Medium priority: 72 hours (3 days)
- Low priority: 168 hours (1 week)

**Workflow:**
1. Check complaints past SLA deadline
2. Increase escalation level (max 3)
3. Mark status as "escalated"
4. Alert admin dashboard

---

## 🗺️ Google Maps Integration

### Setup
1. Get API key: [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Maps JavaScript API**
3. Add key to `grievance-citizen/.env`

### Features Implemented

**Citizen:**
- Auto-detect current location (geolocation API)
- Manual area input as fallback
- Location stored as {lat, lng, area}

**Staff:**
- View assigned complaints on map
- Red markers for active complaints
- Green markers for resolved
- Click marker to see details

**Admin:**
- View ALL complaints on map
- Color-coded markers by status
- Real-time complaint overview
- Geographical clustering insights

**Implementation:**
- `grievance-citizen/src/maps.js` - Map utilities
- `grievance-citizen/src/components/MapView.jsx` - Reusable map component
- Uses Google Maps JavaScript API v3

---

## 📊 Analytics Dashboard (Admin)

### Real-time Statistics
- Total complaints
- Pending complaints
- Resolved complaints
- Escalated complaints

### Visual Charts
1. **Department-wise Bar Chart**
   - Total complaints per department
   - Resolved vs pending breakdown

2. **Status Distribution Pie Chart**
   - Submitted, assigned, in-progress, resolved, escalated

3. **Priority Breakdown**
   - High, medium, low priority counts

4. **Escalated Complaints Table**
   - Shows complaints breaching SLA
   - Escalation level tracking
   - Assignee information

---

## 🔐 Authentication & Security

### JWT Authentication
- Token expires in 24 hours
- Stored in localStorage (frontend)
- Sent in Authorization header

### Role-Based Access Control (RBAC)
- Middleware: `requireRole(role)`
- Routes protected by role
- Unauthorized access blocked (403)

### Password Security
- **bcryptjs** hashing (10 rounds)
- Passwords never stored in plain text
- Secure comparison method

### API Security
- CORS enabled for frontend origin
- Environment variables for secrets
- Input validation on all endpoints

---

## 🔄 Complaint Lifecycle

```
1. Submitted
   ↓ (AI classifies department, detects duplicates)
2. Triaged
   ↓ (Admin assigns to staff)
3. Assigned
   ↓ (Staff accepts)
4. In-Progress
   ↓ (Staff resolves with remarks)
5. Resolved
   ↓ (Optional: Admin closes)
6. Closed

PARALLEL: If SLA breached → Escalated
```

---

## 📦 Dependencies

### Backend
```json
{
  "bcryptjs": "Password hashing",
  "cors": "Cross-origin requests",
  "dotenv": "Environment variables",
  "express": "Web framework",
  "jsonwebtoken": "JWT authentication",
  "mongoose": "MongoDB ODM",
  "multer": "File uploads",
  "node-cron": "Background jobs",
  "nodemailer": "Email notifications"
}
```

### Frontend
```json
{
  "react": "UI library",
  "react-dom": "DOM rendering",
  "react-router-dom": "Client-side routing",
  "recharts": "Analytics charts",
  "tailwindcss": "Utility-first CSS",
  "vite": "Build tool"
}
```

---

## 🧪 Testing

### Manual Testing Checklist

**Citizen Flow:**
1. ✅ Register new citizen account
2. ✅ Login successfully
3. ✅ Raise complaint with location detection
4. ✅ Upload image/video/audio attachments
5. ✅ View complaint status on dashboard

**Staff Flow:**
1. ✅ Login with staff credentials
2. ✅ View assigned complaints
3. ✅ See complaint location on map
4. ✅ View attachments
5. ✅ Mark as resolved with remarks

**Admin Flow:**
1. ✅ Login as admin
2. ✅ View analytics dashboard
3. ✅ See all complaints on map
4. ✅ Filter by department
5. ✅ Assign complaint to staff
6. ✅ Monitor escalated complaints

**AI Features:**
1. ✅ Submit complaint without department → Auto-classified
2. ✅ Submit similar complaint → Marked as duplicate
3. ✅ Urgent keywords → High priority assigned
4. ✅ Wait past SLA → Auto-escalated

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
mongod --version

# Check port 5000 is free
netstat -ano | findstr :5000

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Frontend build errors
```bash
# Clear node_modules and cache
rm -rf node_modules
npm install

# Check .env file exists
cat .env
```

### Maps not loading
- Verify Google Maps API key is correct
- Check API is enabled in Google Cloud Console
- Ensure billing is set up (required for production)

### AI classification not working
- Check API keys in `.env`
- Verify `AI_PROVIDER` is set correctly
- Falls back to keyword matching if API unavailable

---

## 📝 API Endpoints

### Authentication
```
POST /api/auth/register    # Register citizen
POST /api/auth/login       # Login (all roles)
GET  /api/auth/me          # Get current user
```

### Complaints
```
POST   /api/complaints               # Create complaint
GET    /api/complaints               # Get my complaints
GET    /api/complaints/:id           # Get single complaint
POST   /api/complaints/:id/media     # Upload media
```

### Admin
```
GET    /api/admin/complaints         # Get all complaints
GET    /api/admin/analytics          # Get analytics data
GET    /api/admin/staff/:department  # Get staff by department
POST   /api/admin/assign             # Assign complaint
```

### Staff
```
GET    /api/staff/complaints         # Get assigned complaints
PUT    /api/staff/complaints/:id/resolve  # Mark resolved
```

---

## 🎯 Key Features Summary

✅ **JWT Authentication** with role-based access  
✅ **AI-powered department classification**  
✅ **Intelligent duplicate detection**  
✅ **Priority & escalation prediction**  
✅ **Google Maps integration** (geolocation + markers)  
✅ **Real-time analytics dashboard**  
✅ **SLA-based auto-escalation** (cron job)  
✅ **Multi-media support** (image, video, audio)  
✅ **Staff assignment workflow**  
✅ **Responsive UI** with Tailwind CSS  
✅ **Production-ready architecture**  

---

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Google Maps API](https://developers.google.com/maps/documentation/javascript)
- [OpenAI API](https://platform.openai.com/docs)
- [Node-cron Guide](https://www.npmjs.com/package/node-cron)

---

## 🎓 Academic Project Notes

This project demonstrates:
- **Full-stack development** skills
- **AI/ML integration** in real-world applications
- **RESTful API design** principles
- **Database modeling** and relationships
- **Authentication & authorization** implementation
- **Background job processing**
- **Third-party API integration** (Google Maps, OpenAI)
- **Production-grade code structure**
- **Industry best practices**

Suitable for:
- Final year B.Tech/M.Tech projects
- Industry internship portfolios
- Hackathon submissions
- Open-source contributions

---

## 📄 License

MIT License - Free for academic and commercial use

---

## 👨‍💻 Contact & Support

For queries or contributions, contact: [Your Email/GitHub]

**⭐ If this helps with your project, please star the repository!**
