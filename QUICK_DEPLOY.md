# Quick Deployment Reference

## MongoDB Atlas URI
```
mongodb+srv://jadam:surya123@feed.ynnkr8q.mongodb.net/?retryWrites=true&w=majority&appName=FEED
```

## Key Changes Made

✅ Updated MongoDB connection from local (192.168.29.44) to MongoDB Atlas
✅ Removed all hardcoded IP addresses
✅ Changed server to listen on 0.0.0.0 instead of specific IP
✅ Updated CORS to support wildcard or multiple origins
✅ Created Vercel configuration files
✅ Added environment variable examples

## Quick Deploy Commands

### Backend
```bash
cd backend
vercel
```

### Frontend
```bash
cd ..
vercel
```

## Environment Variables to Set in Vercel

### Backend Environment Variables:
```
MONGODB_URI=mongodb+srv://jadam:surya123@feed.ynnkr8q.mongodb.net/?retryWrites=true&w=majority&appName=FEED
JWT_SECRET=YourSuperSecretKey123!@#$%^&*()
NODE_ENV=production
CORS_ORIGIN=*
ADMIN_USERNAME=admin
ADMIN_PASSWORD=$2a$10$XQxwKfQeRm8Ipf9Zs9jWJ.fXt9aPlrdJ7eRnYCKa2c1/2Dg1nB1Ny
```

### Frontend Environment Variables:
```
VITE_API_URL=https://your-backend.vercel.app/api
VITE_SOCKET_URL=https://your-backend.vercel.app
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw
```

## MongoDB Atlas Setup

**IMPORTANT**: Allow Vercel to connect to your database:

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

## Files Modified

- `backend/.env` - Updated MongoDB URI and removed IP addresses
- `backend/src/config/database.js` - Removed deprecated Mongoose options
- `backend/src/server.js` - Changed to listen on 0.0.0.0, removed HOST variable
- `backend/vercel.json` - Created for Vercel deployment
- `vercel.json` - Created for frontend SPA routing
- `.gitignore` - Added .env and .vercel to ignore list
- `.env` - Added VITE_API_URL and VITE_SOCKET_URL

## Post-Deployment

After deploying, update the backend's `CORS_ORIGIN` to your frontend URL for better security:
```
CORS_ORIGIN=https://your-frontend.vercel.app
```

## Notes

- All IP addresses (192.168.29.44) have been removed
- Server now accepts connections from any IP (0.0.0.0)
- CORS configured to accept all origins (can be restricted post-deployment)
- MongoDB uses Atlas cloud instead of local connection
