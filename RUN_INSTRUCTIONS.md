# ⚡ FINAL RUN INSTRUCTIONS

## 🎯 Your AI-Powered Grievance System is 100% Complete!

All features have been successfully implemented:
- ✅ AI-powered department classification
- ✅ Duplicate detection with semantic similarity
- ✅ Priority & escalation prediction
- ✅ Google Maps integration with markers
- ✅ Analytics dashboard with Recharts
- ✅ Background jobs for SLA escalation
- ✅ Complete admin, staff, and citizen workflows

---

## 🚀 SETUP STEPS (5 Minutes)

### Step 1: Install Dependencies

**Backend:**
```powershell
cd backend
npm install
```

**Frontend:**
```powershell
cd grievance-citizen
npm install
```

---

### Step 2: Configure Environment Variables

**Create `backend/.env`:**
```env
MONGO_URI=mongodb://localhost:27017/grievance_db
JWT_SECRET=your-secret-key-change-this-12345
PORT=5000
AI_PROVIDER=openai
OPENAI_API_KEY=
```
*Note: OPENAI_API_KEY is optional - system will use fallback if not provided*

**Create `grievance-citizen/.env`:**
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key-here
```
*Get key from: https://console.cloud.google.com/*

---

### Step 3: Start MongoDB

**Windows:**
```powershell
# MongoDB should be running as a service
# Or start manually:
mongod
```

**Alternative: Use MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create cluster and get connection string
- Update MONGO_URI in backend/.env

---

### Step 4: Seed Database

```powershell
cd backend
npm run seed
```

**This creates:**
- Admin: `admin@grievance.com` / `admin123`
- Roads Staff: `roads.staff@grievance.com` / `staff123`
- Water Staff: `water.staff@grievance.com` / `staff123`
- Electricity Staff: `electricity.staff@grievance.com` / `staff123`
- Sanitation Staff: `sanitation.staff@grievance.com` / `staff123`
- Municipal Staff: `municipal.staff@grievance.com` / `staff123`

---

### Step 5: Start Servers

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Expected output:**
```
Server running on port 5000
MongoDB connected
🕐 Escalation cron job started (runs every hour)
```

**Terminal 2 - Frontend:**
```powershell
cd grievance-citizen
npm run dev
```

**Expected output:**
```
VITE v7.2.4  ready in 1234 ms
➜  Local:   http://localhost:5173/
```

---

## 🎮 TESTING THE APPLICATION

### 1. Citizen Flow (5 mins)

**Register:**
1. Go to: http://localhost:5173
2. Click "Register"
3. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Phone: 9876543210
4. Click Register → Auto-logged in

**Raise Complaint:**
1. Click "Raise Complaint"
2. Fill form:
   - Title: "Street light broken on Main Road"
   - Description: "The street light has been broken for 3 days causing safety issues"
   - Department: "Not Sure" (AI will classify)
3. Click "Detect Location" → Allow browser permission
4. Enter area: "Downtown"
5. Optional: Upload a photo
6. Click "Submit Complaint"

**Check AI Classification:**
- AI should auto-classify to "electricity" department
- Check priority is assigned (likely "medium" or "high")
- View on your dashboard

---

### 2. Staff Flow (3 mins)

**Login:**
1. Logout (if logged in as citizen)
2. Login with: `electricity.staff@grievance.com` / `staff123`

**View Complaints:**
1. You're on Staff Dashboard
2. Click "List" tab → See assigned complaints
3. Click "Map" tab → See complaints on Google Maps
4. Click on complaint:
   - View details
   - See priority badge
   - Check location
   - View attachments

**Resolve Complaint:**
1. In "List" tab
2. Add remark: "Replaced bulb and tested. Working fine now."
3. Click "Mark as Resolved"
4. Status changes to "resolved"

---

### 3. Admin Flow (7 mins)

**Login:**
1. Logout
2. Login with: `admin@grievance.com` / `admin123`

**Overview Tab:**
1. See statistics cards:
   - Total complaints
   - Pending count
   - Resolved count
   - Escalated count
2. View charts:
   - Department-wise bar chart
   - Status distribution pie chart
3. Check escalated complaints section

**Complaints Tab:**
1. Click "Complaints" tab
2. See all complaints in system
3. Filter by department:
   - Click "ELECTRICITY" button
   - See only electricity complaints
4. Assign complaint:
   - Click department to load staff
   - Select staff from dropdown
   - Click "Assign"
5. View media attachments (click "View Attachments")

**Map Tab:**
1. Click "Map" tab
2. See all complaints on Google Maps:
   - 🔴 Red markers = Active/Pending
   - 🟢 Green markers = Resolved
3. Click marker → See complaint details
4. Map auto-fits to show all complaints

---

## 🤖 AI FEATURES IN ACTION

### Test Department Classification:
1. Register as citizen
2. Raise complaint with title: "Water pipeline burst"
3. Select department: "Not Sure"
4. Submit → AI classifies to "water" ✅

### Test Priority Prediction:
1. Use urgent words: "Emergency: Major pothole causing accidents"
2. AI assigns "high" priority ✅

### Test Duplicate Detection:
1. Raise complaint: "Street light not working on Main Road"
2. Raise similar complaint: "Light broken on Main Road"
3. System detects as duplicate (check backend logs) ✅

### Test Auto-Escalation:
1. Wait 1 hour (or modify SLA in `escalationJob.js` to 1 minute)
2. Cron job runs automatically
3. Old complaints get escalated
4. Check Admin Dashboard → "Escalated" count increases ✅

---

## 📊 FEATURES DEMONSTRATION CHECKLIST

For project presentation:

**Backend:**
- [x] AI classification service (`aiService.js`)
- [x] Duplicate detection (`duplicateService.js`)
- [x] Escalation cron job (`escalationJob.js`)
- [x] Analytics API (`/api/admin/analytics`)
- [x] Role-based access control
- [x] JWT authentication

**Frontend:**
- [x] Google Maps integration
- [x] Recharts analytics (bar & pie charts)
- [x] Tabbed interfaces
- [x] Color-coded status badges
- [x] Media upload & preview
- [x] Responsive design

**Workflows:**
- [x] Citizen registration & complaint submission
- [x] Staff assignment & resolution
- [x] Admin analytics & oversight
- [x] Location detection & mapping

---

## 🐛 TROUBLESHOOTING

### Maps not loading?
**Fix:**
1. Check `.env` has correct Google Maps API key
2. Verify API is enabled in Google Cloud Console
3. Check browser console (F12) for errors
4. Ensure billing is enabled (required even for free tier)

### AI not working?
**Fix:**
- System automatically falls back to keyword-based classification
- Add OPENAI_API_KEY for full AI features
- Or continue with fallback mode (works fine!)

### MongoDB not connecting?
**Fix:**
```powershell
# Check MongoDB service
mongod --version

