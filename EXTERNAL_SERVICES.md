# 🔌 External Services Setup

Complete guide to configure all third-party services.

---

## 📧 Email Service

### Option 1: SendGrid (Recommended)

```
1. Sign up: https://sendgrid.com
2. Dashboard → Settings → API Keys
3. Create API Key: "Vercel Deployment"
4. Copy key (starts with SG.)
5. Add to Vercel:
   - EMAIL_PROVIDER=sendgrid
   - SENDGRID_API_KEY=SG.xxxxxxxxxxxx
```

**Verify:**
```bash
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer SG.xxxx" \
  -d '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "noreply@yourdomain.com"},
    "subject": "Test",
    "content": [{"type": "text/plain", "value": "Test email"}]
  }'
```

### Option 2: Gmail SMTP

```
1. Gmail Account → Manage Account
2. Security → App passwords
3. Select App: Mail, Device: Windows
4. Generate password (16 chars)
5. Add to Vercel:
   - SMTP_HOST=smtp.gmail.com
   - SMTP_PORT=587
   - SMTP_USER=your-email@gmail.com
   - SMTP_PASS=16-char-password
```

### Option 3: AWS SES

```
1. AWS Console → SES
2. Verify sender email
3. Create credentials
4. Add to Vercel:
   - SES_REGION=us-east-1
   - SES_ACCESS_KEY=AKIA...
   - SES_SECRET_KEY=wJal...
```

---

## 💬 SMS Service

### Option 1: Twilio

```
1. Sign up: https://twilio.com
2. Dashboard → Account SID & Auth Token
3. Buy phone number (for sending)
4. Add to Vercel:
   - SMS_PROVIDER=twilio
   - TWILIO_ACCOUNT_SID=ACxxxxxxxx
   - TWILIO_AUTH_TOKEN=xxxxxxxxxx
   - TWILIO_PHONE_NUMBER=+1234567890
```

### Option 2: AWS SNS

```
1. AWS Console → SNS
2. Create topic: "school-erp-sms"
3. Add phone numbers
4. Get credentials
5. Add to Vercel:
   - SMS_PROVIDER=sns
   - AWS_REGION=us-east-1
   - AWS_ACCESS_KEY=AKIA...
   - AWS_SECRET_KEY=wJal...
```

### Option 3: Vonage (Nexmo)

```
1. Sign up: https://vonage.com
2. Dashboard → API Key & Secret
3. Buy number
4. Add to Vercel:
   - SMS_PROVIDER=vonage
   - VONAGE_API_KEY=xxxxxxxx
   - VONAGE_API_SECRET=xxxxxxxx
```

---

## 📁 File Storage (S3)

### AWS S3 Setup

```
1. AWS Console → S3 → Create bucket
   Name: school-erp-files
   Region: us-east-1
   Block public access: ✓ (All)

2. Create IAM User:
   AWS Console → IAM → Users → Add User
   - Username: school-erp-app
   - Access type: Programmatic access
   
3. Attach Policy:
   - Select user → Permissions → Attach policies
   - Search: AmazonS3FullAccess (for development)
   - For production: Create custom policy

4. Custom Policy for Production:
```

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::school-erp-files/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::school-erp-files"
    }
  ]
}
```

```
5. Get Access Keys:
   - Copy: Access Key ID
   - Copy: Secret Access Key

6. Add to Vercel:
   - S3_BUCKET=school-erp-files
   - S3_REGION=us-east-1
   - S3_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
   - S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

7. Bucket CORS (Optional - for direct uploads):
   AWS Console → S3 → school-erp-files → Permissions → CORS
```

```xml
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## 💳 Payment Processing

### Stripe Integration

```
1. Sign up: https://stripe.com
2. Dashboard → Developers → API Keys
3. Copy:
   - Publishable Key (starts with pk_)
   - Secret Key (starts with sk_)

4. Add to Vercel:
   - STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   - STRIPE_SECRET_KEY=sk_live_xxxxx

5. Configure Webhooks:
   - Dashboard → Developers → Webhooks
   - Add endpoint: https://api.yourdomain.com/webhooks/stripe
   - Events to subscribe: 
     - payment_intent.succeeded
     - payment_intent.payment_failed
     - charge.refunded
```

### Razorpay Integration (India/Asian)

