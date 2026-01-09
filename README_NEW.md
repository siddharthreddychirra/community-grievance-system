# 🏛️ Community Grievance Management System

## 🎉 Complete Feature-Rich Platform

A production-ready civic complaint management system with **8 major features** including AI-powered classification, duplicate detection, ratings, analytics, and locality-based management.

---

## ✨ Key Features

### 1. **Complaint Rating System** ⭐
- Citizens rate resolved complaints (1-5 stars)
- Optional text feedback
- Tracks citizen satisfaction metrics
- Prevents duplicate ratings

### 2. **Comprehensive Analytics Dashboard** 📊
- Overview stats (total, resolved, in-progress, escalated)
- Department & locality breakdowns
- Staff performance leaderboard
- Resolution time statistics (avg/min/max)
- Citizen satisfaction scores
- Recent activity tracking (7 days)
- Locality filter for targeted insights

### 3. **Intelligent Duplicate Detection** 🔍
- Real-time similarity search while typing
- Shows top 3 similar complaints
- Displays status and similarity percentage
- Reduces redundant complaints
- Dismissible warnings

### 4. **Locality-Based Management** 📍
- 5 localities: Jangaon, Warangal, Narapally, Pocharam, Karimnagar
- Auto-detect location or manual selection
- Staff see only their locality complaints
- Transparency map for citizens
- Admin has full locality access

### 5. **AI Image Validation** 🖼️
- Google Gemini AI validates uploads
- Rejects selfies, memes, irrelevant images
- Accepts only civic infrastructure issues
- Automatic validation during upload

### 6. **Voice Recording (Staff Only)** 🎤
- Browser-based audio recording (WebM)
- Record/stop/play/delete controls
- Uploads with complaint resolution
- Internal staff communication tool

### 7. **Transparency Map** 🗺️
- Interactive Leaflet map with OpenStreetMap
- Color-coded markers by status
- Shows all complaints in user's locality
- Click markers for details

### 8. **Real-Time Complaint Flow** 📈
- Visual timeline: Submitted → Triaged → Assigned → In Progress → Resolved
- Color-coded progress indicators
- Escalation status display
- Staff assignment tracking

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router v6** for navigation
- **Leaflet** for maps
- **Lucide React** for icons

### Backend
- **Node.js 22.15** with Express 4.18
- **MongoDB 7.0** with Mongoose 8.9
- **JWT** authentication (7-day expiry)
- **Multer** for file uploads (50MB limit)
- **bcryptjs** for password hashing

### AI Services
- **Google Gemini AI** (`gemini-1.5-flash`) for image validation
- **HuggingFace/OpenAI** for text classification (optional)
- Duplicate detection with semantic similarity
- Department auto-classification

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
│   │   │   ├── auth.js            # JWT middleware
│   │   │   ├── requireRole.js     # Role-based access
│   │   │   ├── upload.js          # File upload (Multer)
│   │   │   └── imageValidator.js  # ✅ NEW: Gemini AI validation
│   │   ├── models/
│   │   │   ├── User.js            # User schema
│   │   │   └── Complaint.js       # ✅ UPDATED: Added rating fields
│   │   ├── routes/
│   │   │   ├── auth.js            # Auth endpoints
│   │   │   ├── complaints.js      # ✅ UPDATED: Rating endpoint
│   │   │   ├── admin.js           # Admin endpoints
│   │   │   ├── staff.js           # Staff endpoints
│   │   │   └── analytics.js       # ✅ NEW: Analytics dashboard
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── aiService.js       # AI classification
│   │   │   ├── duplicateService.js # Duplicate detection
│   │   │   └── escalationService.js # Auto-escalation
│   │   └── index.js               # Server entry point
│   ├── uploads/                   # Media storage
│   ├── package.json
│   └── .env                       # Environment variables
├── grievance-citizen/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RatingModal.jsx          # ✅ NEW: Star rating UI
│   │   │   ├── DuplicateChecker.jsx     # ✅ NEW: Duplicate detection
│   │   │   ├── ComplaintFlow.jsx        # Timeline visualization
│   │   │   ├── MapView.jsx              # Leaflet map
│   │   │   ├── LeafletMap.jsx           # Map implementation
│   │   │   └── ProtectedRoute.jsx       # Route guards
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx            # Citizen dashboard
│   │   │   ├── MyComplaints.jsx         # ✅ UPDATED: Rating integration
│   │   │   ├── RaiseComplaint.jsx       # ✅ UPDATED: Duplicate check
│   │   │   ├── AdminDashboard.jsx       # ✅ UPDATED: Analytics link
│   │   │   ├── AdminAnalytics.jsx       # ✅ NEW: Full analytics page
│   │   │   ├── StaffDashboard.jsx       # Staff interface
│   │   │   ├── Login.jsx                # Locality-based login
│   │   │   └── Register.jsx             # User registration
│   │   ├── App.jsx                      # ✅ UPDATED: Analytics route
│   │   └── api.js                       # API utilities
│   ├── package.json
│   └── vite.config.js
├── FEATURES_COMPLETE.md         # ✅ NEW: Complete feature docs
├── TESTING_GUIDE.md             # ✅ NEW: Comprehensive testing
├── START_SERVERS.ps1            # ✅ NEW: Quick start script
└── README.md                    # This file
```

---

## 🚀 Quick Start

### Option 1: Automated Start (Recommended)
```powershell
# Run the automated startup script
.\START_SERVERS.ps1
```
Opens 2 terminal windows automatically:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:5173`

