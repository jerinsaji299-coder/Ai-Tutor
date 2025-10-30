# 🔑 YouTube API Setup Guide

## Why YouTube API Key?

The updated Video Enhancement feature now:
- ✅ Fetches **real YouTube videos** (not search links)
- ✅ Extracts **video transcripts**
- ✅ Generates **AI summaries from actual video content**
- ✅ Creates **PDF study notes from video transcripts**

To access real YouTube data, you need a **free** YouTube Data API v3 key.

## 📋 How to Get YouTube API Key (Free)

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### Step 2: Create a New Project
1. Click the project dropdown at the top
2. Click **"New Project"**
3. Enter project name: `AI-Tutor-YouTube`
4. Click **"Create"**

### Step 3: Enable YouTube Data API v3
1. In the search bar, type: `YouTube Data API v3`
2. Click on **"YouTube Data API v3"**
3. Click **"Enable"** button
4. Wait for API to be enabled (~30 seconds)

### Step 4: Create API Credentials
1. Click **"Create Credentials"** button
2. Select:
   - **Which API**: YouTube Data API v3
   - **Where**: Web server
   - **What data**: Public data
3. Click **"What credentials do I need?"**
4. Copy your **API Key** (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

### Step 5: Restrict API Key (Optional but Recommended)
1. Click on your API key name
2. Under **"Application restrictions"**:
   - Select **"HTTP referrers"**
   - Add: `http://localhost:*`
3. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Choose **"YouTube Data API v3"**
4. Click **"Save"**

### Step 6: Add to Your Project
1. Open: `backend/.env`
2. Replace:
   ```
   YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY_HERE
   ```
   With:
   ```
   YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
3. Save the file
4. Restart backend server

## 🆓 Free Quota Limits

YouTube Data API v3 **FREE TIER**:
- **10,000 units per day** (FREE forever!)
- Video search: ~100 units per request
- Video details: ~1 unit per video
- **You can search ~100 times per day for FREE**

### Unit Costs:
| Operation | Cost | How Many/Day |
|-----------|------|--------------|
| Search videos | 100 units | 100 searches |
| Get video details | 1 unit | 10,000 requests |
| Transcript | 0 units | Unlimited (separate library) |

**For this project**: You'll easily stay within free limits! 🎉

## 🔄 Fallback Mode (No API Key)

If you **don't add an API key**, the system will:
- ✅ Still work using `youtube-search-api` package
- ✅ Fetch real videos (limited metadata)
- ✅ Extract transcripts
- ✅ Generate AI summaries
- ⚠️ No video durations or view counts
- ⚠️ Slightly less accurate results

**Recommendation**: Get the free API key for best results!

## ✅ Verify Setup

After adding your API key:

1. Restart backend:
   ```bash
   cd backend
   npm start
   ```

2. Look for:
   ```
   🎥 YouTube Service initialized
   ✅ YouTube API key configured
   ```

3. Test with Video Enhancement tab

## 🔒 Keep Your API Key Safe

**DO:**
- ✅ Keep it in `.env` file
- ✅ Add `.env` to `.gitignore`
- ✅ Restrict key to localhost

**DON'T:**
- ❌ Commit API key to GitHub
- ❌ Share API key publicly
- ❌ Use same key for production

## 🚨 Troubleshooting

### Error: "YouTube API key not configured"
**Solution**: Add key to `.env` file and restart server

### Error: "API key not valid"
**Solution**: 
1. Check you copied the full key
2. Ensure YouTube Data API v3 is enabled
3. Wait 5 minutes for key activation

### Error: "Quota exceeded"
**Solution**: 
1. Wait 24 hours for quota reset (midnight Pacific Time)
2. Or use fallback mode (remove API key)

### Error: "Access Not Configured"
**Solution**: Enable YouTube Data API v3 in Google Cloud Console

## 📊 Monitor Usage

Check your API usage:
1. Go to: https://console.cloud.google.com/
2. Select your project
3. Navigate to: **APIs & Services > Dashboard**
4. View **YouTube Data API v3** usage

## 🎯 What This Enables

With YouTube API key configured:

### ✅ Real Video Data
```javascript
{
  "id": "dQw4w9WgXcQ",
  "title": "Python Tutorial for Beginners",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "channelTitle": "Programming with Mosh",
  "duration": "6:45:45",
  "viewCount": "12,456,789",
  "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
}
```

### ✅ Video Transcripts
```javascript
{
  "transcript": "Welcome to Python tutorial. In this video we'll learn...",
  "length": 45678
}
```

### ✅ AI-Generated Summaries
```
This comprehensive Python tutorial covers variables, data types, 
control structures, and functions. Perfect for beginners starting 
their programming journey. The video includes hands-on examples 
and explains common pitfalls to avoid.
```

### ✅ Transcript-Based Study Notes
```
📘 INTRODUCTION
Based on video analysis, Python is a versatile programming language...

🎯 KEY CONCEPTS
1. Variables and Data Types - String, Integer, Float types explained
2. Control Flow - if-else statements and loops demonstrated
3. Functions - Creating reusable code blocks with parameters
...

📖 DETAILED EXPLANATION
The videos demonstrate Python fundamentals through practical examples.
Variables are introduced as containers for data, with emphasis on...
```

## 🎓 Educational Benefits

**Before (No API Key)**:
- Generic video search links
- Manual video selection
- No transcript analysis
- Generic study notes

**After (With API Key)**:
- ✅ Real, relevant videos
- ✅ Automatic quality selection
- ✅ Transcript-based summaries
- ✅ Content-specific study notes
- ✅ Video duration & stats
- ✅ Verified educational content

## 📝 Quick Setup Summary

```bash
# 1. Get API key from Google Cloud Console
https://console.cloud.google.com/

# 2. Enable YouTube Data API v3

# 3. Copy your API key

# 4. Add to .env file
echo "YOUTUBE_API_KEY=YOUR_KEY_HERE" >> backend/.env

# 5. Restart server
cd backend && npm start

# 6. Test in Video Enhancement tab
✅ Real videos with transcripts!
```

---

**Cost**: FREE (10,000 units/day)  
**Time to Setup**: 5-10 minutes  
**Benefit**: Real YouTube data + Transcript analysis  
**Alternative**: Works without key (fallback mode)  

🚀 **Get your free API key now for the best experience!**
