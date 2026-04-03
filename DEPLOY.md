# Quick Deployment Guide

This guide walks you through deploying the Golf Charity Platform to production.

## Prerequisites

- Vercel account (https://vercel.com)
- Supabase account (https://supabase.com)
- Stripe account (https://stripe.com)
- Git repository

## Step 1: Supabase Setup (5 minutes)

### Create Project
1. Go to https://supabase.com and create a new project
2. Choose a region close to your users
3. Note your `Project URL` and `Anon Key`

### Import Database Schema
1. In Supabase dashboard, go to `SQL Editor`
2. Create a new query
3. Copy the entire content of `SCHEMA.sql` from the repo
4. Paste it into the SQL editor
5. Click `Run`

✅ Your database is now ready!

## Step 2: Stripe Setup (10 minutes)

### Get API Keys
1. Go to https://dashboard.stripe.com/apikeys
2. Copy your `Secret Key` (starts with `sk_`)
3. Copy your `Publishable Key` (starts with `pk_`)

### Set Up Webhook
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy your `Signing Secret` (starts with `whsec_`)

✅ Stripe is configured!

## Step 3: Vercel Deployment (5 minutes)

### Connect Repository
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Click "Import"

### Configure Environment Variables

In Vercel dashboard, go to project settings → "Environment Variables" and add:

```
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
NEXT_PUBLIC_APP_URL=https://yourvercelapp.vercel.app
```

### Deploy
1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Visit your deployed URL

✅ Your app is live!

## Step 4: Post-Deployment Testing

### Test User Flow
1. Sign up with a test email
2. Add a golf score
3. Go to charities and select one
4. Try to subscribe (use Stripe test card: `4242 4242 4242 4242`)
5. View your dashboard

### Test Admin Flow
1. Set up an admin user manually in Supabase (optional)
2. Go to `/admin` 
3. Try creating a draw
4. Try verifying a winner

### Monitor
1. Check Supabase logs for any errors
2. Check Stripe webhook delivery status
3. Check Vercel function logs if issues occur

## Common Issues & Solutions

### Issue: "Failed to fetch" errors
**Solution**: Check environment variables are set correctly in Vercel

### Issue: Stripe webhook not triggering
**Solution**: Verify webhook URL is correct and public. Check Stripe webhook logs.

### Issue: Database connection timeout
**Solution**: Supabase may need IP whitelist. Go to project settings → Database → Permitted IP Addresses

### Issue: 404 on admin pages
**Solution**: Verify user has admin role in database (optional - can be added later)

## Environment Variables Reference

| Variable | From | Example |
|----------|------|---------|
| `SUPABASE_URL` | Supabase Settings | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Settings | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings | `eyJhbGc...` |
| `STRIPE_SECRET_KEY` | Stripe API Keys | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe API Keys | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhooks | `whsec_...` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL | `https://app.example.com` |

## Post-Deployment Checklist

- [ ] All pages load without errors
- [ ] Can sign up and log in
- [ ] Can add golf scores
- [ ] Can subscribe with Stripe
- [ ] Dashboard shows correct data
- [ ] Admin panel accessible
- [ ] Email notifications working (optional)
- [ ] Custom domain configured (optional)

## Monitoring & Maintenance

### Weekly
- Check Stripe webhook logs
- Verify no database errors in Supabase
- Monitor Vercel deployment logs

### Monthly
- Run admin dashboard to check metrics
- Review active subscriptions
- Process pending winner verifications
- Check charity contribution totals

### Quarterly
- Database optimization
- Performance review
- Security audit
- Feature enhancement

## Scaling Considerations

The current setup can handle:
- **5,000+** users
- **50,000+** golf scores
- **1000+** concurrent users
- **$100k+** monthly revenue

If you exceed these, consider:
1. Database replication
2. CDN for static assets
3. API rate limiting
4. Caching layer (Redis)

## Support & Troubleshooting

For issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Check Stripe webhook deliveries
4. See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for architecture details
5. See [INTERVIEW_GUIDE.md](./INTERVIEW_GUIDE.md) for technical decisions

## Next Steps

After deployment:
1. ✅ Add admin user(s) via Supabase
2. ✅ Create initial charities in admin panel
3. ✅ Set up email service (optional)
4. ✅ Configure custom domain
5. ✅ Set up monitoring & alerts

---

**Deployment Time**: ~20-30 minutes total  
**Difficulty**: Intermediate  
**Support**: Check docs or deployment logs if issues arise
