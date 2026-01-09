# 🧪 Complete Testing Guide

## 🚀 Quick Start

### 1. Start Backend Server
```powershell
cd backend
npm start
```
Server runs on: `http://localhost:5000`

### 2. Start Frontend Server
```powershell
cd grievance-citizen
npm run dev
```
Frontend runs on: `http://localhost:5173` (or 5174 if 5173 is busy)

---

## 👥 Test Accounts

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: admin
- **Access**: All features, analytics dashboard, staff management

### Staff Accounts (by locality)
- **jangaon_staff@example.com** / `staff123` (Jangaon)
- **warangal_staff@example.com** / `staff123` (Warangal)
- **narapally_staff@example.com** / `staff123` (Narapally)
- **pocharam_staff@example.com** / `staff123` (Pocharam)
- **karimnagar_staff@example.com** / `staff123` (Karimnagar)

### Citizen Accounts
Create your own by registering at `/register`

---

## 🧪 Test Scenarios

### ✅ Scenario 1: Complete Complaint Lifecycle with Rating

1. **Citizen Registers**
   - Navigate to `/register`
   - Fill: Name, Email, Password
   - Select Locality (e.g., "jangaon")
   - Click "Register"
   - ✅ Should redirect to login

2. **Citizen Raises Complaint**
   - Login with new citizen account
   - Click "Raise Complaint" on dashboard
   - Fill title (e.g., "Broken road at Main Street")
   - Fill description
   - **Wait 1 second** - Duplicate checker should activate
   - If no duplicates, continue
   - Select department or "Not Sure"
   - Click "Detect Location" (allow browser permission)
   - Enter area name
   - Upload images (relevant civic issues only)
   - Click "Submit Complaint"
   - ✅ Success message appears

3. **Admin Assigns to Staff**
   - Logout, login as admin
   - Go to "Complaints" tab
   - Find new complaint
   - Click "Assign" button
   - Select staff member
   - ✅ Complaint status changes to "assigned"

4. **Staff Resolves Complaint**
   - Logout, login as staff (matching locality)
   - Dashboard shows assigned complaint
   - Update status to "in-progress"
   - Add staff remark
   - **Record voice note** (click mic button, record, stop)
   - Upload resolution media (before/after photos)
   - Change status to "resolved"
   - Click "Update"
   - ✅ Complaint marked as resolved

5. **Citizen Rates Resolution**
   - Logout, login as citizen
   - Go to "My Complaints"
   - Find resolved complaint
   - Click "Rate This Resolution" button
   - Select 1-5 stars (hover for effects)
   - Add feedback text (optional)
   - Click "Submit Rating"
   - ✅ Rating saved, button becomes rating display

6. **Admin Views Analytics**
   - Logout, login as admin
   - Click "Analytics Dashboard" (top right)
   - ✅ See rating in "Citizen Satisfaction" section
   - ✅ See staff in performance leaderboard
   - ✅ See resolution time statistics

---

### ✅ Scenario 2: Duplicate Detection

1. **Create First Complaint**
   - Login as citizen
   - Raise complaint: "Water leak on Station Road"
   - Submit successfully

2. **Try Similar Complaint**
   - Click "Raise Complaint" again
   - Type title: "Water leakage Station Road"
   - **Wait 1 second**
   - ✅ Yellow banner appears with similar complaints
   - ✅ Shows 3 similar complaints with status
   - ✅ Similarity percentage displayed
   - Click "View" to see details
   - Click "X" to dismiss banner
   - Can still submit if genuinely different

3. **Try Different Complaint**
   - Type completely different title
   - ✅ No duplicate banner appears
   - Submit normally

---

### ✅ Scenario 3: Analytics Dashboard Deep Dive

1. **Generate Test Data**
   - Create 10+ complaints across different:
     - Departments (roads, water, sanitation)
     - Localities (jangaon, warangal, etc.)
     - Statuses (submitted, in-progress, resolved)
     - Priorities (low, medium, high)
   - Assign to different staff members
   - Resolve some complaints
   - Rate 3-5 resolved complaints

2. **View Analytics**
   - Login as admin
   - Click "Analytics Dashboard"
   
3. **Test Overview Section**
   - ✅ Total complaints count matches
   - ✅ Resolved count is accurate
   - ✅ In-progress count is accurate
   - ✅ Resolution rate percentage calculated
   - ✅ Color-coded stat cards

