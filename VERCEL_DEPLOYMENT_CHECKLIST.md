# Vercel Deployment Preparation Checklist

This checklist guides you through preparing your Oakstratton application for deployment on Vercel.

## Pre-Deployment Setup

### 1. Repository & Code
- [x] Code is committed and pushed to GitHub
- [x] No sensitive data in `.env.local` (should be in `.gitignore`)
- [x] `.vercelignore` file created
- [x] `vercel.json` configuration file created

### 2. Database Preparation
- [ ] External PostgreSQL database set up (Railway, Neon, or Supabase)
- [ ] `DATABASE_URL` connection string obtained from database provider
- [ ] Database credentials tested locally
- [ ] Plan to initialize schema after first deployment

### 3. Environment Variables
- [ ] Generate JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Generate JWT_REFRESH_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Document all required environment variables
- [ ] Optional: Set up SMTP configuration
- [ ] Optional: Set up Stripe keys
- [ ] Optional: Set up Qwen AI API key

## Vercel Project Setup

### 4. Create Vercel Project
- [ ] Sign up/in at [vercel.com](https://vercel.com)
- [ ] Connect GitHub account
- [ ] Import the repository
- [ ] Vercel detects project type and settings

### 5. Configure Environment Variables in Vercel
- [ ] Set `DATABASE_URL` (from external database provider)
- [ ] Set `JWT_SECRET`
- [ ] Set `JWT_REFRESH_SECRET`
- [ ] Set `NODE_ENV=production`
- [ ] Set `VITE_API_URL=https://your-domain.vercel.app`
- [ ] Set `API_URL=https://your-domain.vercel.app`
- [ ] Set `CORS_ORIGIN=https://your-domain.vercel.app`
- [ ] Optional: Set SMTP variables if using email
- [ ] Optional: Set Stripe keys if using payments
- [ ] Optional: Set other service API keys as needed

## Testing & Verification

### 6. Local Testing Before Deployment
```bash
# Test build
npm run build

# Test start command
npm start

# Verify no errors
# Should see "Server running on port 3000"
```

- [ ] Build completes without errors
- [ ] Server starts successfully
- [ ] Frontend builds to `dist/` folder
- [ ] No missing dependencies
- [ ] No TypeScript errors

### 7. Environment Variable Testing
- [ ] Create `.env.local` with test values
- [ ] Run `npm run build` — should work without DATABASE_URL
- [ ] Run `npm start` — should work with DATABASE_URL
- [ ] Verify API endpoints respond
- [ ] Verify frontend loads

## Post-Deployment

### 8. First Deployment
- [ ] Push changes to GitHub
- [ ] Vercel automatically detects and builds
- [ ] Monitor build logs for errors
- [ ] Check deployment is "Ready"
- [ ] Visit deployed URL

### 9. Database Initialization
- [ ] Get DATABASE_URL from Vercel environment variables
- [ ] Initialize database schema:
  ```bash
  psql $DATABASE_URL < database/schema.sql
  ```
- [ ] Verify schema created:
  ```bash
  psql $DATABASE_URL -c "\dt"
  ```
- [ ] Seed default admin user if needed

### 10. Verification Tests
- [ ] Visit landing page: `https://your-domain.vercel.app`
- [ ] Landing page loads without errors
- [ ] Check admin login page: `https://your-domain.vercel.app/admin/login`
- [ ] Test API health check:
  ```bash
  curl https://your-domain.vercel.app/api/health
  ```
- [ ] Log in with test credentials
- [ ] Verify dashboard pages load
- [ ] Check browser console for errors

### 11. Performance & Security
- [ ] Check Vercel Analytics
- [ ] Verify SSL certificate is active (Vercel provides free SSL)
- [ ] Review security headers in response
- [ ] Test CORS by making requests from frontend
- [ ] Monitor logs for any errors

## Configuration Files Created

The following files have been created to support Vercel deployment:

### `vercel.json`
- Specifies build and start commands
- Documents all environment variables
- Configures rewrites for API routes

### `.vercelignore`
- Excludes unnecessary files from deployment
- Reduces build size and deployment time

### `VERCEL_DEPLOYMENT.md`
- Comprehensive deployment guide
- Step-by-step instructions
- Troubleshooting section
- Database provider comparisons

## Database Provider Options

Choose one of these for your PostgreSQL database:

### Railway (Recommended)
- **Setup**: [railway.app](https://railway.app)
- **Pros**: Simple, can add other services, free tier
- **Cons**: Monthly subscription after trial
- **Connection**: Easy integration with Vercel

### Neon
- **Setup**: [console.neon.tech](https://console.neon.tech)
- **Pros**: Generous free tier, auto-scaling
- **Cons**: Connection pooling may be limited on free tier
- **Connection**: Full PostgreSQL compatibility

### Supabase
- **Setup**: [app.supabase.com](https://app.supabase.com)
- **Pros**: Built-in auth, real-time features, free tier
- **Cons**: May be overkill if you don't need extra features
- **Connection**: Full PostgreSQL compatibility

## Quick Reference

### Environment Variables Needed
```
DATABASE_URL=postgresql://...
JWT_SECRET=<32+ char random string>
JWT_REFRESH_SECRET=<32+ char random string>
NODE_ENV=production
VITE_API_URL=https://your-domain.vercel.app
API_URL=https://your-domain.vercel.app
CORS_ORIGIN=https://your-domain.vercel.app
```

### Useful Commands
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test local build
npm run build && npm start

# Initialize database
psql $DATABASE_URL < database/schema.sql

# Verify database
psql $DATABASE_URL -c "\dt"
```

### Key URLs
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Your Deployed App**: https://your-domain.vercel.app
- **Admin Panel**: https://your-domain.vercel.app/admin
- **API Endpoint**: https://your-domain.vercel.app/api

## Troubleshooting Quick Links

If you encounter issues, refer to these sections in [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md):
- Build fails with "module not found"
- DATABASE_URL error
- Build succeeds but site won't load
- CORS errors
- Database connection timeout
- Static files not serving

## Common Issues & Solutions

### Issue: "Module not found" during build
**Solution**: Run `npm install` and ensure all dependencies are in `package.json`

### Issue: Environment variables not working
**Solution**: 
1. Verify variables are set in Vercel project settings
2. Trigger a new deployment after changing vars
3. Check that `process.env.VAR_NAME` syntax is used

### Issue: Database connection fails
**Solution**:
1. Verify DATABASE_URL connection string
2. Ensure database is online and accessible
3. Check firewall allows Vercel IP addresses
4. Test connection locally first

### Issue: Frontend loads but API calls fail
**Solution**:
1. Check VITE_API_URL matches your domain
2. Verify CORS_ORIGIN is set correctly
3. Check API endpoint exists and responds
4. View function logs in Vercel dashboard

## Next Steps After Deployment

1. **Set up monitoring**:
   - Enable Vercel Analytics
   - Set up error tracking (Sentry, etc.)
   - Configure database backups

2. **Create admin user**:
   - Access `/admin/login`
   - Create initial admin account with strong password

3. **Configure integrations**:
   - Set up SMTP for email (if using)
   - Configure Stripe webhook endpoints (if using)
   - Set up API integrations

4. **Monitor performance**:
   - Check Vercel Analytics dashboard
   - Monitor database query performance
   - Review error logs regularly

5. **Set up CI/CD**:
   - Configure automatic deployments on push
   - Set up preview deployments for PRs
   - Configure rollback procedures

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Express on Vercel**: https://vercel.com/docs/runtimes/nodejs
- **Database Providers**:
  - Railway: https://docs.railway.app
  - Neon: https://neon.tech/docs
  - Supabase: https://supabase.com/docs

- **Project Documentation**:
  - Main README: [README.md](./README.md)
  - Railway Guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
  - Vercel Guide: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

---

**Status**: ✅ Vercel deployment preparation completed
**Date**: July 3, 2026
**Version**: 1.0.0
