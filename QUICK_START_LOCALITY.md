# 🚀 Quick Start Guide - Locality System

## Step 1: Install Dependencies

Run the installation script:
```powershell
.\install-locality-updates.ps1
```

Or manually install:
```bash
cd backend
npm install @google/generative-ai
cd ..
```

## Step 2: Update Environment Variables

Add to your `backend/.env` file:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### Get Gemini API Key:
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy and paste into `.env`

**Note**: Free tier allows 15 requests per minute, which is sufficient for testing.

## Step 3: Start the Servers

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd grievance-citizen
npm run dev
```

## Step 4: Test the Features

### Test Locality Login:
1. Go to http://localhost:5173/login?role=citizen
2. Watch for auto-detection (or select manually)
3. Login with existing credentials
4. Check that locality badge shows in dashboard

### Test Transparency Map:
1. Login as a citizen
2. Click "View Locality Map" button
3. Verify you see complaints from your locality
4. Click on map markers to see details

### Test Image Validation:
1. Try to raise a complaint
2. Upload a selfie or meme → Should be rejected
3. Upload a photo of a road/infrastructure issue → Should be accepted

### Test Locality Filtering:
1. Login as staff member
2. Verify you only see complaints from your locality
3. Try logging in with wrong locality → Should get error

## 🧪 Test Accounts

Use existing accounts created previously. They should already have localities assigned.

## ⚠️ Troubleshooting

### Issue: Location auto-detection not working
- **Solution**: Browser needs permission. Check browser settings.
- **Solution**: Must be on HTTPS or localhost

### Issue: Image validation always accepts
- **Solution**: Check GEMINI_API_KEY is set correctly
- **Solution**: Check backend logs for AI errors
- **Note**: System fails open (allows images) if AI is unavailable

### Issue: Map not showing
- **Solution**: Ensure complaints have valid lat/lng coordinates
- **Solution**: Check browser console for errors
- **Solution**: Verify MapView component is imported

### Issue: "Invalid locality" error on login
- **Solution**: User's locality must match selected locality
- **Solution**: Check user account has valid locality in database

## 📊 Verify Database

Check that users and complaints have localities:
```javascript
// In MongoDB
db.users.find({}, {name: 1, locality: 1, role: 1})
db.complaints.find({}, {title: 1, locality: 1, status: 1}).limit(5)
```

## 🎯 Key Features to Demonstrate

1. **Auto Location Detection**: Shows nearest locality automatically
2. **Transparency Map**: Citizens see all complaints in their area
3. **Smart Filtering**: Staff only see their locality's complaints
4. **AI Validation**: Rejects irrelevant images with clear explanations
5. **Interactive Map**: Click markers to see complaint details

## 📝 Next Steps

After testing:
- Review the LOCALITY_SYSTEM_IMPLEMENTATION.md for full details
- Check application logs for any errors
- Test with multiple localities
- Test cross-locality scenarios

## 🆘 Need Help?

Check:
1. Browser console (F12) for frontend errors
2. Backend terminal for server errors
3. Network tab to see API requests/responses
4. LOCALITY_SYSTEM_IMPLEMENTATION.md for detailed documentation

---

**Ready to test!** 🎉
