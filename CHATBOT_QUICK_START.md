# 🚀 Quick Start Guide - AI Chatbot

## Step 1: Install OpenAI Package

```powershell
cd backend
npm install openai
```

## Step 2: Add OpenAI API Key (Optional)

Create or edit `backend/.env`:

```env
# Existing variables...
MONGODB_URI=mongodb://localhost:27017/grievance
JWT_SECRET=your-secret-key-here

# Add this for AI features
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Get API Key:**
1. Go to: https://platform.openai.com/signup
2. Sign up (free $5 credit)
3. Navigate to API Keys: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy and paste into .env file

**Note:** Without API key, chatbot uses fallback responses (still functional!)

## Step 3: Start Backend

```powershell
cd backend
npm start
```

You should see:
```
Server running on port 5000
MongoDB connected
```

## Step 4: Start Frontend

```powershell
# New terminal
cd grievance-citizen
npm run dev
```

You should see:
```
VITE ready in 1234 ms
Local: http://localhost:5173/
```

## Step 5: Test the Chatbot

1. **Open browser**: http://localhost:5173
2. **Login** as any user (citizen/staff/admin)
3. **Look for**: Pulsing blue chat button in bottom-right corner
4. **Click it** to open AI assistant
5. **Try voice**: Click microphone icon (allow mic access)
6. **Change language**: Click language icon (🌐)
7. **Ask questions**: 
   - "Help me file a complaint"
   - "Check my complaint status"
   - "I have a water leak problem"

## 🎯 Test Features

### Test 1: Basic Chat
```
You: "Hello"
Bot: "Hello! I'm here to help..."
```

### Test 2: Voice Input (English)
1. Click microphone button
2. Say: "Help me file a complaint"
3. Should see text appear
4. Bot responds with guidance

### Test 3: Hindi Support
1. Click language icon (🌐)
2. Select "🇮🇳 हिंदी"
3. Type or speak: "मुझे शिकायत दर्ज करनी है"
4. Bot responds in Hindi

### Test 4: Telugu Support
1. Select "🇮🇳 తెలుగు"
2. Type: "నాకు సహాయం కావాలి"
3. Bot responds in Telugu

### Test 5: Similar Complaints
1. Type: "There's a pothole on my street"
2. Bot searches and shows similar issues
3. Shows resolution times

### Test 6: Quick Actions
Click the quick action buttons:
- 💡 File Complaint
- 🔍 Check Status
- 🔍 Similar Issues

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend opens at localhost:5173
- [ ] Chat button visible and pulsing
- [ ] Chat window opens smoothly
- [ ] Can type and send messages
- [ ] Bot responds within 2-3 seconds
- [ ] Voice button works (mic permission needed)
- [ ] Language selector shows 3 options
- [ ] Quick action buttons work
- [ ] Messages scroll automatically
- [ ] Beautiful gradient UI displays

## 🐛 Troubleshooting

### Chat button not appearing?
- Check browser console for errors
- Ensure ChatAssistant is imported in Dashboard.jsx
- Refresh the page

### Voice not working?
- Use Chrome, Edge, or Safari (Firefox has limited support)
- Grant microphone permission when prompted
- Check browser console for errors

### Bot not responding?
- Check if backend is running (port 5000)
- Verify /api/chatbot routes are loaded
- Look at backend terminal for errors
- Try without API key (fallback mode)

### API key errors?
- Verify API key is correct in .env
- Check OpenAI account has credits
- Fallback mode still works without it

## 💰 Cost Information

### With Free OpenAI Account:
- **Free credits**: $5 (new accounts)
- **Per conversation**: ~$0.002-0.01
- **Estimated**: 500-2500 conversations
- **Enough for**: Full testing and demo

### For Production:
- GPT-3.5 Turbo: Very cheap
- Alternative: Google Gemini (free tier)
- Fallback mode: Always free

## 📊 What to Expect

### Response Times:
- **With AI**: 1-3 seconds
- **Fallback**: Instant
- **Voice input**: 1-2 seconds
- **Similar search**: 0.5-1 second

### Accuracy:
- **AI responses**: High quality, contextual
- **Fallback responses**: Rule-based, still helpful
- **Voice recognition**: 90%+ accuracy
- **Language detection**: Very accurate

## 🎉 Success!

If everything works:
1. ✅ Chat opens smoothly
2. ✅ Messages send and receive
3. ✅ Voice input captures speech
4. ✅ Languages switch correctly
5. ✅ Similar complaints found
6. ✅ Beautiful UI displayed

**You're ready to demo!** 🚀

## 📞 Next Steps

1. **Test all features** thoroughly
2. **Try different scenarios** (complaints, status, help)
3. **Test voice in all 3 languages**
4. **Show to team members**
5. **Gather feedback**
6. **Consider production deployment**

## 🎊 Enjoy Your AI Assistant!

You now have:
- 🤖 Intelligent AI chatbot
- 🎤 Voice input in 3 languages
- 🌐 English, Hindi, Telugu support
- 🔍 Smart complaint detection
- 💡 Guided filing process
- ✨ Beautiful modern UI

**Perfect for serving Indian communities!** 🇮🇳
