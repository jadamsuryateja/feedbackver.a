# Deployment Guide for Vercel

This guide will help you deploy both the frontend and backend of your Student Feedback System to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional but recommended)
3. MongoDB Atlas account with the connection URI

## MongoDB Atlas Configuration

Your MongoDB Atlas URI is already configured:
```
mongodb+srv://jadam:surya123@feed.ynnkr8q.mongodb.net/?retryWrites=true&w=majority&appName=FEED
```

Make sure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0) since Vercel uses dynamic IPs.

### Update Network Access in MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to Network Access
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"

## Backend Deployment

### Step 1: Deploy Backend to Vercel

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Deploy using Vercel CLI:
   ```bash
   vercel
   ```

   Or push to GitHub and import the project in Vercel Dashboard.

### Step 2: Configure Backend Environment Variables

In your Vercel project dashboard for the backend, add these environment variables:

- `MONGODB_URI`: `mongodb+srv://jadam:surya123@feed.ynnkr8q.mongodb.net/?retryWrites=true&w=majority&appName=FEED`
- `JWT_SECRET`: `YourSuperSecretKey123!@#$%^&*()`
- `NODE_ENV`: `production`
- `CORS_ORIGIN`: `*` (or your frontend URL for better security)
- `ADMIN_USERNAME`: `admin`
- `ADMIN_PASSWORD`: `$2a$10$XQxwKfQeRm8Ipf9Zs9jWJ.fXt9aPlrdJ7eRnYCKa2c1/2Dg1nB1Ny`

### Step 3: Note Your Backend URL

After deployment, Vercel will give you a URL like:
```
https://your-backend.vercel.app
```

Save this URL for the frontend configuration.

## Frontend Deployment

### Step 1: Update Frontend Environment Variables

Update your `.env` file with your backend URL:

```env
VITE_API_URL=https://your-backend.vercel.app/api
VITE_SOCKET_URL=https://your-backend.vercel.app
```

### Step 2: Deploy Frontend to Vercel

1. Navigate to the project root:
   ```bash
   cd ..
   ```

2. Deploy using Vercel CLI:
   ```bash
   vercel
   ```

   Or push to GitHub and import the project in Vercel Dashboard.

### Step 3: Configure Frontend Environment Variables

In your Vercel project dashboard for the frontend, add:

- `VITE_API_URL`: `https://your-backend.vercel.app/api`
- `VITE_SOCKET_URL`: `https://your-backend.vercel.app`
- `VITE_SUPABASE_URL`: (your existing value)
- `VITE_SUPABASE_ANON_KEY`: (your existing value)

## Update Backend CORS After Frontend Deployment

Once your frontend is deployed, update the backend's `CORS_ORIGIN` environment variable in Vercel:

```
CORS_ORIGIN=https://your-frontend.vercel.app
```

This improves security by restricting API access to your frontend only.

## Testing Your Deployment

1. Visit your frontend URL: `https://your-frontend.vercel.app`
2. Try logging in with admin credentials
3. Test creating and submitting feedback
4. Verify real-time updates are working

## Troubleshooting

### MongoDB Connection Issues

- Ensure your IP whitelist in MongoDB Atlas includes `0.0.0.0/0`
- Verify your MongoDB URI is correct
- Check Vercel function logs for connection errors

### CORS Issues

- Make sure `CORS_ORIGIN` in backend environment variables matches your frontend URL
- For development, you can temporarily use `*`

### Socket.IO Connection Issues

- Socket.IO connections may have limitations on Vercel's serverless functions
- Consider using [Vercel's Edge Functions](https://vercel.com/docs/functions/edge-functions) or a dedicated WebSocket service

## Important Notes

1. **Serverless Limitations**: Vercel functions have a 10-second execution limit on Hobby plan
2. **Socket.IO**: Real-time features may need adjustment for serverless environment
3. **Database**: Always use MongoDB Atlas (cloud) for production, not local MongoDB
4. **Environment Variables**: Never commit `.env` files to Git

## Alternative: Deploy Backend Separately

If Socket.IO causes issues on Vercel, consider deploying the backend to:
- [Railway](https://railway.app/)
- [Render](https://render.com/)
- [Heroku](https://www.heroku.com/)

These platforms support long-running processes better suited for WebSocket connections.
