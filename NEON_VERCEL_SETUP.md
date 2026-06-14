# 🚀 Neon PostgreSQL + Vercel Deployment Guide

**Status**: ✅ Production Ready  
**Last Updated**: 2026-06-14  
**Platform**: Vercel + Neon  

---

## 📋 Quick Start (5 minutes)

### 1. Create Neon Database

```
1. Go to https://neon.tech (free tier available)
2. Sign up with GitHub/Google
3. Create new project
4. Choose PostgreSQL 15 (default)
5. Create database
6. Wait for deployment (30-60 seconds)
```

### 2. Get Connection String

```
Neon Dashboard → Project → Connection String

Format:
postgresql://user:password@ep-xxxxx.region.neon.tech:5432/database?sslmode=require

📌 NOTE: sslmode=require is automatically included!
```

### 3. Add to Vercel

```
Vercel Dashboard → Project (API) → Settings → Environment Variables

Add:
DATABASE_URL = postgresql://user:password@ep-xxxxx.region.neon.tech:5432/school_db?sslmode=require
```

### 4. Deploy

```
Vercel auto-detects DATABASE_URL and deploys!
```

---

## 🔧 Detailed Setup

### Step 1: Create Neon Account & Project

#### A. Sign Up
- Visit: https://neon.tech/
- Click "Sign Up"
- Choose: GitHub or Google
- Authorize
- Done!

#### B. Create Project
```
1. Dashboard → New Project
2. Project name: school-erp
3. Region: Choose closest to your users
4. PostgreSQL version: 15 (default)
5. Create Project
6. Wait for "Ready" status
```

#### C. Create Database
```
1. Project → Databases
2. Already has "neondb" by default
3. Or create new: neondb (recommended)
```

### Step 2: Get Connection String

**Three ways to get it:**

#### Option A: Quick Connect (Easiest)
```
1. Project Dashboard
2. Click "Connect"
3. Select: "Connection string"
4. Copy the string
5. Paste to Vercel
```

#### Option B: From Database Details
```
1. Project Dashboard → Databases
2. Click your database
3. Copy connection string
4. Paste to Vercel
```

#### Option C: Construct Manually
```
postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require

Example:
postgresql://neondb_owner:AbC123xyz@ep-cool-wave-12345.us-east-1.neon.tech:5432/neondb?sslmode=require
```

### Step 3: Verify Connection String

**Check the format:**
```
postgresql://                    # Protocol
  user:password@               # Credentials
  host.region.neon.tech:5432/  # Host & port
  database                     # Database name
  ?sslmode=require             # ✅ REQUIRED for Neon
```

⚠️ **Important**: `?sslmode=require` is mandatory for Neon!

### Step 4: Test Connection Locally (Optional)

```bash
# Using psql
psql "postgresql://user:password@host:5432/db?sslmode=require"

# Or using DBeaver:
1. New Database Connection
2. Connection type: PostgreSQL
3. Paste connection string
4. Click "Test Connection"
```

### Step 5: Configure in Vercel

#### For API Deployment

```
Vercel Dashboard
  ↓
Choose Project (school-api)
  ↓
Settings → Environment Variables
  ↓
Add:
  Name: DATABASE_URL
  Value: postgresql://user:password@host:5432/db?sslmode=require
  Environment: Production
  ↓
Save
  ↓
Redeploy
```

#### Environment Variables Needed

```
DATABASE_URL="postgresql://..."    # Neon connection string
JWT_ACCESS_SECRET="random-32-char" # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_REFRESH_SECRET="random-32-char"
```

### Step 6: Verify Deployment

```bash
# Test API health
curl https://api.yourdomain.com/health

# Test database connection
curl https://api.yourdomain.com/api/v1/health/db

# Expected response: ✅ 200 OK
```

---

## 🛡️ SSL/TLS with Neon

### Why `sslmode=require`?

```
┌──────────────────────────────────────┐
│ Neon requires SSL/TLS encryption    │
│ for all connections                  │
├──────────────────────────────────────┤
│ sslmode=require means:              │
│ - Use SSL if available (our case)   │
│ - Fail if SSL unavailable           │
│ - This is secure by default ✓       │
└──────────────────────────────────────┘
```

### Prisma Compatibility

✅ **Prisma works perfectly with Neon SSL:**

```typescript
// prisma/schema.prisma (no changes needed!)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Prisma automatically handles ?sslmode=require
}
```

No configuration needed! Prisma automatically:
- ✅ Parses `sslmode=require`
- ✅ Enables SSL connection
- ✅ Verifies certificates
- ✅ Secures all queries

---

