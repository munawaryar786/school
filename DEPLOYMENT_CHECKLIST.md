# ✅ Deployment Checklist

**Project**: School ERP Management System  
**Status**: Ready for Deployment  
**Date Started**: _____________  
**Target Launch Date**: _____________  

---

## 📌 Phase 1: Database Setup

### Railway Setup (Easiest)
- [ ] Create Railway account (railway.app)
- [ ] Create new project
- [ ] Add PostgreSQL database
- [ ] Deploy
- [ ] Copy CONNECTION_STRING
- [ ] Test connection locally
  ```bash
  psql postgresql://user:pass@host:port/db
  ```

### OR AWS RDS Setup
- [ ] Create AWS account
- [ ] Go to RDS console
- [ ] Create PostgreSQL database (db.t3.micro)
- [ ] Configure security group (allow 0.0.0.0/0)
- [ ] Get endpoint
- [ ] Test connection
  ```bash
  psql postgresql://postgres:pass@endpoint:5432/school_db
  ```

### OR Supabase Setup
- [ ] Create Supabase account
- [ ] Create new project
- [ ] PostgreSQL auto-configured
- [ ] Copy connection string
- [ ] Test connection

### Database Initialization
- [ ] Set DATABASE_URL in local .env
  ```bash
  export DATABASE_URL="postgresql://user:pass@host:port/db"
  ```
- [ ] Run migrations
  ```bash
  npm run prisma:migrate
  ```
- [ ] Seed demo data
  ```bash
  npm run prisma:seed
  ```
- [ ] Verify data in Prisma Studio
  ```bash
  npx prisma studio
  # Check at http://localhost:5555
  ```
- [ ] Backup connection string (save securely)
- [ ] Setup automatic backups (if available)

---

## 🌐 Phase 2: Web App Deployment (Vercel)

### Vercel Setup
- [ ] Create Vercel account (vercel.com)
- [ ] Connect GitHub account
- [ ] Import repository (munawaryar786/school)

### Web App Project
- [ ] Click "Add New" → "Project"
- [ ] Select repository
- [ ] Configure:
  - [ ] Framework: **Next.js**
  - [ ] Root Directory: **./apps/web**
  - [ ] Build Command: **npm run build**
  - [ ] Output Directory: **.next**

### Environment Variables (Web)
- [ ] Add variables in Vercel:
  ```
  NEXT_PUBLIC_API_URL = https://api.yourdomain.com
  NEXT_PUBLIC_APP_URL = https://yourdomain.com
  DATABASE_URL = postgresql://...
  ```

### Deployment
- [ ] Click "Deploy"
- [ ] Wait for build completion
- [ ] Copy URL: _______________
- [ ] Test website loads
  ```bash
  curl https://yourdomain.vercel.app
  ```
- [ ] Verify responsive design (mobile)
- [ ] Check all pages load
- [ ] Verify login page works

### Custom Domain (Optional)
- [ ] Buy domain (GoDaddy, Namecheap)
- [ ] Go to Vercel Project Settings → Domains
- [ ] Add custom domain
- [ ] Follow DNS configuration
- [ ] Wait for SSL certificate

---

## 🔌 Phase 3: API Deployment (Vercel)

### API Project Setup
- [ ] New project in Vercel
- [ ] Import repository again
- [ ] Configure:
  - [ ] Framework: **Node.js**
  - [ ] Root Directory: **./apps/api**
  - [ ] Build Command: **npm run build**
  - [ ] Start Command: **npm run start**

### Environment Variables (API)
- [ ] Add in Vercel:
  ```
  NODE_ENV = production
  DATABASE_URL = postgresql://...
  JWT_SECRET = [32+ random chars]
  JWT_EXPIRY = 7d
  REFRESH_TOKEN_EXPIRY = 30d
  CORS_ORIGIN = https://yourdomain.com,https://www.yourdomain.com
  LOG_LEVEL = info
  ```

### Deployment
- [ ] Click "Deploy"
- [ ] Wait for build (takes 2-3 min)
- [ ] Copy API URL: _______________
- [ ] Test health endpoint:
  ```bash
  curl https://api.yourdomain.vercel.app/health
  ```
- [ ] Test database connection:
  ```bash
  curl https://api.yourdomain.vercel.app/api/v1/health/db
  ```
- [ ] Verify no errors in logs

### Connect Web to API
- [ ] Update NEXT_PUBLIC_API_URL in Web env
- [ ] Redeploy web app
- [ ] Test login endpoint:
  ```bash
  curl -X POST https://api.yourdomain.com/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@school.com","password":"admin123"}'
  ```

---

## 📧 Phase 4: External Services

### Email Service (SendGrid)

