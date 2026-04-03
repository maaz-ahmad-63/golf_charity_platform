# Golf Charity Platform - Interview Preparation Guide

## Project Overview

**What is it?** A subscription-based web application that combines golf performance tracking, charitable giving, and a monthly lottery-style reward system.

**Tech Stack:**
- **Frontend**: Next.js 16 (React 19), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Auth**: JWT + NextAuth
- **Deployment**: Vercel + Supabase

---

## Core Business Logic

### 1. Subscription Model
- **Users** pay either **$9.99/month** or **$99.99/year** via Stripe
- **30% of subscription** goes to prize pool
- **10% minimum** (configurable up to 100%) goes to user's chosen charity
- Status tracking: `active`, `inactive`, `cancelled`, `past_due`

### 2. Score Management
- Users enter **golf scores in Stableford format** (1-45)
- System maintains **exactly 5 scores** per user (FIFO - oldest deleted when 6th added)
- Scores displayed in **reverse chronological order** (most recent first)

### 3. Monthly Draws
- **Two draw types**:
  1. **Random**: Generates random 5 numbers
  2. **Algorithmic**: Weighted by least-frequent user scores

- **Three winning tiers**:
  - **5-match**: 40% of prize pool
  - **4-match**: 35% of prize pool  
  - **3-match**: 25% of prize pool

- **Prize calculation**: `Total Subscribers × $9.99 × 30% × Percentage`
- **Multiple winners**: Prize divided equally

### 4. Charity Integration
- **100+ charities** to choose from
- Users select at signup (or anytime)
- **Percentage-based** contribution (10-100%)
- Tracked monthly with proof of donation

### 5. Winner Verification
- Winners submit **screenshot proof** of scores
- Admin reviews and **approves/rejects**
- Upon approval, payout marked as `paid`
- Payment date recorded

---

## Architecture Decisions & Rationale

### Why JWT + Database for Auth?
- NextAuth gave us too much overhead
- JWT is lightweight and perfect for API routes
- Session stored in HttpOnly cookies for security
- Supabase Auth handles password hashing

### Why Stripe Webhooks?
- **Asynchronous processing** - don't block user during payment
- **Idempotent** - safe to replay
- **Reliable** - automatic retries by Stripe
- Webhook updates subscription status in database real-time

### Why Rolling 5-Score System?
- **PRD requirement**: "Only the latest 5 scores are retained"
- **Automatic cleanup**: Oldest score deleted when 6th added
- **Database optimization**: Prevents unlimited growth
- **User experience**: Simple and intuitive

### Why RLS (Row Level Security)?
- **Data isolation**: Users see only their data
- **Performance**: Filters at database level
- **Security**: Can't bypass even if auth fails
- **Compliance**: GDPR-friendly approach

### Score Matching Algorithm
```
FOR each user:
  matched_count = 0
  FOR each user_score IN user's 5 scores:
    IF user_score IN winning_numbers:
      matched_count++
  
  IF matched_count == 5: CREATE winner with 5-match
  ELSE IF matched_count == 4: CREATE winner with 4-match
  ELSE IF matched_count == 3: CREATE winner with 3-match
```

### Prize Pool Calculation
```
active_subscribers = COUNT(users WHERE subscription_status = 'active')
total_monthly_revenue = active_subscribers × $9.99
prize_pool = total_monthly_revenue × 30%

pool_5_match = prize_pool × 40%
pool_4_match = prize_pool × 35%
pool_3_match = prize_pool × 25%

IF multiple 5-match winners:
  per_winner = pool_5_match / winner_count
```

---

## Key Implementation Highlights

### 1. Score Entry Flow
```
User enters score (1-45) + date
↓
Validate score range
↓
Insert into database
↓
Count user's scores
↓
IF count > 5:
  Delete oldest score (FIFO)
↓
Return latest 5 scores
```

