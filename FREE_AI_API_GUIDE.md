# 🆓 Free AI API Options for Chatbot

## Option 1: Google Gemini API (RECOMMENDED - Truly Free!) ⭐

### Why Gemini?
- ✅ **100% FREE** - No credit card required
- ✅ **60 requests per minute** - Very generous
- ✅ **1500 requests per day** - More than enough
- ✅ **No expiration** - Free tier never expires
- ✅ **Great for Indian languages** - Better Hindi/Telugu support
- ✅ **Fast responses** - Similar to GPT-3.5

### How to Get Gemini API Key (2 minutes):

#### Step 1: Go to Google AI Studio
https://makersuite.google.com/app/apikey

#### Step 2: Sign in with Google Account
- Use any Gmail account
- No credit card needed

#### Step 3: Create API Key
- Click "Create API Key"
- Select "Create API key in new project"
- Copy the key (looks like: AIzaSy...)

#### Step 4: Add to Your Project
Open `backend/.env` and add:
```env
# Use Gemini (Free, no credit card needed)
GEMINI_API_KEY=AIzaSy...your-key-here
AI_PROVIDER=gemini

# OR use OpenAI (requires credit card after $5 trial)
# OPENAI_API_KEY=sk-...
# AI_PROVIDER=openai
```

### That's it! 🎉

---

## Option 2: OpenAI API (Free Trial Only)

### Limitations:
- ❌ **$5 credit only** for new accounts
- ❌ **Credit card required** after trial
- ❌ **Expires in 3 months** if unused
- ✅ Slightly better English responses
- ❌ Costs money after trial ($0.002/chat)

### How to Get OpenAI API Key:

1. Go to: https://platform.openai.com/signup
2. Sign up (email verification needed)
3. Add credit card (required even for free trial)
4. Go to: https://platform.openai.com/api-keys
5. Create new secret key
6. Copy key (sk-...)

---

## 🎯 Quick Setup (Gemini - Recommended)

### 1. Get Gemini API Key
```
Visit: https://makersuite.google.com/app/apikey
Click: "Create API Key"
Copy: AIzaSy...
```

### 2. Update .env File
```env
# backend/.env
GEMINI_API_KEY=AIzaSy...your-key-here
AI_PROVIDER=gemini
```

### 3. Start Server
```powershell
cd backend
npm start
```

### 4. Test Chatbot
- Open http://localhost:5173
- Login
- Click chat button
- Ask: "Help me file a complaint"
- Should get AI response!

---

## 📊 Comparison

| Feature | Gemini (Free) | OpenAI (Paid) |
|---------|--------------|---------------|
| **Cost** | FREE Forever | $5 trial, then paid |
| **Limit** | 60/min, 1500/day | Pay per use |
| **Credit Card** | NOT Required | Required |
| **Quality** | Excellent | Slightly better |
| **Hindi/Telugu** | Better | Good |
| **Setup Time** | 2 minutes | 5 minutes |
| **For Production** | ✅ Perfect | 💰 Costs money |

---

## 🚀 Testing Both APIs

### Test with Gemini:
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...
```

### Test with OpenAI:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

### Test without API (Fallback):
```env
# Comment out or remove both keys
# Chatbot still works with rule-based responses!
```

---

## 💡 My Recommendation

**Use Google Gemini because:**
1. ✅ Completely free forever
2. ✅ No credit card needed
3. ✅ 1500 requests/day is plenty
4. ✅ Better for Hindi/Telugu
5. ✅ Perfect for government projects
6. ✅ No budget concerns
7. ✅ No surprise charges

---

## 🔧 Already Have the Code!

Good news - your backend already supports Gemini! The `@google/generative-ai` package is installed.

Just add the API key to `.env` and you're done!

---

## 📞 Links

**Get Gemini API Key (Free):**
https://makersuite.google.com/app/apikey

**Gemini Documentation:**
https://ai.google.dev/docs

**OpenAI (Paid after trial):**
https://platform.openai.com/api-keys

---

## 🎉 Conclusion

**For your project, use Gemini API:**
- No cost ever
- No credit card
- Takes 2 minutes
- Works perfectly
- Government-friendly

Just get the key and add to .env! 🚀
