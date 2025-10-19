# Production Deployment Checklist

## ✅ Completed Configuration Changes

### Database Migration
- [x] Changed from local MongoDB to MongoDB Atlas
- [x] Updated connection URI to cloud database
- [x] Removed deprecated Mongoose options
- [x] Added environment variable validation

### Network Configuration
- [x] Removed all hardcoded IP addresses (192.168.29.44)
- [x] Changed server to listen on 0.0.0.0
- [x] Updated CORS to support wildcard or multiple origins
- [x] Configured for Vercel serverless deployment

### Security Enhancements
- [x] Added security headers (XSS, CSRF, Content-Type)
- [x] Implemented request size limits (10mb)
- [x] Environment variable validation on startup
- [x] JWT secret validation
- [x] Proper error handling without exposing internals
- [x] Production logging (reduced verbose logs)

### Deployment Preparation
- [x] Created vercel.json for both frontend and backend
- [x] Created .env.example files
- [x] Updated .gitignore to exclude .env and .vercel
- [x] Added comprehensive deployment documentation
- [x] Frontend build tested successfully

## 🔧 Before Deploying

### MongoDB Atlas Setup
- [ ] Ensure MongoDB Atlas cluster is running
- [ ] Add IP whitelist: 0.0.0.0/0 (allow from anywhere)
- [ ] Test connection from your local machine
- [ ] Verify database name matches URI

### Environment Variables Preparation

#### Backend Variables (Required)
- [ ] MONGODB_URI (your Atlas connection string)
- [ ] JWT_SECRET (strong random string, at least 32 characters)
- [ ] NODE_ENV (set to "production")
- [ ] CORS_ORIGIN (set to "*" initially, then restrict to frontend URL)
- [ ] ADMIN_USERNAME (default: "admin")
- [ ] ADMIN_PASSWORD (hashed password from credentials.js)

#### Frontend Variables (Required)
- [ ] VITE_API_URL (backend URL + /api)
- [ ] VITE_SOCKET_URL (backend URL)

## 📝 Deployment Steps

### 1. Deploy Backend First
```bash
cd backend
vercel
```

- [ ] Deploy backend to Vercel
- [ ] Add all environment variables in Vercel Dashboard
- [ ] Test backend health endpoint: `https://your-backend.vercel.app/api/health`
- [ ] Note the backend URL

### 2. Deploy Frontend
```bash
cd ..
vercel
```

- [ ] Update frontend .env with backend URL
- [ ] Deploy frontend to Vercel
- [ ] Add environment variables in Vercel Dashboard
- [ ] Test frontend loads correctly

### 3. Post-Deployment Configuration
- [ ] Update backend CORS_ORIGIN to frontend URL for security
- [ ] Test login functionality
- [ ] Test form creation
- [ ] Test feedback submission
- [ ] Test real-time updates (Socket.IO)
- [ ] Test Excel export

## ⚠️ Known Limitations & Considerations

### Socket.IO on Vercel
- Vercel serverless functions have 10-second timeout
- WebSocket connections may be unstable
- Consider alternative hosting for backend:
  - Railway (recommended for WebSockets)
  - Render
  - Heroku
  - Digital Ocean App Platform

### If Socket.IO Doesn't Work
Deploy backend to Railway instead:
1. Create Railway account
2. New Project → Deploy from GitHub
3. Add same environment variables
4. Update frontend VITE_SOCKET_URL to Railway URL

## 🔒 Security Recommendations

### Required Changes
- [ ] Change all default coordinator passwords in credentials.js
- [ ] Generate strong JWT_SECRET (use: `openssl rand -base64 32`)
- [ ] Update ADMIN_PASSWORD to your own hashed password
- [ ] Restrict CORS_ORIGIN to your frontend domain only

### Optional but Recommended
- [ ] Implement rate limiting for API endpoints
- [ ] Add API key for admin operations
- [ ] Enable MongoDB Atlas backup
- [ ] Set up monitoring and alerts
- [ ] Add HTTPS enforcement
- [ ] Implement session management

## 🧪 Testing Checklist

### Authentication
- [ ] Admin login works
- [ ] Coordinator login works (multiple branches)
- [ ] BSH coordinator login works
- [ ] JWT token refresh works
- [ ] Logout clears session

### Admin Dashboard
- [ ] Can view all configurations
- [ ] Can create new configurations
- [ ] Can edit configurations
- [ ] Can delete configurations
- [ ] Can view feedback summary
- [ ] Can export to Excel
- [ ] Real-time updates work

### Coordinator Dashboard
- [ ] Can view only their branch
- [ ] Can create configurations
- [ ] Can edit their configurations
- [ ] Cannot see other branches
- [ ] Real-time updates work

### Student Feedback
- [ ] Can load form by title
- [ ] Theory questions display correctly
- [ ] Lab questions display correctly
- [ ] Can submit feedback
- [ ] Anonymous submission works
- [ ] Form validation works

### Real-time Features
- [ ] Config updates reflect immediately
- [ ] New feedback shows in dashboard
- [ ] Multiple users see updates
- [ ] Socket connection stable

## 📊 Monitoring

### What to Monitor
- Backend uptime and response time
- MongoDB Atlas connection status
- Socket.IO connection success rate
- API error rates
- Database query performance

### Recommended Tools
- Vercel Analytics (built-in)
- MongoDB Atlas Monitoring (built-in)
- Sentry for error tracking
- LogRocket for user sessions

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Check Network Access in MongoDB Atlas
- Verify URI is correct
- Check environment variable is set
- Test connection locally first

### CORS Errors
- Verify CORS_ORIGIN matches frontend URL
- Check protocol (http vs https)
- Ensure trailing slash consistency

### Socket.IO Not Connecting
- Check VITE_SOCKET_URL is correct
- Verify backend is deployed and running
- Check browser console for errors
- Consider moving backend to Railway

### API Returns 401 Unauthorized
- Check JWT_SECRET is set correctly
- Verify token is being sent in Authorization header
- Check token expiration (24h default)

### Frontend Build Fails
- Run `npm run typecheck` to find TypeScript errors
- Check all imports are correct
- Verify all environment variables referenced exist

## 📱 Performance Optimization

### Frontend
- [ ] Enable gzip compression (Vercel does this automatically)
- [ ] Optimize images (use WebP format)
- [ ] Lazy load routes
- [ ] Minimize bundle size

### Backend
- [ ] Add database indexes for frequent queries
- [ ] Implement response caching where appropriate
- [ ] Optimize MongoDB queries
- [ ] Add connection pooling

## ✨ Production Ready Confirmation

Your application is production-ready when:
- [x] All code changes committed
- [x] Environment variables documented
- [x] Security headers configured
- [x] Database migrated to cloud
- [x] No hardcoded IPs or secrets
- [x] Build process successful
- [ ] All deployment steps completed
- [ ] Testing checklist passed
- [ ] Monitoring configured
- [ ] Default passwords changed

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas logs
3. Check browser console
4. Verify all environment variables
5. Test backend health endpoint
6. Review DEPLOYMENT.md for detailed troubleshooting