### 2. Subscription Checkout Flow
```
User selects plan + charity
↓
Create/Get Stripe Customer
↓
Create Stripe Subscription
↓
Save charity selection to DB
↓
Return client secret for payment
↓
(Webhook fires on payment success)
↓
Webhook updates user subscription_status to 'active'
```

### 3. Draw Publishing Flow
```
Admin clicks "Publish Draw"
↓
Fetch all users with active subscriptions
↓
Get each user's last 5 scores
↓
Generate winning numbers (random or algorithmic)
↓
FOR each user: Check for matches
↓
Create Winner records
↓
Update Draw status to 'published'
↓
(Optional) Send notifications to winners
```

### 4. Winner Verification Flow
```
Winner gets notified they won
↓
Submits proof (screenshot URL)
↓
Admin sees in "Pending Verifications"
↓
Admin approves or rejects
↓
IF approved: payment_status → 'pending' → 'paid'
↓
IF rejected: verification_status → 'rejected'
```

---

## Database Schema Highlights

### Users Table
```sql
- id (UUID, PK from auth.users)
- email (TEXT, unique)
- subscription_status (active|inactive|cancelled|past_due)
- stripe_customer_id (TEXT, unique)
- stripe_subscription_id (TEXT)
- charity_id (FK → charities)
- charity_percentage (10-100)
```

### Golf_Scores Table
```sql
- id (UUID, PK)
- user_id (FK → users)
- score (1-45, Stableford)
- score_date (DATE)
- Constraint: 5 scores max per user (handled in app logic)
```

### Draws Table
```sql
- id (UUID, PK)
- draw_month (DATE, unique)
- winning_numbers (INT[])
- status (draft|published|archived)
- pool_5_total, pool_4_total, pool_3_total (DECIMAL)
- pool_5_rollover (IF no 5-match winner, rolls to next month)
```

### Winners Table
```sql
- draw_id (FK)
- user_id (FK)
- match_type (5-match|4-match|3-match)
- prize_amount (calculated)
- verification_status (pending|approved|rejected)
- payment_status (pending|paid)
- proof_url (screenshot)
```

---

## Security Considerations

### 1. Authentication
- JWT tokens expire in 7 days
- Stored in HttpOnly cookies (no JS access)
- Verified on every protected request
- Middleware checks auth before processing

### 2. Authorization
- RLS policies enforce data isolation
- Admin routes require `role = 'admin'`
- Users can't edit other users' scores
- Service role key only used server-side

### 3. Stripe
- Webhook signature verified
- Idempotent operations
- PCI compliance via Stripe
- No card data touches server

### 4. Data Protection
- Passwords hashed via Supabase Auth
- HTTPS enforced in production
- SQL queries use parameterized prepared statements
- CORS restricted to own domain

---

## Potential Scaling Challenges & Solutions

### Challenge 1: Large Draw Computations
**Problem**: Checking 100K users × 5 scores each = 500K comparisons

**Solution**:
- Move scoring to background job (Bull Queue)
- Batch process in chunks
- Cache winning numbers in Redis
- Archive old draws after payout

### Challenge 2: Real-time Prize Pool Updates
**Problem**: Prize pool changes as users subscribe/cancel

**Solution**:
- Finalize pool at draw publication time
- Cache subscriber count hourly
- Use materialized views for aggregations

### Challenge 3: Payment Processing at Scale
**Problem**: Thousands of payouts monthly

**Solution**:
- Use Stripe batch payout API
- Schedule payouts asynchronously
- Implement retry logic for failed transfers
- Add bank account verification

### Challenge 4: Geographic Expansion
**Problem**: Different currencies, tax rates, regulations

**Solution**:
- Store price in base currency, convert at display
- Add country field to users
- Dynamic tax calculation
- Localized Stripe payments

---

## Interview Talking Points

### 1. "Tell me about the architecture"
> We use a Next.js full-stack app with Supabase as our database. Frontend is React/TypeScript, backend is API routes. We chose this for rapid development and to keep deployment simple on Vercel. Stripe handles all payment processing asynchronously via webhooks, so users get instant feedback while payments process securely in the background.