4. **Test Department Breakdown**
   - ✅ Bar chart shows all departments
   - ✅ Percentages add up to 100%
   - ✅ "Unassigned" shows for pending complaints

5. **Test Locality Breakdown**
   - ✅ Grid shows all 5 localities
   - ✅ Counts match actual complaints
   - ✅ Percentages calculated correctly

6. **Test Resolution Stats**
   - ✅ Average days displayed (if any resolved)
   - ✅ Min and max days shown
   - ✅ Color-coded cards (blue, green, red)

7. **Test Staff Performance**
   - ✅ Top 10 staff listed
   - ✅ Rank badges (🥇🥈🥉) for top 3
   - ✅ Resolved count accurate
   - ✅ Success rate percentage shown
   - ✅ Staff names populated

8. **Test Citizen Satisfaction**
   - ✅ Average rating displayed (1.0-5.0)
   - ✅ Star visualization matches rating
   - ✅ Total rated count shown
   - ✅ Only appears if ratings exist

9. **Test Recent Activity**
   - ✅ Shows complaint count from last 7 days
   - ✅ Large number display

10. **Test Locality Filter**
    - Select "jangaon" from dropdown
    - ✅ All stats update to show only jangaon data
    - ✅ Department breakdown filtered
    - ✅ Staff performance filtered
    - Select "All Localities"
    - ✅ Data returns to full view

---

### ✅ Scenario 4: Voice Recording (Staff Only)

1. **Login as Staff**
   - Use any staff account
   - Go to staff dashboard

2. **Find Assigned Complaint**
   - Click on complaint to expand

3. **Record Voice Note**
   - Scroll to "Voice Note (Staff Only)" section (blue background)
   - Click "🎤 Start Recording"
   - Browser asks for microphone permission - allow
   - ✅ Button changes to "⏹️ Stop Recording"
   - Speak for 3-5 seconds
   - Click "⏹️ Stop Recording"
   - ✅ "▶️ Play" button appears

4. **Test Playback**
   - Click "▶️ Play"
   - ✅ Hear recorded audio
   - ✅ Button changes to "⏸️ Stop"
   - Click "⏸️ Stop" to stop playback

5. **Delete and Re-record**
   - Click "🗑️ Delete"
   - ✅ Audio removed, back to "Start Recording"
   - Record new audio

6. **Submit with Complaint**
   - Add staff remark
   - Change status to "resolved"
   - Click "Update Complaint"
   - ✅ Voice note uploaded as audio file

---

### ✅ Scenario 5: Locality-Based Filtering

1. **Create Complaints in Multiple Localities**
   - Register citizens in different localities
   - Each raises 2-3 complaints

2. **Test Staff Filtering**
   - Login as `jangaon_staff@example.com`
   - ✅ Only see jangaon complaints
   - Logout, login as `warangal_staff@example.com`
   - ✅ Only see warangal complaints

3. **Test Citizen Transparency Map**
   - Login as citizen (jangaon)
   - Go to dashboard
   - Click "View Locality Complaints Map"
   - ✅ Map shows only jangaon complaints
   - ✅ Markers color-coded by status
   - Click marker
   - ✅ Complaint details appear

4. **Test Admin Full View**
   - Login as admin
   - ✅ See ALL complaints from all localities
   - Use analytics locality filter
   - ✅ Can filter by specific locality

---

### ✅ Scenario 6: AI Image Validation

1. **Test Valid Image**
   - Login as citizen
   - Raise complaint
   - Upload image of road damage/pothole
   - ✅ Upload succeeds

2. **Test Invalid Image**
   - Upload selfie or meme
   - ✅ Upload rejected with error message
   - ✅ File deleted from server

3. **Test Multiple Images**
   - Upload mix: 2 valid + 1 invalid
   - ✅ Valid images accepted
   - ✅ Invalid image rejected
   - ✅ Clear error message

---

### ✅ Scenario 7: Complaint Flow Visualization

1. **Track Progression**
   - Citizen raises complaint
   - ✅ Timeline shows "Submitted" active
   - Admin assigns to staff
   - ✅ Timeline shows "Assigned" active
   - Staff changes to "in-progress"
   - ✅ Timeline shows "In Progress" active
   - Staff resolves
   - ✅ Timeline shows "Resolved" active
   - ✅ All previous stages marked as completed

