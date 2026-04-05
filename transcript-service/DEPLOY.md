# Transcript Service Railway Deployment

## 1. Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

---

## 2. Deploy to Railway

```bash
cd transcript-service
railway init
railway up
```

Railway will detect the `Dockerfile` and build automatically.

---

## 3. Set Environment Variables in Railway

Go to **Railway Dashboard → your service → Variables** and add:

| Variable             | Value                          |
| -------------------- | ------------------------------ |
| `GROQ_API_KEY`       | `gsk_...` (same as .env.local) |
| `ASSEMBLYAI_API_KEY` | your AssemblyAI key (optional) |

---

## 4. Get the Public URL

Railway gives you a URL like:

```
https://your-service.up.railway.app
```

Copy it.

---

## 5. Add it to Vercel

In **Vercel → Project → Settings → Environment Variables**, add:

```
TRANSCRIPT_SERVICE_URL = https://your-service.up.railway.app
```

Then redeploy Vercel (or it picks it up on next push).

---

## 6. Verify it's live

```
https://your-service.up.railway.app/health
```

Should return `{"status":"ok"}`.

---

## Local Dev (quick reference)

```bash
cd transcript-service
python -m uvicorn main:app --reload --port 8000
```

Health check: `http://localhost:8000/health`
