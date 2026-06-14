# 🚀 School ERP - Complete Deployment Guide

**Last Updated**: 2026-06-14  
**Status**: Production Ready

---

## 📋 Table of Contents
1. [Vercel Deployment](#vercel-deployment)
2. [Database Setup (PostgreSQL)](#database-setup)
3. [Environment Variables](#environment-variables)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Monitoring & Logging](#monitoring--logging)
6. [Final Checklist](#final-checklist)

---

## 🌐 Vercel Deployment

### Step 1: Connect GitHub to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Search and select: `munawaryar786/school`
5. Click **"Import"**

### Step 2: Configure Vercel Project

**For Frontend (Web App):**
```
Root Directory: ./apps/web
Framework: Next.js
```

**For API (Separate Deployment):**
```
Root Directory: ./apps/api
Environment: Node.js
Command: npm run build
Start Command: npm run start
```

### Step 3: Environment Variables in Vercel

#### Web App (.env):
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database (if needed for client-side queries)
DATABASE_URL=postgresql://user:password@db.host:5432/school_db
```

#### API Server (.env):
```env
# Database
DATABASE_URL=postgresql://user:password@db.host:5432/school_db

# JWT & Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Node Environment
NODE_ENV=production

# Email Service
EMAIL_PROVIDER=sendgrid  # or mailgun, smtp
EMAIL_API_KEY=your-email-provider-key
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=your-email@provider.com
SMTP_PASS=your-email-password

# File Storage (S3)
S3_BUCKET=school-erp-files
S3_REGION=us-east-1
S3_ACCESS_KEY=your-aws-access-key
S3_SECRET_KEY=your-aws-secret-key

# Payment Provider
PAYMENT_PROVIDER=stripe  # or razorpay
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_key

# SMS Provider
SMS_PROVIDER=twilio  # or vonage
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Error Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
LOG_LEVEL=info

# Redis
REDIS_URL=redis://user:password@redis.host:6379
```

---

## 🗄️ Database Setup (PostgreSQL)

### Option 1: Railway (Recommended)

1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"** → **"Database"** → **"PostgreSQL"**
3. Click **"Deploy"** (wait 2-3 minutes)
4. Copy DATABASE_URL from "PostgreSQL" plugin

### Option 2: AWS RDS

1. Go to [AWS RDS Console](https://console.aws.amazon.com/rds)
2. Click **"Create Database"**
3. Select PostgreSQL 15+
4. Configuration:
   ```
   DB Instance Class: db.t3.micro (free tier)
   Storage: 20 GB
   Public Accessibility: Yes
   Security Group: Allow 0.0.0.0/0:5432
   ```
5. Get endpoint from "Connectivity & security"
6. Connection string:
   ```
   postgresql://postgres:password@endpoint:5432/school_db
   ```

### Option 3: Local or Managed Hosting

If using local PostgreSQL:
```bash
# Create database
psql -U postgres
CREATE DATABASE school_db;
CREATE USER school_admin WITH PASSWORD 'secure_password';
ALTER ROLE school_admin WITH CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE school_db TO school_admin;
```

Connection string:
```
postgresql://school_admin:secure_password@localhost:5432/school_db
```

### Step 4: Run Database Migrations

After setting DATABASE_URL:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate -- --name initial

# Seed demo data
npm run prisma:seed
```

---

## 🔐 Environment Variables

### Create `.env.production` in root:

```bash
# Copy from your Vercel dashboard after deployment
# All variables from API section above
```

### Update `vercel.json` for monorepo:

Create file: `vercel.json`
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret",
    "CORS_ORIGIN": "@cors_origin"
  }
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run typecheck
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Web to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_WEB }}
          working-directory: ./apps/web

      - name: Deploy API to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_API }}
          working-directory: ./apps/api
```

---

## 📊 Monitoring & Logging

### Error Tracking (Sentry)

1. Go to [Sentry.io](https://sentry.io)
2. Create new project for Node.js
3. Add DSN to .env files

### Logs

- API logs: `/logs/api.log`
- Database queries: Enable in Prisma
- Frontend errors: Sentry automatically captures

### Health Check

```bash
# API health
curl https://api.yourdomain.com/health