## 📱 Local Development with Neon

### Option 1: Use Neon for Local Dev (Simplest)

```bash
# 1. Get Neon connection string
# 2. Set in local .env
DATABASE_URL="postgresql://user:pass@neon.tech/db?sslmode=require"

# 3. Generate Prisma
npm run prisma:generate

# 4. Run migrations
npm run prisma:migrate

# 5. Start development
npm run dev
```

**Advantages:**
- ✅ No local PostgreSQL needed
- ✅ Same database as production
- ✅ Sync changes with teammates
- ✅ Free tier available

**Disadvantages:**
- ❌ Network dependency
- ❌ Slower than local
- ❌ Uses internet bandwidth

### Option 2: Docker PostgreSQL + sslmode=disable (Fast)

For faster local development:

```bash
# 1. Start Docker
docker run \
  --name school-erp-postgres \
  -e POSTGRES_USER=school_erp \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=school_erp \
  -p 5432:5432 \
  -d \
  postgres:15

# 2. Set local .env (NO SSL needed locally)
DATABASE_URL="postgresql://school_erp:password@localhost:5432/school_erp"

# 3. Run setup
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

**Advantages:**
- ✅ Fast (local)
- ✅ No SSL overhead
- ✅ Full control

**Disadvantages:**
- ❌ Different from production (no SSL)
- ❌ Requires Docker

### Option 3: Railway + SSL (Balanced)

```bash
# 1. Create Railroad DB
# 2. Get connection string with ?sslmode=require
# 3. Use as development database
```

---

## 🔄 Connection String Reference

### Neon Connection String Parts

```
postgresql://
  ├── neondb_owner           # User
  ├── :AbC123xyz             # Password
  ├── @ep-cool-wave-12345    # Subdomain (unique per database)
  ├── .us-east-1             # Region (us-east-1, eu-west-1, etc.)
  ├── .neon.tech             # Domain (always neon.tech)
  ├── :5432/                 # Port (always 5432)
  ├── neondb                 # Database name
  └── ?sslmode=require       # 🔒 SSL requirement

Total format:
postgresql://user:password@host:port/database?sslmode=require
```

### Multiple Neon Databases

You can create multiple databases:

```
Production:
DATABASE_URL_PROD="postgresql://prod_user:pass@prod-host/prod_db?sslmode=require"

Staging:
DATABASE_URL_STAGING="postgresql://stage_user:pass@stage-host/stage_db?sslmode=require"

Development:
DATABASE_URL_DEV="postgresql://dev_user:pass@dev-host/dev_db?sslmode=require"
```

---

## 🚀 Deployment Checklist

### Before Deployment

- [ ] Create Neon account (neon.tech)
- [ ] Create project
- [ ] Create database
- [ ] Copy connection string
- [ ] Verify format includes `?sslmode=require`
- [ ] Test locally: `npm run prisma:generate`
- [ ] TypeScript compiles: `npm run typecheck`

### Vercel Setup

- [ ] Create Vercel project for API
- [ ] Add DATABASE_URL environment variable
- [ ] Add JWT_ACCESS_SECRET
- [ ] Add JWT_REFRESH_SECRET
- [ ] Configure production environment
- [ ] Enable auto-deployment from GitHub

### After Deployment

- [ ] Visit health endpoint: `/health` → 200 OK
- [ ] Test DB connection: `/api/v1/health/db` → 200 OK
- [ ] Test login endpoint with seed data
- [ ] Monitor logs for errors
- [ ] Check Neon dashboard for connections

---

## 🔐 Security Best Practices

### ✅ DO

```
✅ Store DATABASE_URL in Vercel environment variables only
✅ Use strong passwords (Neon generates them)
✅ Enable 2FA on Neon account
✅ Keep connection string secret
✅ Rotate credentials monthly
✅ Use different credentials for dev/staging/prod
✅ Monitor connection logs in Neon dashboard
✅ Set appropriate Neon project permissions
```

### ❌ DON'T

```
❌ Commit .env files to Git
❌ Share connection strings via email/chat
❌ Use same password for dev/prod
❌ Enable public access to Neon project
❌ Log connection strings
❌ Use Neon admin credentials in apps
❌ Leave old credentials active
```

---

## 📊 Neon + Vercel Performance

### Connection Pooling

Vercel + Neon automatically handles connection pooling:

```
Neon provides:
- PgBouncer for connection pooling
- Up to 100 simultaneous connections (free tier)
- Automatic connection cleanup
- No configuration needed ✓