- [ ] Create SendGrid account (sendgrid.com)
- [ ] Dashboard → Settings → API Keys
- [ ] Create new API key
- [ ] Copy key: _______________
- [ ] Add to Vercel (API):
  ```
  EMAIL_PROVIDER = sendgrid
  SENDGRID_API_KEY = SG.xxxxx
  ```
- [ ] Test email sending:
  ```bash
  curl -X POST https://api.sendgrid.com/v3/mail/send \
    -H "Authorization: Bearer SG.xxxxx" \
    -d '{...}'
  ```
- [ ] Verify sender email is verified

### SMS Service (Twilio)

- [ ] Create Twilio account (twilio.com)
- [ ] Buy phone number
- [ ] Get credentials from dashboard
- [ ] Add to Vercel (API):
  ```
  SMS_PROVIDER = twilio
  TWILIO_ACCOUNT_SID = ACxxxxx
  TWILIO_AUTH_TOKEN = xxxxx
  TWILIO_PHONE_NUMBER = +1234567890
  ```
- [ ] Test SMS sending

### File Storage (AWS S3)

- [ ] Create AWS account (aws.amazon.com)
- [ ] Create S3 bucket: **school-erp-files**
- [ ] Create IAM user: **school-erp-app**
- [ ] Attach S3 permissions
- [ ] Get access keys
- [ ] Add to Vercel (API):
  ```
  S3_BUCKET = school-erp-files
  S3_REGION = us-east-1
  S3_ACCESS_KEY = AKIA...
  S3_SECRET_KEY = wJal...
  ```
- [ ] Test file upload
- [ ] Configure bucket CORS (if needed)

### Payment Processing (Stripe)

- [ ] Create Stripe account (stripe.com)
- [ ] Get API keys from Dashboard
- [ ] Add to Vercel (API):
  ```
  STRIPE_PUBLISHABLE_KEY = pk_live_xxxxx
  STRIPE_SECRET_KEY = sk_live_xxxxx
  ```
- [ ] Add to Vercel (Web):
  ```
  NEXT_PUBLIC_STRIPE_KEY = pk_live_xxxxx
  ```
- [ ] Configure webhooks:
  - Endpoint: `https://api.yourdomain.com/webhooks/stripe`
  - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Test payment flow
- [ ] Enable webhook signing

### Error Monitoring (Sentry)

- [ ] Create Sentry account (sentry.io)
- [ ] Create new organization
- [ ] Create project (Node.js)
- [ ] Copy DSN: _______________
- [ ] Add to Vercel (API):
  ```
  SENTRY_DSN = https://xxxxx@sentry.io/xxxxxx
  ```
- [ ] Redeploy API
- [ ] Trigger test error to verify
- [ ] Setup alerts

### Analytics (Google Analytics)

- [ ] Create Google Analytics account
- [ ] Create property
- [ ] Get Measurement ID: **G-XXXXXXXXXX**
- [ ] Add to Vercel (Web):
  ```
  NEXT_PUBLIC_GA_ID = G-XXXXXXXXXX
  ```
- [ ] Redeploy web app
- [ ] Verify events are tracked

---

## 🧪 Phase 5: Testing & Verification

### Basic Functionality
- [ ] User registration works
- [ ] Login with correct password works
- [ ] Login with wrong password fails
- [ ] JWT tokens are issued
- [ ] Token refresh works
- [ ] Logout works
- [ ] Session persists across page reload
- [ ] Role-based UI changes (admin vs student)

### API Endpoints
- [ ] GET /health returns 200
- [ ] GET /api/v1/health/db returns 200
- [ ] POST /api/v1/auth/login returns token
- [ ] GET /api/v1/users (authenticated) works
- [ ] POST /api/v1/users (admin) works
- [ ] Unauthorized requests return 401/403

### Database
- [ ] Users table has demo data
- [ ] Schools table has demo data
- [ ] Queries are fast (< 100ms)
- [ ] Indexes are working
- [ ] No N+1 queries in logs

### Security
- [ ] HTTPS is enabled
- [ ] CORS is properly restricted
- [ ] JWT tokens expire correctly
- [ ] Passwords are hashed
- [ ] XSS protection enabled
- [ ] SQL injection not possible
- [ ] Rate limiting works

### Performance
- [ ] Web app loads in < 3s
- [ ] API responds in < 200ms
- [ ] CSS is minified
- [ ] JS is minified
- [ ] Images are optimized
- [ ] CDN is serving static files

### File Uploads
- [ ] Can upload files to S3
- [ ] Files are accessible
- [ ] File size limits enforced
- [ ] File type validation works
- [ ] Virus scanning enabled (if applicable)