# Database connection
curl https://api.yourdomain.com/api/v1/health/db
```

---

## ✅ Final Checklist

Before going to production:

### Database ✓
- [ ] PostgreSQL database created
- [ ] DATABASE_URL configured
- [ ] Migrations applied successfully
- [ ] Seed data loaded
- [ ] Backups configured (daily)
- [ ] Connection pooling enabled (Railway/RDS handles this)

### Authentication ✓
- [ ] JWT_SECRET is secure (32+ chars)
- [ ] REFRESH_TOKEN_EXPIRY set to 30d
- [ ] CORS_ORIGIN restricted to your domain
- [ ] SSL/TLS certificates installed
- [ ] HTTPS enforced

### Security ✓
- [ ] Helmet security headers enabled
- [ ] Rate limiting configured
- [ ] Input validation working
- [ ] SQL injection protection (Prisma ORM handles this)
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

### File Storage ✓
- [ ] S3 bucket created and configured
- [ ] IAM user with appropriate permissions
- [ ] File upload/download working
- [ ] Virus scanning enabled (optional)

### Email ✓
- [ ] Email provider configured (SendGrid/Mailgun)
- [ ] Transactional emails tested
- [ ] Bulk email service setup (for newsletters)
- [ ] Bounce/complaint handling

### Payment ✓
- [ ] Payment provider keys configured
- [ ] Webhook endpoints created
- [ ] Payment testing in sandbox completed
- [ ] Production keys added

### Monitoring ✓
- [ ] Sentry error tracking enabled
- [ ] Application performance monitoring (APM)
- [ ] Database query logging
- [ ] API response time monitoring
- [ ] Alert notifications configured

### Performance ✓
- [ ] Database indexes created
- [ ] API caching enabled (Redis)
- [ ] CDN configured for static files
- [ ] Image optimization enabled
- [ ] Bundle size < 200KB (gzipped)

### Deployment ✓
- [ ] GitHub Actions CI/CD working
- [ ] Automatic deployments on push
- [ ] Rollback procedure documented
- [ ] Production database backups automated
- [ ] Staging environment matches production

### Documentation ✓
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Database schema documented
- [ ] Environment variables documented
- [ ] Deployment procedures documented
- [ ] Emergency procedures documented

### Compliance ✓
- [ ] Privacy policy updated
- [ ] Terms of service created
- [ ] GDPR compliance checked
- [ ] Data retention policies set
- [ ] Audit logging enabled

---

## 🔗 Useful Commands

```bash
# Install dependencies
npm install

# Development mode (both apps)
npm run dev

# Build all apps
npm run build

# Run tests
npm run test

# Database operations
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Type checking
npm run typecheck

# View database UI
npx prisma studio
```

---

## 📞 Support URLs

| Component | URL |
|-----------|-----|
| Web App | `https://yourdomain.com` |
| API Base | `https://api.yourdomain.com/api/v1` |
| Health Check | `https://api.yourdomain.com/health` |
| Admin Dashboard | `https://yourdomain.com/admin` |
| Student Portal | `https://yourdomain.com/student` |
| Teacher Portal | `https://yourdomain.com/teacher` |

---

## 🎯 Next Steps

1. **Day 1**: Database setup + environment variables
2. **Day 2**: Deploy web app to Vercel
3. **Day 3**: Deploy API to Vercel
4. **Day 4**: Configure email, SMS, payment providers
5. **Day 5**: Run full system testing
6. **Day 6**: Configure monitoring and backups
7. **Day 7**: Production launch

---

## ⚠️ Important Notes

- Keep JWT_SECRET safe (never commit to GitHub)
- Use strong database passwords (20+ characters)
- Enable 2FA for all admin accounts
- Schedule daily backups
- Test disaster recovery monthly
- Monitor error logs daily for first month
- Have a rollback plan ready

