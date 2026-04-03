# Golf Charity Subscription Platform

A full-stack web application combining golf performance tracking, monthly prize draws, and charitable giving.

**Status**: Beta (Core features implemented, admin/remaining UI in progress)

## 🎯 What This Project Does

Users subscribe monthly/yearly, track their golf scores, participate in monthly draws, and support charities of their choice - 10%+ of their subscription is automatically donated.

## ✨ Key Features

- **Score Tracking**: Log golf scores (Stableford format 1-45)
- **Monthly Draws**: Automated prize draws based on user scores
- **Charity Integration**: Automatic donations to user-selected charities
- **Subscription**: Stripe integration with monthly/yearly plans
- **Winner Verification**: Upload proof, admin verification, automatic payouts
- **Admin Dashboard**: Draw management, user management, analytics
- **Responsive UI**: Modern, emotion-driven design (not golf-cliché)

## 📚 Documentation

1. **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Technical setup, feature overview, next steps
2. **[INTERVIEW_GUIDE.md](./INTERVIEW_GUIDE.md)** - Architecture, design decisions, talking points
3. **[README_SETUP.md](./README_SETUP.md)** - Quick start guide
4. **[SCHEMA.sql](./SCHEMA.sql)** - Database schema (run in Supabase)

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup .env.local (see .env.example)
# Copy Supabase & Stripe credentials

# 3. Setup database (run SCHEMA.sql in Supabase)

# 4. Run dev server
npm run dev

# Visit http://localhost:3000
```

## 📊 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Auth**: JWT + Supabase Auth
- **Deployment**: Vercel + Supabase

## 🏗️ Completed Components

- ✅ Database schema with RLS policies
- ✅ JWT authentication system
- ✅ Golf score management (rolling 5-score system)
- ✅ Draw engine (random & algorithmic)
- ✅ Prize pool calculations
- ✅ Stripe integration with webhooks
- ✅ Winner verification workflow
- ✅ Landing page, signup, login, dashboard
- ✅ All core API endpoints

## ⏳ Still To Build

- Admin panel pages (draw management, user management, etc.)
- Remaining dashboard pages (charity selection, subscription, etc.)
- Email notifications
- More UI components & polish
- E2E testing

## 🎓 Interview Preparation

Read [INTERVIEW_GUIDE.md](./INTERVIEW_GUIDE.md) for:
- Architecture & design rationale
- Database schema explanation  
- Score matching algorithm
- Prize pool calculations
- Scaling considerations
- Security best practices
- Sample interview answers

## 📖 User Journey

```
1. Signup → Create account
2. Dashboard → View stats
3. Subscribe → Choose plan & charity
4. Add Scores → Enter golf scores
5. Monthly Draw → Check if won
6. Verify & Claim → Submit proof, get paid
```

## 🔗 Key Endpoints

**Public:**
- `POST /api/auth` - Signup/Login
- `GET /api/charities` - List charities

**User Protected:**
- `GET /api/scores` - Get scores
- `POST /api/scores` - Add score
- `GET /api/dashboard` - Dashboard data

**Admin Protected:**
- `POST /api/draws` - Create draw
- `PUT /api/draws/publish` - Publish results
- `GET /api/admin/dashboard` - Admin stats

---

**For detailed setup instructions, see [IMPLEMENTATION.md](./IMPLEMENTATION.md)**