# Or use MongoDB Atlas
# Get connection string from cloud.mongodb.com
```

### Port already in use?
**Fix:**
```powershell
# Kill process on port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Or change PORT in backend/.env
```

---

## 📈 MONITORING

### Backend Health Check:
```
http://localhost:5000
```
Should show: "Backend OK"

### View Logs:
- Backend logs in Terminal 1
- Frontend logs in browser console (F12)
- MongoDB logs in MongoDB terminal

### Check Escalation Job:
Watch Terminal 1 for:
```
[2026-01-02T10:00:00.000Z] Running escalation job...
✅ No complaints to escalate
```

---

## 🎓 PROJECT HIGHLIGHTS

When presenting:

**1. Technology Stack:**
- Modern: React 19, Vite, Tailwind CSS
- Robust: Node.js, Express, MongoDB
- AI-Powered: OpenAI/HuggingFace integration

**2. Key Features:**
- Real-time analytics with visualizations
- Google Maps integration with geolocation
- AI-based department classification
- Semantic duplicate detection
- Automatic SLA escalation
- Role-based access control

**3. Industry Standards:**
- Clean architecture (MVC pattern)
- Environment-based configuration
- Secure authentication (JWT + bcrypt)
- Background job processing
- RESTful API design
- Responsive UI/UX

**4. Scalability:**
- Modular code structure
- Reusable components
- Database indexing ready
- API rate limiting (optional)
- Horizontal scaling possible

---

## ✅ PRE-DEMO CHECKLIST

Before presenting:

- [ ] MongoDB running
- [ ] Backend server started (port 5000)
- [ ] Frontend server started (port 5173)
- [ ] Admin/Staff seeded
- [ ] Google Maps loading
- [ ] Test complaint submitted
- [ ] Charts showing on admin dashboard
- [ ] Maps showing markers
- [ ] All 3 roles tested
- [ ] AI classification working

---

## 🎯 QUICK DEMO FLOW (10 minutes)

1. **Show Landing Page** (30 sec)
2. **Citizen: Raise Complaint** (2 min)
   - Location detection
   - AI classification
3. **Staff: Resolve Complaint** (2 min)
   - Map view
   - Add remark
4. **Admin: Dashboard & Analytics** (5 min)
   - Charts & statistics
   - Map with all complaints
   - Assignment workflow
   - Escalation monitoring
5. **Show Code: AI Services** (30 sec)
   - Open `aiService.js`
   - Explain classification logic

---

## 🎉 YOU'RE READY!

Your complete AI-powered grievance management system is now:
- ✅ Fully functional
- ✅ Industry-standard quality
- ✅ Production-ready
- ✅ Well-documented
- ✅ Demo-ready

**Launch the application and impress! 🚀**

---

## 📞 Quick Reference

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

**Logins:**
- Admin: admin@grievance.com / admin123
- Staff: [dept].staff@grievance.com / staff123
- Citizen: Register new account

**Documentation:**
- README.md - Complete documentation
- QUICKSTART.md - Setup guide
- PROJECT_SUMMARY.md - Implementation details

**Good luck with your final year project! 🎓✨**
