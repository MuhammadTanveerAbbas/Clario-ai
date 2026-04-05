# YouTube Transcript Setup Guide

## The Problem

YouTube videos without captions were failing with "No transcript available" error.

## The Solution

Your `transcript-service` folder contains a Python FastAPI service that:

1. **Layer 1**: Tries to get official YouTube captions (like before)
2. **Layer 2**: If no captions, uses **yt-dlp + AssemblyAI** to transcribe the actual audio
3. **Layer 3**: Falls back to Node.js library if service is down

This means **ANY YouTube video with audio will work**, even without captions!

---

## Quick Setup (5 minutes)

### 1. Get AssemblyAI API Key (Free Tier)

1. Go to https://www.assemblyai.com/
2. Sign up (free tier: 5 hours/month)
3. Copy your API key

### 2. Deploy to Railway (Free)

```bash
cd transcript-service
railway login
railway init
railway up
```

### 3. Set Environment Variables in Railway

Go to Railway Dashboard → Your Service → Variables:

- `GROQ_API_KEY` = (your existing Groq key)
- `ASSEMBLYAI_API_KEY` = (your AssemblyAI key)

### 4. Get Your Service URL

Railway gives you a URL like: `https://transcript-service-production-xxxx.up.railway.app`

### 5. Add to Vercel

In Vercel → Settings → Environment Variables:

```
TRANSCRIPT_SERVICE_URL=https://transcript-service-production-xxxx.up.railway.app
```

Then redeploy Vercel.

### 6. Test It

```bash
curl https://your-service.up.railway.app/health
# Should return: {"status":"ok"}
```

---

## How It Works

### Without Service (Current - Captions Only)

```
User pastes YouTube URL
  ↓
Try to get captions
  ↓
❌ No captions? → Error
```

### With Service (New - Always Works)

```
User pastes YouTube URL
  ↓
Try Python service:
  1. Try captions
  2. No captions? → Download audio → Transcribe with AssemblyAI
  ↓
Service down? → Fallback to Node.js library (captions only)
  ↓
✅ Transcript ready
```

---

## Local Development

### Run the service locally:

```bash
cd transcript-service

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your keys to .env

# Run
python -m uvicorn main:app --reload --port 8000
```

### Test locally:

```bash
# Health check
curl http://localhost:8000/health

# Get transcript
curl -X POST http://localhost:8000/api/transcript \
  -H "Content-Type: application/json" \
  -d '{"url":"https://youtube.com/watch?v=VIDEO_ID"}'
```

### Use local service in Next.js:

Add to `.env.local`:

```
TRANSCRIPT_SERVICE_URL=http://localhost:8000
```

---

## Cost Breakdown

### AssemblyAI Free Tier

- 5 hours of audio per month
- Perfect for testing and small projects
- Upgrade to $0.00025/second ($0.015/minute) for production

### Railway Free Tier

- $5 credit per month
- Enough for small to medium traffic
- Upgrade to $5/month for more

### Total Cost for Small Project

- **Free** with free tiers
- **~$10-20/month** for moderate use

---

## Troubleshooting

### Service not responding?

1. Check Railway logs: `railway logs`
2. Verify environment variables are set
3. Check health endpoint: `https://your-service.up.railway.app/health`

### "No transcript available" still showing?

1. Make sure `TRANSCRIPT_SERVICE_URL` is set in Vercel
2. Redeploy Vercel after adding the variable
3. Check if service is running: `curl https://your-service.up.railway.app/health`

### AssemblyAI errors?

1. Verify API key is correct
2. Check free tier limits (5 hours/month)
3. Video might be too long (split into chunks if needed)

---

## What Changed in Code

### 1. `transcript-service/main.py`

- Added `/api/transcript` endpoint for simple transcript fetching
- Existing `/api/analyze` endpoint for full analysis

### 2. `src/app/api/youtube/route.ts`

- Now tries Python service first
- Falls back to Node.js library if service unavailable
- Better error messages

### 3. `src/lib/ai-fallback.ts`

- Added text chunking for large transcripts
- Changed default model to `llama-3.3-70b-versatile` (30K tokens)

---

## Next Steps

1. **Deploy the service** (5 min)
2. **Test with a video without captions** (1 min)
3. **Monitor usage** in AssemblyAI dashboard
4. **Upgrade if needed** when you hit limits

---

## Alternative: Skip Service (Captions Only)

If you don't want to deploy the service, the app will still work with:

- Videos that have captions enabled
- Manual text paste

Just don't set `TRANSCRIPT_SERVICE_URL` and it will use the fallback method.