### Option 2: Manual Start

#### 1. Install Dependencies
```powershell
# Backend
cd backend
npm install

# Frontend
cd grievance-citizen
npm install
```

#### 2. Configure Environment
Create `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/grievance_db
JWT_SECRET=your_super_secret_key_here_change_in_production
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key
```

#### 3. Start MongoDB
```powershell
# Ensure MongoDB is running
mongod --dbpath="C:\data\db"
```

#### 4. Start Servers
```powershell
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd grievance-citizen
npm run dev
```

---

## 🔑 Default Credentials

### Admin
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Access**: Full system, analytics, staff management

### Staff (by locality)
- **jangaon_staff@example.com** / `staff123`
- **warangal_staff@example.com** / `staff123`
- **narapally_staff@example.com** / `staff123`
- **pocharam_staff@example.com** / `staff123`
- **karimnagar_staff@example.com** / `staff123`

### Citizens
Register new accounts at `/register`

---

## 📊 Usage Flow

### For Citizens:
1. **Register** → Select locality or auto-detect
2. **Login** → Access dashboard
3. **Raise Complaint** → AI checks for duplicates, validates images
4. **Track Status** → View real-time progress timeline
5. **View Map** → See all complaints in your locality
6. **Rate Resolution** → Give 1-5 star rating after resolution

### For Staff:
1. **Login** → See only your locality complaints
2. **Update Status** → Assigned → In Progress → Resolved
3. **Add Remarks** → Update citizens on progress
4. **Record Voice Notes** → Internal communication
5. **Upload Media** → Before/after photos

### For Admin:
1. **Login** → View all complaints
2. **Assign Staff** → Match complaints to staff
3. **View Analytics** → Comprehensive dashboard
4. **Track Performance** → Staff leaderboard
5. **Monitor Satisfaction** → Citizen rating metrics
6. **Manage System** → Create staff, view reports

---

## 🧪 Testing

See **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** for comprehensive test scenarios including:
- Complete lifecycle testing
- Duplicate detection tests
- Analytics dashboard validation
- Voice recording tests
- Locality filtering tests
- Image validation tests

---

## 📚 Documentation

- **[FEATURES_COMPLETE.md](./FEATURES_COMPLETE.md)** - All 8 features explained
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Complete testing guide
- **[RUN_INSTRUCTIONS.md](./RUN_INSTRUCTIONS.md)** - Detailed setup
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Technical overview