### 2. "How do you handle score management?"
> Users can have maximum 5 scores at a time. When they enter a 6th score, we automatically delete the oldest one using a FIFO approach. This keeps the database lean and matches the PRD requirement perfectly. We display scores in reverse chronological order so users always see their most recent scores first.

### 3. "Walk through the draw system"
> We support two types of draws - random or algorithmic. For random, we just generate 5 random numbers. For algorithmic, we analyze the frequency of all user scores across the platform and weight the selection toward least-frequent numbers, making the lottery feel fairer. Once the admin publishes a draw, we compare each user's 5 scores against the winning numbers and auto-generate winner records. Prize pools are calculated based on active subscriber count, and if multiple users match the same tier, we split the prize equally.

### 4. "How do you ensure data security?"
> We use Row-Level Security policies in Supabase so each user can only see their own data at the database level. JWT tokens are stored in HttpOnly cookies so JavaScript can't access them. All Stripe operations are verified with webhook signatures. Admin operations require checking the user's role before processing. We never store card data - Stripe handles that via their PCI-compliant infrastructure.

### 5. "What was a challenging design decision?"
> The score rolling mechanism was interesting. We needed to automatically maintain exactly 5 scores per user without the user noticing. We could have used a trigger, but decided to handle it in the application layer for easier debugging and portability. This way, when a user enters a 6th score, the app returns the cleaned-up 5-score list immediately.

### 6. "How would you scale this?"
> For draws with 100K users, we'd move the score-matching computation to a background job using a queue like Bull. We'd batch process users in chunks and could even distribute across workers. For payments, we'd use Stripe's batch payout API instead of individual transfers. Real-time stats would use materialized views or Redis caching. For global expansion, we'd add multi-currency support and handle regional compliance requirements.

### 7. "Any edge cases you thought about?"
> Yes - what if a subscription expires mid-month? We mark it as `past_due` and exclude from that month's draw. What if an admin publishes a draw twice? Stripe webhooks are idempotent so no duplicate charges. What if a user submits proof of a winning score they didn't actually have? That's why the verification step - admin reviews the proof screenshot. What if the pool_5_rollover carries forward for multiple months? We just add it to the next month's pool_5_total.

---

## Code Examples

### Score Entry Logic
```typescript
export async function addGolfScore(userId: string, score: number, scoreDate: string) {
  if (score < 1 || score > 45) {
    throw new Error('Score must be between 1 and 45');
  }

  // Insert new score
  const { data } = await supabaseServer
    .from('golf_scores')
    .insert([{ user_id: userId, score, score_date: scoreDate }])
    .select();

  // Get last 5 and delete oldest if needed
  const scores = await getLastFiveScores(userId);
  if (scores.length > 5) {
    const oldestScore = scores[scores.length - 1];
    await supabaseServer
      .from('golf_scores')
      .delete()
      .eq('id', oldestScore.id);
  }

  return data?.[0];
}
```

### Draw Publishing
```typescript
export async function publishDrawResults(drawId: string) {
  const draw = await supabaseServer
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single();

  const winners = await checkUserWinners(
    draw.winning_numbers,
    {
      pool_5_match: draw.pool_5_total,
      pool_4_match: draw.pool_4_total,
      pool_3_match: draw.pool_3_total,
    }
  );

  // Bulk insert winners
  if (winners.length > 0) {
    await supabaseServer.from('winners').insert(winners);
  }

  // Mark draw published
  return await supabaseServer
    .from('draws')
    .update({ status: 'published' })
    .eq('id', drawId)
    .select();
}
```

---

## Questions for Your Interviewer

> "How would you handle regulatory compliance for gambling/lottery in different countries?"
> "What's your preferred approach for payment processing at scale?"
> "How do you think about designing for geographic expansion?"

---

Good luck with your interview! Focus on understanding the business logic, the data model, and why certain architectural decisions were made.
