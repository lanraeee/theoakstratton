# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the Oakstratton BNPL platform to Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring and Logs](#monitoring-and-logs)

## Prerequisites

Before deploying to Vercel, ensure you have:

- Node.js 18+ installed locally
- PostgreSQL 13+ (for local testing, or a remote database)
- Git and GitHub account
- Vercel account (free tier available)
- A GitHub repository with this codebase pushed
- A PostgreSQL database (Vercel doesn't provide managed databases; use external service like Railway, Neon, or Supabase)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd theoakstratton
npm install
```

### 2. Create Local Environment File

Create `.env.local` in the project root:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/oakstratton_dev

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# API
VITE_API_URL=http://localhost:5173
API_URL=http://localhost:3000

# SMTP (optional, but recommended for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe (optional)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Other
NODE_ENV=development
PORT=3000
```

### 3. Set Up Local PostgreSQL Database

```bash
# Create database
createdb oakstratton_dev

# Run migrations (import schema)
psql oakstratton_dev < database/schema.sql
```

### 4. Run Development Server

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5173 (Vite dev server)
- Backend API: http://localhost:3000

## Vercel Deployment

### Step 1: Prepare Your Repository

Ensure your code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Create Database

Since Vercel doesn't provide managed databases, you need to set up a PostgreSQL database with an external service:

**Option A: Railway PostgreSQL (Recommended)**
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL service
4. Copy the `DATABASE_URL` connection string

**Option B: Neon PostgreSQL**
1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project
3. Copy the connection string

**Option C: Supabase**
1. Go to [app.supabase.com](https://app.supabase.com)
2. Create a new project
3. Get the PostgreSQL connection string from project settings

### Step 3: Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Select your repository
5. Click "Import"

### Step 4: Configure Environment Variables

In Vercel project settings:

1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Add all required variables:

```env
# Database (from your external PostgreSQL service)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Configuration (IMPORTANT: Generate secure random strings)
JWT_SECRET=<generate-strong-random-string-min-32-chars>
JWT_REFRESH_SECRET=<generate-another-strong-random-string-min-32-chars>

# Node Environment
NODE_ENV=production

# API Configuration
VITE_API_URL=https://your-vercel-domain.vercel.app
API_URL=https://your-vercel-domain.vercel.app

# SMTP Configuration (Optional but recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email@gmail.com>
SMTP_PASS=<app-password>
ADMIN_EMAIL=<admin-email@example.com>

# Stripe Configuration (Optional)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Qwen AI (Optional)
QWEN_API_KEY=<your-qwen-api-key>

# Other
PORT=3000
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

**To generate secure random strings:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Deploy

Vercel automatically deploys when you push to GitHub:

1. Push your code to the main branch:
```bash
git push origin main
```

2. Vercel will automatically detect the deployment and build the project

Or manually trigger deployment from Vercel dashboard:
1. Go to your project
2. Click "Deployments"
3. Select the commit to deploy
4. Click "Redeploy"

### Step 6: Initialize Database Schema

After the first deployment, initialize the database schema:

```bash
# Option A: Using psql locally
DATABASE_URL="postgresql://user:password@host:port/database" psql < database/schema.sql

# Option B: Using Railway/Neon/Supabase CLI
# Follow your database provider's instructions
```

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for signing JWT tokens | Random 32+ character string |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Random 32+ character string |
| `NODE_ENV` | Node environment | `production` |
| `VITE_API_URL` | Frontend API endpoint | `https://your-domain.vercel.app` |
| `API_URL` | Backend API endpoint | `https://your-domain.vercel.app` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | Email server host | Disabled |
| `SMTP_PORT` | Email server port | 587 |
| `SMTP_USER` | Email account username | Disabled |
| `SMTP_PASS` | Email account password | Disabled |
| `STRIPE_SECRET_KEY` | Stripe API key | Disabled |
| `CORS_ORIGIN` | CORS allowed origins | `*` |
| `QWEN_API_KEY` | Qwen AI API key | Disabled |
| `SEED_DEMO_DATA` | Seed demo data on startup | `false` |

## Database Setup

### First-Time Database Initialization

When you first deploy to Vercel with a new PostgreSQL instance:

1. **Connect to your database provider**:
   - For Railway: Use their connection tab
   - For Neon: Use their SQL editor
   - For Supabase: Use their SQL editor

2. **Import the schema**:
   ```bash
   # Get your DATABASE_URL from Vercel environment variables
   psql $DATABASE_URL < database/schema.sql
   ```

3. **Verify schema is created**:
   ```bash
   psql $DATABASE_URL -c "\dt"
   ```

### Database Schema

The application uses these main tables:

- `admin_users` - Admin and manager accounts
- `email_templates` - Email templates with categories
- `leads` - Waitlist and contact form submissions
- `email_events` - Email delivery tracking
- `analytics_events` - User behavior analytics
- `alerts` - System and custom alerts
- `transactions` - Payment records (when using Stripe)
- `pricing_plans` - Subscription plans
- `landing_content` - Landing page content

See `database/schema.sql` for full schema definition.

## Post-Deployment Verification

### 1. Check Deployment Status

```bash
# In Vercel Dashboard
# Should see "Ready" status with green checkmark
```

### 2. Test Frontend Access

Visit your Vercel domain:
```
https://your-vercel-domain.vercel.app
```

You should see:
- Landing page loads correctly
- Admin login page accessible at `/admin/login`
- No console errors

### 3. Test Admin Authentication

1. Go to `https://your-vercel-domain.vercel.app/admin/login`
2. Use default credentials or create new account:
   - Email: `admin@oakstratton.com`
   - Password: `AdminPassword123!`
3. Verify dashboard loads with all pages accessible

### 4. Test API Endpoints

```bash
# Test health check
curl https://your-vercel-domain.vercel.app/api/health

# Test login endpoint
curl -X POST https://your-vercel-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@oakstratton.com","password":"AdminPassword123!"}'
```

### 5. Check Database Connection

Check Vercel function logs:
1. Go to Deployment → Functions
2. Look for successful database connection messages

## Troubleshooting

### Common Issues

#### 1. Build Fails with "module not found"

**Solution**: Ensure all dependencies are listed in `package.json`
```bash
# Verify locally
npm install
npm run build

# Check for missing dependencies
npm ls --all
```

#### 2. DATABASE_URL Error on Deployment

**Error**: `Error: Missing DATABASE_URL environment variable`

**Solution**: 
- Verify DATABASE_URL is set in Vercel environment variables
- Check that the connection string is valid
- Ensure the database provider is accessible from Vercel

#### 3. Build Succeeds but Site Won't Load

**Solution**: Check Vercel function logs
1. Go to Deployment → Runtime Logs
2. Look for errors during function execution
3. Verify all environment variables are set

#### 4. CORS Errors on Frontend

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**: Update environment variables:
```
VITE_API_URL=https://your-vercel-domain.vercel.app
API_URL=https://your-vercel-domain.vercel.app
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

#### 5. Database Connection Timeout

**Error**: `Error: connect ETIMEDOUT`

**Solutions**:
- Check database provider is online
- Verify connection string is correct
- Check firewall rules allow Vercel IP addresses
- Verify database credentials

#### 6. Static Files Not Serving

**Error**: 404 on CSS/JS files

**Solution**: 
- The `build` script should create a `dist/` folder
- Verify: `npm run build && ls -la dist/`
- Check `vite.config.ts` configuration

### Checking Logs

In Vercel Dashboard:
1. Go to Deployment
2. Click "Runtime Logs" tab
3. Select function to view logs
4. Look for errors (red text)

Common log patterns:
```
✓ PostgreSQL connection successful       → DB is working
Server running on port 3000              → Express started
POST /api/auth/login 200                 → Successful login
```

## Monitoring and Logs

### Viewing Deployment Logs

In Vercel Dashboard:

1. **Build Logs**: Shows npm install, build process
2. **Function Logs**: Shows runtime errors, API requests
3. **Trace**: Performance monitoring

### Analyzing Runtime Errors

1. Click on a failed deployment
2. Check "Runtime Logs" for error messages
3. Common patterns:
   - `DATABASE_URL is not defined` → Missing env var
   - `ENOENT` → Missing file (check build)
   - `ECONNREFUSED` → Database connection failed

### Setting Up Monitoring

Vercel provides built-in monitoring:
- Analytics: Traffic and performance
- Web Vitals: Core Web Vitals metrics
- Edge Network: Cache hit rates

### Custom Monitoring

Set up external monitoring for better visibility:
- **Sentry**: Error tracking
- **Datadog**: Full-stack monitoring
- **LogRocket**: Session replay and logging

## Comparison with Railway

| Feature | Vercel | Railway |
|---------|--------|---------|
| Ease of Setup | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Included Database | ✗ | ✓ PostgreSQL |
| Pricing | Pay-per-use | Monthly subscription |
| Best For | Frontend-focused apps | Full-stack apps |
| Serverless Support | ✓ | Limited |
| Environment Variables | Via Dashboard | Via Dashboard |
| Automatic Deployments | ✓ GitHub integration | ✓ GitHub integration |

## Production Checklist

Before going live:

- [ ] DATABASE_URL points to production database
- [ ] JWT_SECRET and JWT_REFRESH_SECRET are strong random strings
- [ ] NODE_ENV is set to `production`
- [ ] VITE_API_URL and API_URL match your domain
- [ ] CORS_ORIGIN matches your domain
- [ ] SMTP configuration is set up and tested
- [ ] Stripe keys are configured (if using payments)
- [ ] Database schema is initialized
- [ ] Admin user created with strong password
- [ ] SSL/TLS is enabled (Vercel provides free SSL)
- [ ] Logs are being monitored
- [ ] Database backups are configured

## Performance Optimization

### Frontend Optimization

Already configured with:
- Vite for fast builds
- Code splitting
- CSS modules
- Tree shaking

### Backend Optimization

- Database connection pooling (configured in pg pool)
- Rate limiting on auth endpoints
- Compression with gzip

### Database Optimization

- Proper indexing on frequently queried columns
- Connection pooling (max 5 connections)
- Regular maintenance and vacuuming

## Scaling Considerations

### Database Scaling

1. **Read Replicas**: Most PostgreSQL services support read replicas
2. **Connection Pooling**: Use PgBouncer for better connection management
3. **Query Optimization**: Monitor slow queries in logs

### Application Scaling

Vercel automatically scales based on traffic:
- Concurrent requests: Handled by Vercel serverless infrastructure
- Memory usage: Limited to function limits
- CPU usage: Limited to execution time

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment on Vercel](https://nextjs.org/docs/deployment/vercel)
- [Express on Vercel](https://vercel.com/docs/runtimes/nodejs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Railway PostgreSQL Service](https://docs.railway.app/databases/postgresql)
- [Neon PostgreSQL Hosting](https://neon.tech/docs)

## Support

For issues or questions:

1. Check logs in Vercel Dashboard
2. Review this guide's troubleshooting section
3. Check browser console for frontend errors
4. Contact database provider support if needed
5. Vercel support: https://vercel.com/support

## Migration from Railway to Vercel

If migrating from Railway:

1. **Export your database**:
   ```bash
   # From Railway
   pg_dump $DATABASE_URL > backup.sql
   
   # Import to new database
   psql $NEW_DATABASE_URL < backup.sql
   ```

2. **Update environment variables** in Vercel with new database URL

3. **Test thoroughly** before decommissioning Railway

4. **Monitor logs** after migration to catch issues early

---

**Last Updated**: July 2026
**Version**: 1.0.0