### Email
- [ ] Transactional emails send
- [ ] Email templates render correctly
- [ ] No errors in SendGrid dashboard
- [ ] SPF/DKIM records configured

### Payments
- [ ] Stripe test payments work
- [ ] Webhooks are received
- [ ] Payment status updates DB
- [ ] Invoices are generated

---

## 🔒 Phase 6: Security Hardening

### Access Control
- [ ] JWT_SECRET is strong (32+ chars)
- [ ] All passwords are strong (16+ chars)
- [ ] Password rotation policy set
- [ ] 2FA enabled for admin accounts
- [ ] GitHub repo is private or restricted
- [ ] Vercel projects have access controls

### Data Protection
- [ ] Database backups are automated
- [ ] Backups are encrypted
- [ ] Restore procedure tested
- [ ] Database encryption enabled
- [ ] SSL certificate valid
- [ ] HTTPS enforced

### Secrets Management
- [ ] No .env files in Git
- [ ] All secrets in Vercel only
- [ ] Secrets rotated regularly
- [ ] Access logs reviewed
- [ ] Unused API keys removed

### Monitoring
- [ ] Error logs reviewed daily
- [ ] Performance metrics tracked
- [ ] Database size monitored
- [ ] API rate limits checked
- [ ] Security headers verified

---

## 📊 Phase 7: Monitoring & Logging

### Application Monitoring
- [ ] Sentry dashboard configured
- [ ] Alert rules set
- [ ] Error rate < 1%
- [ ] Response time tracked
- [ ] Database query time monitored

### Logging
- [ ] API logs are captured
- [ ] Database logs are captured
- [ ] Error logs include stack traces
- [ ] Logs are searchable
- [ ] Log retention policy set

### Alerts
- [ ] Email alerts configured
- [ ] High error rate alert (> 5%)
- [ ] High response time alert (> 500ms)
- [ ] Database connection failure alert
- [ ] API down alert

### Dashboards
- [ ] Vercel deployment dashboard
- [ ] Sentry error dashboard
- [ ] Database monitoring dashboard
- [ ] Performance dashboard
- [ ] Uptime dashboard

---

## 📋 Phase 8: Post-Launch

### Day 1
- [ ] Website is accessible
- [ ] All features working
- [ ] No critical errors
- [ ] Performance acceptable
- [ ] Backups confirmed

### Week 1
- [ ] Monitor error logs
- [ ] Fix any bugs reported
- [ ] Optimize slow endpoints
- [ ] Review user feedback
- [ ] Document issues found

### Month 1
- [ ] Security audit completed
- [ ] Performance optimized
- [ ] Disaster recovery tested
- [ ] Compliance check done
- [ ] User training completed

### Ongoing
- [ ] Weekly security patches
- [ ] Monthly backups verified
- [ ] Quarterly penetration testing
- [ ] Annual security audit
- [ ] Continuous optimization

---

## 🎯 Final Verification

Before declaring launch complete:

### Development
- [ ] All code reviewed
- [ ] Tests passing (100%)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Code is documented

### Deployment
- [ ] Web app deployed to Vercel
- [ ] API deployed to Vercel
- [ ] Database connected
- [ ] All services responding
- [ ] Custom domain configured

### Services
- [ ] Email service working
- [ ] SMS service working
- [ ] File storage working
- [ ] Payment processing working
- [ ] Error monitoring working

### Security
- [ ] HTTPS enforced
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Audit logging enabled
- [ ] Backups automated

### Performance
- [ ] Web load time < 3s
- [ ] API response time < 200ms
- [ ] Database query time < 100ms
- [ ] Error rate < 1%
- [ ] Uptime > 99%

### Documentation
- [ ] README complete
- [ ] Deployment guide complete
- [ ] API documentation done
- [ ] Database schema documented
- [ ] Troubleshooting guide created

---

## 📝 Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | _________________ | _____ | ________ |
| QA Lead | _________________ | _____ | ________ |
| Product Owner | _________________ | _____ | ________ |
| DevOps Engineer | _________________ | _____ | ________ |

---

## 🚀 Launch Decision

**Status**: ☐ Approved for Production ☐ Hold for Issues

**Go/No-Go**: _______________

**Decision Made By**: _______________

**Date**: _______________

**Notes**: 
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 📞 Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Project Lead | | | |
| DevOps | | | |
| Database Admin | | | |
| Security | | | |

---

## 📊 Summary

- **Total Checklist Items**: 200+
- **Completed**: _____ / _____
- **Completion %**: ____%
- **Critical Issues**: _____
- **Warning Issues**: _____

---

**🎉 When all items are checked, your project is ready to launch!**

Good luck! 🚀