---

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Complaints
- `GET /api/complaints` - Get all complaints (paginated)
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/my` - Get user's complaints
- `GET /api/complaints/locality/all` - Get locality complaints (transparency)
- `POST /api/complaints/check-duplicate` - Check for duplicates
- `POST /api/complaints/:id/rate` - ✅ NEW: Rate complaint (1-5 stars)
- `POST /api/complaints/:id/media` - Upload media
- `PUT /api/complaints/:id` - Update complaint

### Staff
- `GET /api/staff/complaints` - Get staff's assigned complaints

### Admin
- `GET /api/admin/complaints` - Get all complaints
- `GET /api/admin/analytics` - Basic analytics
- `POST /api/admin/staff` - Create staff account
- `GET /api/admin/staff/:dept` - Get department staff
- `PUT /api/admin/complaints/:id/assign` - Assign to staff

### Analytics
- `GET /api/analytics/dashboard` - ✅ NEW: Comprehensive analytics
  - Query params: `?locality=jangaon` (optional)
  - Returns: Overview, departments, localities, priorities, status, resolution stats, staff performance, satisfaction, recent activity

---

## 🔒 Security Features

- ✅ JWT authentication (7-day expiry)
- ✅ Password hashing (bcryptjs, 10 rounds)
- ✅ Role-based access control (citizen/staff/admin)
- ✅ Protected routes on frontend
- ✅ CORS configured
- ✅ Input validation
- ✅ File upload restrictions (50MB, specific types)
- ✅ AI content validation (rejects inappropriate images)

---

## 🌟 Highlights

### AI-Powered:
- ✅ Gemini AI image validation
- ✅ Department auto-classification
- ✅ Duplicate detection with similarity scores
- ✅ Priority prediction

### User Experience:
- ✅ Real-time duplicate warnings
- ✅ Interactive maps with markers
- ✅ Visual complaint timelines
- ✅ Star rating system
- ✅ Voice recording for staff
- ✅ Responsive design
- ✅ Loading states and animations

### Data & Insights:
- ✅ Comprehensive analytics dashboard
- ✅ Staff performance tracking
- ✅ Citizen satisfaction metrics
- ✅ Resolution time analysis
- ✅ Department/locality breakdowns
- ✅ Recent activity monitoring

---

## 🚧 Future Enhancements (Optional)

- [ ] SMS notifications (Twilio)
- [ ] Email notifications (Nodemailer - already setup)
- [ ] WhatsApp integration (Business API)
- [ ] Multi-language support (i18next)
- [ ] Offline mode (Service Workers)
- [ ] Push notifications (Firebase)
- [ ] PDF report generation
- [ ] Advanced search filters
- [ ] Dark mode
- [ ] Mobile app (React Native)

---

## 🐛 Troubleshooting

### Port Conflicts:
```powershell
# Kill process on port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# Kill process on port 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

### MongoDB Not Running:
```powershell
# Start MongoDB
mongod --dbpath="C:\data\db"
```

### Frontend Not Loading:
- Check if backend is running on port 5000
- Verify `http://localhost:5000/api/auth/me` returns 401
- Clear browser cache
- Check browser console for errors

### Image Upload Failing:
- Ensure Gemini API key is set in `.env`
- Check file size < 50MB
- Upload only civic-related images (roads, water, etc.)
- Avoid selfies, memes, irrelevant content

---

## 📈 Project Stats

- **Total Features**: 8 major features
- **Components**: 15+ React components
- **API Endpoints**: 20+ RESTful APIs
- **Database Models**: 4 schemas (User, Complaint, Comment, Department)
- **Localities**: 5 (Jangaon, Warangal, Narapally, Pocharam, Karimnagar)
- **Roles**: 3 (Citizen, Staff, Admin)
- **Status Flow**: 7 states (submitted, triaged, assigned, in-progress, resolved, closed, escalated)

---

## 👥 Contributors

- **Your Name** - Full Stack Development, AI Integration

---

## 📜 License

This is an academic project for educational purposes.

---

## 🎉 Ready to Use!

Your complete grievance management system is ready with:
✅ Ratings & Feedback
✅ Advanced Analytics
✅ Duplicate Prevention
✅ Locality Management
✅ AI Validation
✅ Voice Recording
✅ Transparency Maps
✅ Real-time Tracking

**Run `.\START_SERVERS.ps1` and start testing!** 🚀
