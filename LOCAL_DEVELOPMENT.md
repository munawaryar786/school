# 🚀 LOCAL DEVELOPMENT SETUP GUIDE

This guide explains how to set up the project for **local development** with PostgreSQL.

---

## Option 1: Using Neon PostgreSQL (Recommended - Free & Easy)

### 1. Create Neon Database

```bash
# Visit https://neon.tech
# 1. Sign up with GitHub
# 2. Create new project
# 3. Choose PostgreSQL 15 (default)
# 4. Wait for deployment (1 minute)
# 5. Database "neondb" is created automatically
# 6. Click "Connect" button
# 7. Copy the connection string
```

### 2. Connection String Format

**Neon always includes `?sslmode=require` automatically:**
```
postgresql://neondb_owner:password@ep-xxxxx.region.neon.tech:5432/neondb?sslmode=require
```

### 3. Configure Local Environment

```bash
# In your local .env file:
DATABASE_URL="postgresql://neondb_owner:password@ep-xxxxx.region.neon.tech:5432/neondb?sslmode=require"

# Paste the ENTIRE connection string from Neon dashboard
# Keep the ?sslmode=require part - it's required!
```

### 4. Run Database Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed demo data (optional)
npm run prisma:seed
```

### 5. Start Development

```bash
# Start both web and API
npm run dev

# OR start separately:
npm run dev --workspace @school-erp/api     # Terminal 1
npm run dev --workspace @school-erp/web     # Terminal 2

# Open browser:
# Web: http://localhost:3000
# API: http://localhost:4000
# Prisma Studio: npx prisma studio → localhost:5555
```

### 6. Verify Connection

```bash
# In Neon dashboard, check "Operations" tab
# You should see successful connections from your machine
```

**Advantages of Neon:**
- ✅ Free tier (10GB storage)
- ✅ No SSL setup needed (automatic)
- ✅ Same database as production (same SSL mode)
- ✅ Easy team access
- ✅ No local setup required

---

## Option 2: Using Railway (Also Good)

### 1. Create Railway Database

```bash
# Visit https://railway.app
# 1. Sign up with GitHub
# 2. Create new project
# 3. Add → Database → PostgreSQL
# 4. Wait for deployment (2-3 minutes)
# 5. Click on PostgreSQL plugin
# 6. Go to "Connect" tab
# 7. Copy the connection string (PostgreSQL)
```

### 2. Configure Local Environment

```bash
# In your local .env file:
DATABASE_URL="postgresql://user:password@db.railway.app:5432/railway"

# Replace the CONNECTION_STRING from Railway
```

### 3. Run Database Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed demo data (optional)
npm run prisma:seed
```

### 4. Start Development

```bash
# Start both web and API
npm run dev

# View database UI (optional)
npx prisma studio
```

---

## Option 3: Using Docker PostgreSQL (Local & Fast)

### 1. Install Docker

- Download: https://www.docker.com/products/docker-desktop
- Install and start Docker Desktop

### 2. Run PostgreSQL Container

```bash
# Start PostgreSQL in Docker
docker run \
  --name school-erp-postgres \
  -e POSTGRES_USER=school_erp \
  -e POSTGRES_PASSWORD=school_erp \
  -e POSTGRES_DB=school_erp \
  -p 5432:5432 \
  -d \
  postgres:15

# Verify it's running
docker ps
```

### 3. Configure Environment

```bash
# In your .env file:
DATABASE_URL="postgresql://school_erp:school_erp@localhost:5432/school_erp?schema=public"
```

### 4. Run Setup & Development

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### 5. Stop/Clean Up

```bash
# Stop container
docker stop school-erp-postgres

# Remove container
docker rm school-erp-postgres

# View logs
docker logs school-erp-postgres
```

---

## Option 4: Using Embedded PostgreSQL (Windows Only - Local Dev Only)

⚠️ **WARNING**: This is for **local Windows development only** and will NOT work on Vercel.

### 1. Enable Embedded PostgreSQL

```bash
# Install optional dependencies (Windows only)
npm install --save-dev @embedded-postgres/windows-x64 embedded-postgres

# Update the db:start script in package.json back to:
# "db:start": "tsx scripts/start-embedded-postgres.ts"
```

### 2. Start Embedded Database

```bash
# Start the embedded PostgreSQL server
npm run db:start

# In another terminal, run:
npm run prisma:migrate
npm run dev
```

### 3. Database Files

Embedded PostgreSQL stores data locally:
```
.data/postgres16/        # Local database files
```

**To reset:**
```bash
rm -r .data/postgres16
npm run db:start         # Creates fresh database
```

---

## Troubleshooting

### Issue: `connect ECONNREFUSED localhost:5432`

**Solution**: Database is not running

```bash
# Option 1: Start Railway database (see Option 1)
# Option 2: Start Docker container (see Option 2)
# Option 3: Start embedded PostgreSQL (Windows only, see Option 3)
```

### Issue: `password authentication failed for user "school_erp"`

**Solution**: Wrong credentials in DATABASE_URL

```bash
# Check your .env file has correct credentials:
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# For Railway: Copy from Railway dashboard
# For Docker: Use school_erp:school_erp from docker run command
```

### Issue: `ENOTFOUND db.railway.app`

**Solution**: No internet connection or wrong hostname

```bash
# Check connection:
ping db.railway.app

# Or test with psql:
psql postgresql://user:password@db.railway.app:5432/database
```

### Issue: Port 5432 already in use

**Solution**: Another PostgreSQL instance is running

```bash
# Find process on port 5432 (Linux/Mac):
lsof -i :5432

# Find process on port 5432 (Windows):
netstat -ano | findstr :5432

# Kill the process or use different port:
DATABASE_URL="postgresql://user:password@localhost:5433/database"
```

---

## Useful Commands

```bash
# Database setup
npm run prisma:generate         # Generate Prisma client
npm run prisma:migrate          # Run pending migrations
npm run prisma:seed             # Load demo data
npx prisma studio              # Open database UI (localhost:5555)

# Development
npm run dev                     # Start both apps
npm run typecheck               # Check TypeScript
npm run test                    # Run tests
npm run build                   # Build all apps

# Git
git add .
git commit -m "message"
git push origin main
```

---

## Demo Credentials (After Seeding)

After running `npm run prisma:seed`:

```
Admin:    admin@school.com / admin123
Teacher:  teacher@school.com / password123
Student:  student@school.com / password123
Parent:   parent@school.com / password123
```

---

## Next Steps

After local development setup:

1. **Build & Test**: `npm run build && npm run test`
2. **Type Check**: `npm run typecheck`
3. **Deploy**: See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)

---

## FAQs

**Q: Can I use embedded-postgres on Vercel?**  
A: No. Embedded-postgres only works locally on Windows. Use Railway, AWS RDS, or Supabase for production.

**Q: Which option should I use?**
- **Railway**: Easiest, free tier available ✅ Recommended
- **Docker**: If you have Docker installed
- **Embedded**: Windows only, local dev only

**Q: How do I reset my local database?**
```bash
# Option 1: Delete Railway database and recreate
# Option 2: Stop docker, delete .data folder, restart
# Option 3: rm -r .data/postgres16 && npm run db:start
```

**Q: Can I use a local PostgreSQL installation?**  
A: Yes, just update DATABASE_URL in .env to point to it:
```
DATABASE_URL="postgresql://your_user:your_pass@localhost:5432/your_db"
```

---

## Need Help?

- Check [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for Vercel deployment
- Check [QUICK_START.md](../QUICK_START.md) for quick setup
- See [README.md](../README.md) for project overview