```
1. Sign up: https://razorpay.com
2. Dashboard → Settings → API Keys
3. Copy:
   - Key ID
   - Key Secret

4. Add to Vercel:
   - RAZORPAY_KEY_ID=xxxxx
   - RAZORPAY_KEY_SECRET=xxxxx

5. Configure Webhooks:
   - Dashboard → Webhooks
   - Add: https://api.yourdomain.com/webhooks/razorpay
   - Active: Yes
```

---

## 📊 Error Monitoring (Sentry)

```
1. Sign up: https://sentry.io
2. Create new organization
3. Create project: Select "Node.js"
4. Get DSN: https://xxxxx@sentry.io/xxxxxx

5. Add to Vercel API:
   - SENTRY_DSN=https://xxxxx@sentry.io/xxxxxx

6. Add to Vercel Web:
   - NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxxx

7. Test error capture:
```

```typescript
// In API
import Sentry from "@sentry/node";

Sentry.captureException(new Error("Test error"));
```

---

## 📱 Push Notifications

### Firebase Cloud Messaging

```
1. Firebase Console: https://console.firebase.google.com
2. Create project or select existing
3. Project Settings → Service Accounts
4. Generate new private key
5. Save JSON file securely

6. Add to Vercel:
   - FIREBASE_PROJECT_ID=your-project
   - FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   - FIREBASE_CLIENT_EMAIL=firebase@project.iam.gserviceaccount.com

7. Get Web Push credentials:
   - Project Settings → Cloud Messaging
   - Copy Server Key & Sender ID
```

### OneSignal (Alternative)

```
1. Sign up: https://onesignal.com
2. Create app
3. Get:
   - App ID
   - REST API Key

4. Add to Vercel:
   - ONESIGNAL_APP_ID=xxxxx
   - ONESIGNAL_API_KEY=xxxxx
```

---

## 🔍 Analytics & Tracking

### Google Analytics

```
1. Google Analytics: https://analytics.google.com
2. Create property
3. Get Measurement ID: G-XXXXXXXXXX

4. Add to Web App (.env):
   - NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

5. In Next.js layout:
```

```typescript
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
        />
        <Script
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 🔐 API Key Management Best Practices

### ✅ DO
```
✓ Store keys in Vercel environment variables
✓ Use separate keys for dev/staging/production
✓ Rotate keys every 90 days
✓ Use least privilege IAM policies
✓ Enable IP whitelisting where possible
✓ Log all API access
✓ Use secrets management tools
```

### ❌ DON'T
```
✗ Commit keys to GitHub
✗ Use same key across environments
✗ Share keys via email/Slack
✗ Hard-code keys in application
✗ Use overly permissive IAM policies
✗ Leave unused keys active
✗ Use personal accounts for production
```

---

## 📋 Service Checklist

### Before Production:

```
Email Service:
[ ] SendGrid/SMTP configured
[ ] Test email sent
[ ] Bounce handling setup
[ ] SPF/DKIM records added

SMS Service:
[ ] Twilio/SNS configured
[ ] Test SMS sent
[ ] Rate limiting set
[ ] Error handling added

File Storage (S3):
[ ] Bucket created
[ ] CORS configured
[ ] IAM user created
[ ] Upload/download tested
[ ] Expiration policy set

Payment:
[ ] Stripe/Razorpay configured
[ ] Webhooks verified
[ ] Test payment completed
[ ] Refund process tested
[ ] Error scenarios handled

Monitoring:
[ ] Sentry project created
[ ] DSN added to code
[ ] Error capturing tested
[ ] Alerts configured
[ ] Performance monitoring enabled

Analytics:
[ ] Google Analytics ID added
[ ] Event tracking verified
[ ] Custom events created
[ ] Dashboard configured
```

---

## 🚨 Emergency Contacts

Save these for urgent issues:

```
Email Service Support: support@sendgrid.com
SMS Service Support: support@twilio.com
S3 Support: https://console.aws.amazon.com/support
Payment Support: support@stripe.com
Sentry Support: support@sentry.io
Database Support: support@railway.app

Your GitHub: https://github.com/munawaryar786/school
Vercel Dashboard: https://vercel.com/dashboard
```

---

## 💾 Configuration Export

After setting up all services, export your config:

```bash
# Create a secure backup (DO NOT commit!)
cat > config-backup.txt << EOF
Email: SendGrid / SMTP
SMS: Twilio
S3: AWS S3
Payment: Stripe
Monitoring: Sentry
Date: $(date)
EOF

# Store securely (1Password, LastPass, etc)
# Add to team wiki with restricted access
```