2. **Test Escalation**
   - Leave complaint unresolved for escalation period
   - ✅ Timeline shows escalation warning
   - ✅ Status updates to "escalated"

---

## 🐛 Common Issues & Solutions

### Issue: Port 5000 already in use
**Solution**:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

### Issue: Frontend port 5173 busy
**Solution**:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```
Or frontend will auto-use 5174

### Issue: "locality is required" on registration
**Solution**: Ensure you selected a locality from dropdown (not "Select your locality")

### Issue: Images not uploading
**Solution**:
1. Check file size < 50MB
2. Ensure images are civic-related (AI validation)
3. Check backend logs for Gemini API errors

### Issue: Geolocation not working
**Solution**:
1. Allow browser location permission
2. Use HTTPS in production (HTTP works on localhost)

### Issue: Voice recording not working
**Solution**:
1. Allow browser microphone permission
2. Use HTTPS in production
3. Check browser support (Chrome/Edge recommended)

### Issue: Analytics not loading
**Solution**:
1. Ensure you're logged in as admin
2. Check backend is running on port 5000
3. Check browser console for errors
4. Verify JWT token is valid

### Issue: Duplicate detection not showing
**Solution**:
1. Type at least 10 characters in title
2. Wait 1 second (debounce)
3. Ensure backend `/api/complaints/check-duplicate` endpoint is working

---

## 📊 Expected Results Summary

### Citizen Journey:
1. Register → Login → Raise Complaint → Track Status → Rate Resolution
2. View transparency map of locality
3. Get duplicate warnings before submitting
4. Upload validated images only

### Staff Journey:
1. Login → See locality complaints only → Update status
2. Add remarks and voice notes
3. Upload resolution media
4. Track assigned complaints

### Admin Journey:
1. Login → Manage all complaints → Assign to staff
2. View comprehensive analytics dashboard
3. Track staff performance
4. Monitor citizen satisfaction
5. Filter by locality
6. Create new staff accounts

---

## ✅ Success Criteria

- ✅ All complaints flow through lifecycle
- ✅ Ratings submit successfully
- ✅ Analytics dashboard loads with accurate data
- ✅ Duplicate detection activates
- ✅ Voice recording works for staff
- ✅ Locality filtering works correctly
- ✅ Image validation rejects invalid content
- ✅ Maps display complaints accurately
- ✅ No console errors
- ✅ Smooth user experience

---

## 🎯 Performance Metrics

### Backend:
- API response time < 500ms
- Image validation < 2s
- Analytics aggregation < 1s

### Frontend:
- Page load < 2s
- Smooth animations (60fps)
- No layout shifts

---

## 📝 Test Checklist

- [ ] User registration works
- [ ] Login with all roles works
- [ ] Complaint submission successful
- [ ] Duplicate detection activates
- [ ] Image validation rejects invalid images
- [ ] Location detection works
- [ ] Staff can update complaints
- [ ] Voice recording works
- [ ] Admin can assign complaints
- [ ] Rating system works
- [ ] Analytics dashboard loads
- [ ] All stat cards show correct data
- [ ] Staff performance leaderboard accurate
- [ ] Citizen satisfaction displays
- [ ] Locality filter works
- [ ] Maps display correctly
- [ ] Timeline visualization works
- [ ] No 404 errors
- [ ] No console errors

---

## 🚀 Production Deployment Checklist

- [ ] Change API URLs to production domain
- [ ] Set up HTTPS (Let's Encrypt)
- [ ] Configure environment variables (.env)
- [ ] Set up MongoDB Atlas or production database
- [ ] Add Gemini API key
- [ ] Configure email SMTP (Nodemailer)
- [ ] Set up CDN for media files
- [ ] Enable CORS for production domain
- [ ] Set secure JWT secret
- [ ] Configure rate limiting
- [ ] Set up logging (Winston/Morgan)
- [ ] Configure backup strategy
- [ ] Add monitoring (PM2/New Relic)
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Load testing (Artillery/k6)
- [ ] Security audit
- [ ] SEO optimization
- [ ] PWA configuration
- [ ] Error tracking (Sentry)

---

## 📞 Support

If you encounter any issues:
1. Check browser console (F12)
2. Check backend terminal logs
3. Verify MongoDB connection
4. Check network tab for failed requests
5. Review error messages carefully

**Happy Testing! 🎉**