Result:
- Fast query execution
- Lower latency
- Better resource usage
```

### Latency

**Expected response times:**

```
Neon (cloud) → Vercel (same region):
- Database connection: 5-10ms
- Query execution: 10-50ms
- Total API response: 50-200ms ✓ Acceptable

Neon (different region):
- Database connection: 20-50ms
- Query execution: 10-50ms
- Total API response: 100-300ms (still good)
```

**Optimization tips:**
- Choose Neon region closest to Vercel deployment
- Use indexed queries (Prisma helps)
- Avoid N+1 queries
- Cache frequently-accessed data

---

## 📞 Troubleshooting

### Issue: `FATAL: password authentication failed`

```
❌ Wrong credentials
✅ Solution:
1. Go to Neon dashboard
2. Click "Reset password"
3. Copy new connection string
4. Update DATABASE_URL in Vercel
5. Redeploy
```

### Issue: `SSL: CERTIFICATE_VERIFY_FAILED`

```
❌ sslmode not set correctly
✅ Solution:
1. Ensure connection string includes: ?sslmode=require
2. Check DATABASE_URL format
3. Redeploy to Vercel
```

### Issue: `connect ENOTFOUND ep-cool-wave-12345.us-east-1.neon.tech`

```
❌ Wrong hostname or network issue
✅ Solution:
1. Verify hostname in connection string
2. Check internet connection
3. Try: psql -c "SELECT version();" (if psql installed)
4. Check Neon dashboard for project status
```

### Issue: `Vercel build fails with DATABASE_URL not found`

```
❌ Environment variable not set
✅ Solution:
1. Vercel Dashboard → Settings → Environment Variables
2. Add DATABASE_URL with value
3. Save
4. Go to Deployments → Redeploy
5. Wait for build to complete
```

### Issue: `Connection timeout from Vercel`

```
❌ Vercel IP not whitelisted
✅ Solution (usually auto-handled):
1. Neon automatically allows Vercel IPs
2. If issue persists:
   a. Check Neon project settings
   b. Verify no IP restrictions
   c. Contact Neon support
```

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| Neon Docs | https://neon.tech/docs |
| Neon Console | https://console.neon.tech |
| Prisma Docs | https://www.prisma.io/docs |
| Vercel Docs | https://vercel.com/docs |
| PostgreSQL Docs | https://www.postgresql.org/docs |

---

## 📋 Environment Variables Template

### .env.production (Vercel)

```bash
# ==========================================
# DATABASE - REQUIRED (Neon)
# ==========================================
DATABASE_URL="postgresql://user:pass@ep-xxxxx.region.neon.tech:5432/db?sslmode=require"

# ==========================================
# AUTHENTICATION - REQUIRED
# ==========================================
JWT_ACCESS_SECRET="your-random-32-char-hex-string"
JWT_REFRESH_SECRET="your-another-32-char-hex-string"

# ==========================================
# OPTIONAL (Add as needed)
# ==========================================
# EMAIL, S3, STRIPE, SENTRY, etc...
```

### .env.local (Local Development)

```bash
# ==========================================
# LOCAL DATABASE
# ==========================================
# Option 1: Use Neon (same as production)
DATABASE_URL="postgresql://user:pass@ep-xxxxx.region.neon.tech:5432/db?sslmode=require"

# Option 2: Use Docker (faster)
DATABASE_URL="postgresql://school_erp:password@localhost:5432/school_erp"

# ==========================================
# AUTHENTICATION
# ==========================================
JWT_ACCESS_SECRET="replace-with-random-secret"
JWT_REFRESH_SECRET="replace-with-random-secret"
```

---

## ✅ Verification

**Run these to verify everything:**

```bash
# 1. Install
npm install

# 2. Generate Prisma
npm run prisma:generate

# 3. Type check
npm run typecheck

# 4. Validate schema
npx prisma validate

# 5. (Optional) Test migration locally
# npm run prisma:migrate -- --skip-generate
```

**Expected results:**
- ✅ npm install: Success
- ✅ prisma:generate: "Generated Prisma Client"
- ✅ typecheck: No errors
- ✅ prisma validate: "is valid 🚀"

---

## 🎉 Summary

| Step | Tool | Time | Cost |
|------|------|------|------|
| 1. Create Neon account | neon.tech | 5 min | Free |
| 2. Create database | Neon console | 2 min | Free |
| 3. Get connection string | Neon console | 1 min | - |
| 4. Add to Vercel | Vercel console | 3 min | - |
| 5. Deploy | Git push | 5 min | Free tier |
| **Total** | - | **16 min** | **Free** |

---

**Status**: ✅ **READY FOR PRODUCTION**

Your project is fully compatible with Neon + Vercel!

