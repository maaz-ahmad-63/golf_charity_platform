# Golf Charity Platform - Quick Reference

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Setup .env.local
cp .env.example .env.local
# Fill in your Supabase & Stripe credentials

# 3. Run database migrations
# Go to Supabase SQL Editor and run SCHEMA.sql

# 4. Start dev server
npm run dev

# 5. Visit http://localhost:3000
```

## 📍 Key URLs

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Landing page |
| Signup | `/signup` | Create account |
| Login | `/login` | Sign in |
| Dashboard | `/dashboard` | User hub |
| Scores | `/dashboard/scores` | Manage scores |
| Subscribe | `/subscribe` | Choose plan |
| Charities | `/charities` | Browse causes |
| Draws | `/draws` | View results |
| Profile | `/profile` | Settings |
| Admin | `/admin` | Admin hub |
| Draws (Admin) | `/admin/draws` | Manage draws |
| Charities (Admin) | `/admin/charities` | Add charities |
| Users (Admin) | `/admin/users` | View users |
| Winners (Admin) | `/admin/winners` | Verify claims |

## 🔑 Test Credentials

### Test User
```
Email: user@example.com
Password: password123
```

### Stripe Test Card
```
Card: 4242 4242 4242 4242
Exp: 12/25
CVC: 123
```

## 📊 Database Quick Facts

- **Tables**: 7 (users, scores, charities, draws, winners, contributions, payments)
- **Rows (typical)**: ~50,000 across all tables at scale
- **RLS**: Enabled on all user-facing tables
- **Backups**: Supabase automatic daily
- **Connection**: PostgreSQL via Supabase

## 🔧 Common Tasks

### Add a User (Admin)
```bash
# Via Supabase UI:
1. Auth → Users → Add user
2. Or use /signup endpoint
```

### Create a Draw
```
1. Go to /admin/draws
2. Click "+ Create New Draw"
3. Select month/year
4. Click "Create Draw"
5. Click "Publish" when ready
```

### Add a Charity
```
1. Go to /admin/charities
2. Click "+ Add Charity"
3. Fill details
4. Click "Add Charity"
```

### Verify a Winner
```
1. Go to /admin/winners
2. Review proof URL
3. Click "✓ Verify & Pay"
```

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't login | Check email/password, verify user exists in Supabase |
| 404 pages | Check URL spelling, middleware may redirect |
| Stripe errors | Verify API keys in .env.local |
| Database errors | Check Supabase connection, run SCHEMA.sql |
| CORS errors | Frontend and backend must be same origin |
| Webhook not triggering | Check Stripe dashboard webhook delivery logs |

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

## 🔐 Security Reminders

```
✅ DO:
- Keep .env.local secret
- Use HTTPS in production
- Rotate API keys regularly
- Monitor webhook deliveries

❌ DON'T:
- Commit .env.local to git
- Share API keys
- Use test keys in production
- Log sensitive data
```

## 📞 Important Links

- [Supabase Console](https://supabase.com/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)

## 📈 Performance Tips

```
Database:
- Use indexes (25+ already set)
- Keep RLS policies simple
- Archive old draws monthly

API:
- Cache common queries
- Paginate large results
- Use webhooks for async

Frontend:
- Lazy load components
- Optimize images
- Use next/image
```

## 🎓 Architecture in 30 Seconds

```
User registers
    ↓
JWT token created
    ↓
User adds scores (max 5)
    ↓
Subscribes via Stripe
    ↓
Monthly draw runs
    ↓
Winners drawn from scores
    ↓
Winners verify proof
    ↓
Admin approves + pays
    ↓
Charity gets donation
```

## 📝 File Locations

```
Frontend Pages:     src/app/**/page.tsx
API Routes:         src/app/api/**/route.ts
Database Utils:     src/lib/db/*.ts
Auth Utils:         src/lib/auth/*.ts
Stripe Utils:       src/lib/stripe/*.ts
Types:             src/types/index.ts
Styles:            src/app/globals.css
Environment:       .env.local
Database Schema:   SCHEMA.sql
```

## 🔄 API Response Format

```typescript
// Success
{
  success: true,
  data: {...},
  message: "Operation completed"
}

// Error
{
  success: false,
  error: "Error message",
  status: 400
}
```

## 💡 Pro Tips

1. **Use Stripe test mode** during development
2. **Monitor Vercel logs** for deployment issues
3. **Check Supabase stats** for database usage
4. **Test webhooks** using Stripe webhook CLI
5. **Version your API** responses for future changes

## 📚 Documentation Index

1. **README.md** - Start here
2. **IMPLEMENTATION.md** - Technical details
3. **INTERVIEW_GUIDE.md** - Architecture explanation
4. **BUILD_STATUS.md** - What's included
5. **DEPLOY.md** - Production deployment
6. **PROJECT_SUMMARY.md** - Complete overview
7. **This file** - Quick reference

---

**Last Updated**: April 3, 2026  
**Status**: Production Ready  
**Support**: Check documentation or deployment logs
