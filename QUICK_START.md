# 🔧 Quick Start Setup

یہاں سب کچھ step-by-step ہے:

---

## 1️⃣ GitHub Setup ✅ DONE

```bash
# Status: Project pushed to main branch
Repository: https://github.com/munawaryar786/school.git
```

---

## 2️⃣ Vercel Setup (Next: DO THIS)

### A. Deploy Web App (Frontend - Next.js)

```
1. Go to vercel.com → Dashboard
2. Click "Add New" → "Project"
3. Import: munawaryar786/school
4. Configure:
   - Framework: Next.js
   - Root Directory: ./apps/web
   - Environment: Production
5. Add Environment Variables:
   - NEXT_PUBLIC_API_URL = https://api-yourdomain.vercel.app
   - DATABASE_URL = [from Railway/RDS]
6. Deploy!
```

**Your Web URL will be**: `https://school.vercel.app` (or custom domain)

### B. Deploy API (Backend - Express.js)

```
1. Go to vercel.com → Dashboard
2. Click "Add New" → "Project"
3. Import: munawaryar786/school again
4. Configure:
   - Framework: Node.js
   - Root Directory: ./apps/api
   - Build Command: npm run build
   - Output Directory: dist
5. Add Environment Variables: (See DEPLOYMENT_GUIDE.md)
6. Deploy!
```

**Your API URL will be**: `https://api-school.vercel.app` (or custom domain)

---

## 3️⃣ Database Setup (CRITICAL)

### Option A: Railway (سب سے آسان)

```
1. https://railway.app
2. Dashboard → New Project
3. Add → Database → PostgreSQL
4. Configure:
   - Name: school_db
   - Username: postgres
   - Generate password
5. Click Deploy
6. Copy CONNECTION_STRING from Railway dashboard
7. This CONNECTION_STRING = DATABASE_URL
```

### Option B: AWS RDS

```
1. https://console.aws.amazon.com/rds
2. Create Database
3. Engine: PostgreSQL (15.x)
4. Instance: db.t3.micro (free)
5. Storage: 20GB (gp3)
6. Username: postgres
7. Password: [16+ random chars]
8. Public: Yes
9. Security Group: 0.0.0.0/0 (port 5432)
10. Create
11. Wait 5 mins for creation
12. Get endpoint from "Connectivity"
13. DATABASE_URL = postgresql://postgres:password@endpoint:5432/school_db
```

---

## 4️⃣ Database Migration

**After getting DATABASE_URL:**

```bash
# 1. In project root (e:\saas)
npm install

# 2. Set DATABASE_URL
$env:DATABASE_URL = "postgresql://user:pass@host:5432/db"

# 3. Generate Prisma
npm run prisma:generate

# 4. Run migrations
npm run prisma:migrate

# 5. Seed demo data
npm run prisma:seed

# 6. Verify
npx prisma studio  # Opens UI at http://localhost:5555
```

---

## 5️⃣ Environment Variables Configuration

### Create `.env.production` file in root:

```env
# === Web App ===
NEXT_PUBLIC_API_URL=https://api-school.vercel.app
NEXT_PUBLIC_APP_URL=https://school.vercel.app
DATABASE_URL=postgresql://user:pass@railway.app:5432/school_db

# === API Server ===
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@railway.app:5432/school_db
JWT_SECRET=your-random-32-character-secret-key-here-12345
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d
CORS_ORIGIN=https://school.vercel.app,https://www.school.vercel.app

# === Email (Choose one) ===
# SendGrid:
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# Or SMTP:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-password-from-google

# === File Storage (S3) ===
S3_BUCKET=school-erp-files
S3_REGION=us-east-1
S3_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# === Payment (Stripe) ===
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# === Monitoring (Sentry) ===
SENTRY_DSN=https://xxxxx@sentry.io/xxxxxx
LOG_LEVEL=info
```

---

## 6️⃣ Add to Vercel Environment

### For Web App (Vercel Dashboard):

```
Project: school
Settings → Environment Variables

Add:
- NEXT_PUBLIC_API_URL
- DATABASE_URL
```

### For API (Vercel Dashboard):

```
Project: school-api
Settings → Environment Variables

Add:
- NODE_ENV
- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRY
- REFRESH_TOKEN_EXPIRY
- CORS_ORIGIN
- [All email, S3, Stripe, Sentry keys]
```

