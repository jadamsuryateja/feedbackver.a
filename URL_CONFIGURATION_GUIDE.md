# URL Configuration Guide

## Understanding the Architecture

Your Student Feedback System consists of **TWO separate deployments**:

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR PROJECT                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │                  │              │                  │    │
│  │   FRONTEND       │◄────────────►│    BACKEND       │    │
│  │   (React)        │   API Calls  │   (Express)      │    │
│  │                  │   WebSocket  │                  │    │
│  └──────────────────┘              └──────────────────┘    │
│         │                                   │               │
│         │                                   │               │
│         ▼                                   ▼               │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │   Vercel         │              │    Vercel        │    │
│  │   Frontend       │              │    Backend       │    │
│  │   Deployment     │              │    Deployment    │    │
│  └──────────────────┘              └──────────────────┘    │
│                                             │               │
│                                             ▼               │
│                                    ┌──────────────────┐    │
│                                    │  MongoDB Atlas   │    │
│                                    │   (Database)     │    │
│                                    └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## What is BACKEND vs FRONTEND?

### BACKEND (Node.js + Express Server)
- **Location**: `./backend` folder
- **Purpose**: API server, database operations, authentication, Socket.IO server
- **Deployed to**: Vercel (separate deployment)
- **Example URL**: `https://student-feedback-backend.vercel.app`

### FRONTEND (React Web Application)
- **Location**: Root folder
- **Purpose**: User interface (what students and admins see)
- **Deployed to**: Vercel (separate deployment)
- **Example URL**: `https://student-feedback-app.vercel.app`

## Environment Variables Explained

### VITE_API_URL
**What it is**: The URL where your backend API is hosted

**Format**: `https://your-backend-url.vercel.app/api`

**Purpose**: Your frontend uses this to:
- Login users
- Create feedback forms
- Submit feedback
- Get feedback summaries
- Export to Excel

**Example**:
```env
VITE_API_URL=https://student-feedback-backend.vercel.app/api
```

### VITE_SOCKET_URL
**What it is**: The URL where your backend WebSocket server is hosted

**Format**: `https://your-backend-url.vercel.app`

**Purpose**: Your frontend uses this for real-time updates:
- When a new form is created, all dashboards update immediately
- When feedback is submitted, coordinators see it instantly
- Live notifications without refreshing the page

**Example**:
```env
VITE_SOCKET_URL=https://student-feedback-backend.vercel.app
```

## ⚠️ Common Mistake

**WRONG**: Setting VITE_API_URL or VITE_SOCKET_URL to your frontend URL
```env
# ❌ WRONG - This won't work!
VITE_API_URL=https://student-feedback-app.vercel.app/api
VITE_SOCKET_URL=https://student-feedback-app.vercel.app
```

**CORRECT**: Both should point to your backend URL
```env
# ✅ CORRECT
VITE_API_URL=https://student-feedback-backend.vercel.app/api
VITE_SOCKET_URL=https://student-feedback-backend.vercel.app
```

## Step-by-Step Deployment

### Step 1: Deploy Backend First

```bash
cd backend
vercel
```

After deployment, Vercel will give you a URL like:
```
https://student-feedback-backend-xyz123.vercel.app
```

**Save this URL!** You'll need it for the frontend.

### Step 2: Configure Frontend

Update your frontend `.env` file:

```env
VITE_API_URL=https://student-feedback-backend-xyz123.vercel.app/api
VITE_SOCKET_URL=https://student-feedback-backend-xyz123.vercel.app
```

### Step 3: Deploy Frontend

```bash
cd ..
vercel
```

Add the environment variables in Vercel Dashboard:
- Go to your project → Settings → Environment Variables
- Add `VITE_API_URL` with your backend URL + `/api`
- Add `VITE_SOCKET_URL` with your backend URL

### Step 4: Update Backend CORS

For security, update your backend's `CORS_ORIGIN` environment variable in Vercel:

```
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

## How to Find Your URLs

### Backend URL
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your backend project
3. Look for "Domains" section
4. Copy the URL (e.g., `https://my-backend.vercel.app`)

### Frontend URL
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your frontend project
3. Look for "Domains" section
4. Copy the URL (e.g., `https://my-app.vercel.app`)

## Testing Your Configuration

### 1. Test Backend Directly
Open your browser and go to:
```
https://your-backend-url.vercel.app/api/health
```

You should see:
```json
{"status": "Server is running"}
```

### 2. Test Frontend
Open your browser and go to:
```
https://your-frontend-url.vercel.app
```

You should see the login page.

### 3. Test Connection
1. Try to login
2. If login works, your frontend is correctly connected to backend
3. If you see network errors in browser console, check your URLs

## Local Development URLs

When running locally, use these URLs:

```env
# Frontend .env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Quick Reference

| Variable | Points To | Example | Used For |
|----------|-----------|---------|----------|
| VITE_API_URL | Backend + /api | https://backend.vercel.app/api | REST API calls |
| VITE_SOCKET_URL | Backend | https://backend.vercel.app | Real-time updates |
| CORS_ORIGIN (Backend) | Frontend | https://frontend.vercel.app | Security |
| MONGODB_URI (Backend) | Database | mongodb+srv://... | Data storage |

## Troubleshooting

### "Failed to fetch" error
- Check VITE_API_URL is correct
- Check backend is deployed and running
- Check browser console for exact error

### "Socket connection failed"
- Check VITE_SOCKET_URL is correct
- Verify it points to backend, not frontend
- Check backend deployment logs

### CORS errors
- Verify backend CORS_ORIGIN matches your frontend URL
- Make sure both use same protocol (https)

### Can't login
- Check backend health endpoint first
- Verify VITE_API_URL includes `/api` at the end
- Check backend environment variables are set

## Need Help?

1. Check browser console (F12) for error messages
2. Check Vercel deployment logs
3. Verify all environment variables are set correctly
4. Make sure MongoDB Atlas allows connections from 0.0.0.0/0
5. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