---

## 7️⃣ Test Deployments

```bash
# After deployment, test:

# 1. Web App Health
curl https://school.vercel.app

# 2. API Health
curl https://api-school.vercel.app/health

# 3. Database Connection
curl https://api-school.vercel.app/api/v1/health/db

# 4. Login Test
curl -X POST https://api-school.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.com",
    "password": "admin123"
  }'
```

---

## 8️⃣ Post-Deployment Checklist

### ✅ Database
- [ ] PostgreSQL created
- [ ] Migrations applied
- [ ] Seed data loaded
- [ ] Can connect from Vercel API
- [ ] Backups configured

### ✅ API
- [ ] Deployed to Vercel
- [ ] Health endpoints working
- [ ] Database connected
- [ ] Email service working
- [ ] Error monitoring enabled

### ✅ Web App
- [ ] Deployed to Vercel
- [ ] Can access from browser
- [ ] Login page working
- [ ] API connection working
- [ ] Auth cookies set correctly

### ✅ Security
- [ ] HTTPS enabled
- [ ] JWT tokens working
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] No sensitive data in logs

### ✅ Monitoring
- [ ] Sentry receiving errors
- [ ] Database queries logging
- [ ] API response times tracked
- [ ] Alerts configured

---

## 9️⃣ Demo Credentials (After Seeding)

```
Super Admin:
- Email: admin@school.com
- Password: admin123
- Role: SUPER_ADMIN

School Admin:
- Email: schooladmin@school.com
- Password: password123
- Role: SCHOOL_ADMIN

Teacher:
- Email: teacher@school.com
- Password: password123
- Role: TEACHER

Student:
- Email: student@school.com
- Password: password123
- Role: STUDENT

Parent:
- Email: parent@school.com
- Password: password123
- Role: PARENT
```

---

## 🔟 Final Steps

1. **Custom Domain** (Optional)
   - Buy domain: GoDaddy, Namecheap, etc.
   - Vercel: Project Settings → Domains → Add custom domain
   - Point DNS to Vercel nameservers

2. **SSL Certificate**
   - Vercel auto-generates free SSL
   - HTTPS enabled automatically

3. **Email Setup**
   - SendGrid: Get API key from sendgrid.com
   - Gmail App Password: https://myaccount.google.com/apppasswords
   - AWS SES: Configure from AWS console

4. **S3 Setup**
   - AWS Console → S3
   - Create bucket: `school-erp-files`
   - Create IAM user with S3 access
   - Get Access Key & Secret Key

5. **Stripe Setup**
   - https://stripe.com
   - Create account
   - Get API keys from Dashboard
   - Add webhook endpoints

6. **Backup Strategy**
   - Railway: Automatic backups (7 days)
   - AWS RDS: Configure backup retention (30+ days)
   - PostgreSQL dumps: Daily automated exports

7. **Monitoring Setup**
   - Sentry: https://sentry.io
   - Create organization → project → get DSN
   - Add to environment variables

---

## ❌ Common Issues & Solutions

### Issue: `DATABASE_URL not found`
**Solution**: Add to Vercel environment variables, redeploy

### Issue: API can't connect to database
**Solution**: 
- Check IP whitelist (allow 0.0.0.0/0)
- Verify DATABASE_URL format
- Test locally first

### Issue: CORS errors in browser
**Solution**: 
- Update CORS_ORIGIN in API
- Redeploy API
- Clear browser cache

### Issue: JWT token expired
**Solution**: 
- Check JWT_EXPIRY setting
- Verify server time sync
- Check token in browser DevTools

### Issue: Files not uploading
**Solution**: 
- Verify S3 credentials
- Check S3 bucket permissions
- Verify bucket name matches

---

## 📞 Command Reference

```bash
# Local Development
npm run dev                    # Start both apps
npm run build                  # Build all apps
npm run test                   # Run tests
npm run typecheck              # Type checking

# Database
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate         # Run migrations
npm run prisma:seed            # Load demo data
npx prisma studio             # UI at localhost:5555

# Git
git add .
git commit -m "message"
git push origin main           # Pushes to Vercel auto

# Vercel CLI (Optional)
npm i -g vercel
vercel login
vercel --prod                  # Deploy to production
vercel env ls                  # List env variables
```

---

**✨ یہاں تمام کچھ ہے! اب شروع کریں۔**

