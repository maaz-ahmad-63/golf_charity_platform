# Subscription System Architecture

## 🎯 Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION/LOGIN                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  User fills form                                                 │
│    ↓                                                              │
│  POST /api/auth (action=signup or login)                        │
│    ↓                                                              │
│  ✓ Validate credentials                                          │
│  ✓ Save to .mock-users.json                                      │
│  ✓ Generate JWT token                                            │
│    ↓                                                              │
│  Response: { token, user: {id, email, fullName} }              │
│    ↓                                                              │
│  localStorage.setItem('user', user_object)                      │
│  localStorage.setItem('authToken', token)                       │
│    ↓                                                              │
│  Redirect to /dashboard or /onboarding/charity                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   CHARITY SELECTION (Optional)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  GET /api/charities                                              │
│    ↓                                                              │
│  Response: { charities: [...8 charities...] }                   │
│    ↓                                                              │
│  User selects charity                                            │
│    ↓                                                              │
│  Navigate to /subscribe                                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 SUBSCRIPTION SELECTION & CHECKOUT                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /subscribe page loads                                           │
│    ↓                                                              │
│  ✓ User selects plan (monthly/yearly)                           │
│  ✓ User selects charity                                          │
│  ✓ Real-time price calculation                                   │
│    ↓                                                              │
│  User clicks "Continue to Payment"                              │
│    ↓                                                              │
│  handleSubscribe() function:                                     │
│    1. Get user from localStorage                                 │
│    2. Validate user exists                                       │
│    3. Set cookies: userId, userEmail                             │
│    4. Get plan data to find charity_percentage                   │
│    5. POST /api/checkout with:                                  │
│       {                                                           │
│         plan: "monthly" | "yearly",                              │
│         charityId: "charity_123",                                │
│         charityPercentage: 10 | 15                               │
│       }                                                           │
│    ↓                                                              │
│  /api/checkout route receives request                           │
│    ↓                                                              │
│  ✓ Check userId & userEmail cookies (Authentication)            │
│  ✓ Validate plan is valid                                        │
│  ✓ Validate charityPercentage (10-100)                          │
│    ↓                                                              │
│  Create subscription object:                                     │
│    {                                                              │
│      id: "sub_xxx",                                              │
│      userId: "user_id",                                          │
│      email: "user@email.com",                                    │
│      plan: "monthly",                                            │
│      amount: 29.99,                                              │
│      charityId: "charity_123",                                   │
│      charityPercentage: 10,                                      │
│      status: "active",                                           │
│      createdAt: "2024-01-15T10:30:00Z",                         │
│      nextBillingDate: "2024-02-14T10:30:00Z"                    │
│    }                                                              │
│    ↓                                                              │
│  Save to .mock-subscriptions.json:                              │
│    {                                                              │
│      "user_id": { subscription_data },                           │
│      ...                                                          │
│    }                                                              │
│    ↓                                                              │
│  Return response:                                                │
│    {                                                              │
│      success: true,                                              │
│      data: {                                                      │
│        subscriptionId: "sub_xxx",                                │
│        plan: "monthly",                                          │
│        amount: 29.99,                                            │
│        charityPercentage: 10,                                    │
│        status: "active"                                          │
│      }                                                            │
│    }                                                              │
│    ↓                                                              │
│  Subscribe page:                                                 │
│    1. Save subscription to localStorage                          │
│    2. Redirect to /payment-success                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT SUCCESS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /payment-success page loads                                    │
│    ↓                                                              │
│  Display subscription details:                                   │
│    - Subscription ID                                             │
│    - Plan (monthly/yearly)                                       │
│    - Amount ($29.99 or $299.99)                                 │
│    - Charity Percentage (10% or 15%)                            │
│    - Next Billing Date (calculated)                             │
│    ↓                                                              │
│  User clicks "Go to Dashboard"                                  │
│    ↓                                                              │
│  Navigate to /dashboard                                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DASHBOARD                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /dashboard page loads                                           │
│    ↓                                                              │
│  GET /api/dashboard (with userId, userEmail cookies)           │
│    ↓                                                              │
│  Dashboard API:                                                  │
│    1. Get userId from cookies                                    │
│    2. Load .mock-subscriptions.json                             │
│    3. Find user subscription: subscriptions[userId]             │
│    4. Return:                                                    │
│       {                                                           │
│         user: {                                                   │
│           id: "user_id",                                         │
│           email: "user@email.com",                               │
│           subscription_status: "active",                         │
│           charity_percentage: 10                                 │
│         },                                                        │
│         subscription: { ...full subscription data... },          │
│         scores: [...],                                           │
│         winnings: [...],                                         │
│         totalWon: 350.00                                         │
│       }                                                           │
│    ↓                                                              │
│  Dashboard displays:                                             │
│    ✓ "Subscription Status: Active" (green indicator)            │
│    ✓ "Charity Contribution: 10%"                                │
│    ✓ Your Scores: 2/5                                           │
│    ✓ Total Won: $350.00                                         │
│    ✓ Mock scores list                                            │
│    ✓ Mock winnings history                                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Storage Architecture

```
BROWSER (Runtime)
┌────────────────────────────────────────────┐
│            localStorage                     │
├────────────────────────────────────────────┤
│ authToken: "eyJhbGc..." (JWT)              │
│ user: {                                     │
│   id: "user_id_123",                       │
│   email: "test@example.com",               │
│   fullName: "Test User"                    │
│ }                                           │
│ subscription: {                             │
│   subscriptionId: "sub_xxx",               │
│   plan: "monthly",                         │
│   amount: 29.99,                           │
│   status: "active"                         │
│ }                                           │
└────────────────────────────────────────────┘

BROWSER (Network)
┌────────────────────────────────────────────┐
│             Cookies                         │
├────────────────────────────────────────────┤
│ userId=user_id_123; path=/                 │
│ userEmail=test@example.com; path=/         │
└────────────────────────────────────────────┘

SERVER (Filesystem)
┌────────────────────────────────────────────┐
│        .mock-users.json                     │
├────────────────────────────────────────────┤
│ {                                           │
│   "test@example.com": {                    │
│     email: "test@example.com",             │
│     password: "password123",               │
│     fullName: "Test User",                 │
│     id: "user_id_123"                      │
│   }                                         │
│ }                                           │
└────────────────────────────────────────────┘

SERVER (Filesystem)
┌────────────────────────────────────────────┐
│    .mock-subscriptions.json                 │
├────────────────────────────────────────────┤
│ {                                           │
│   "user_id_123": {                         │
│     id: "sub_1699999999_abc",              │
│     userId: "user_id_123",                 │
│     email: "test@example.com",             │
│     plan: "monthly",                       │
│     amount: 29.99,                         │
│     charityId: "charity_1",                │
│     charityPercentage: 10,                 │
│     status: "active",                      │
│     createdAt: "2024-01-15...",            │
│     nextBillingDate: "2024-02-14..."       │
│   }                                         │
│ }                                           │
└────────────────────────────────────────────┘
```

---

## 🔄 API Flow Diagram

```
                    USER JOURNEY
                        ↓
                    
    ┌─────────────────────────────────────────────┐
    │         /api/auth                           │
    │    (POST - action: signup or login)         │
    │                                              │
    │  Input: email, password, [fullName]         │
    │  Output: { token, user }                    │
    │  Storage: .mock-users.json                  │
    └─────────────────────────────────────────────┘
                        ↓
                        
    ┌─────────────────────────────────────────────┐
    │         /api/charities                      │
    │    (GET - fetch available charities)        │
    │                                              │
    │  Input: (none)                              │
    │  Output: { charities: [...] }              │
    │  Storage: In-memory (8 mock charities)      │
    └─────────────────────────────────────────────┘
                        ↓
                        
    ┌─────────────────────────────────────────────┐
    │         /api/checkout                       │
    │   (POST - create subscription)              │
    │                                              │
    │  Input: { plan, charityId, percentage }     │
    │  Auth: userId, userEmail cookies            │
    │  Output: { subscriptionId, status }         │
    │  Storage: .mock-subscriptions.json          │
    └─────────────────────────────────────────────┘
                        ↓
                        
    ┌─────────────────────────────────────────────┐
    │         /api/dashboard                      │
    │    (GET - fetch subscription status)        │
    │                                              │
    │  Input: (cookies: userId, userEmail)        │
    │  Output: { user, subscription, scores... }  │
    │  Storage: Reads from .mock-subscriptions.json
    └─────────────────────────────────────────────┘
```

---

## 🛡️ Authentication & Validation Flow

```
SUBSCRIBE PAGE (handleSubscribe)
    ↓
    ├─ Validate: User object exists in localStorage ✓
    ├─ Validate: Plan is selected ✓
    ├─ Validate: Charity is selected ✓
    └─ Validate: User has id and email ✓
    ↓
SET COOKIES
    ├─ document.cookie = `userId=${userId}`
    └─ document.cookie = `userEmail=${userEmail}`
    ↓
POST /api/checkout
    ↓
CHECKOUT ENDPOINT (Authentication)
    ├─ Check: userId cookie exists ✓
    ├─ Check: userEmail cookie exists ✓
    └─ Return 401 if missing ✗
    ↓
CHECKOUT ENDPOINT (Validation)
    ├─ Validate: plan is 'monthly' or 'yearly' ✓
    ├─ Validate: charityPercentage >= 10 ✓
    ├─ Validate: charityPercentage <= 100 ✓
    └─ Return 400 if invalid ✗
    ↓
CREATE SUBSCRIPTION
    ├─ Generate subscription ID
    ├─ Calculate billing dates
    ├─ Create subscription object
    └─ Save to .mock-subscriptions.json
    ↓
RETURN SUCCESS
    └─ { subscriptionId, plan, amount, status }
```

---

## 📈 Data Persistence Timeline

```
1. REGISTRATION/LOGIN
   └─ .mock-users.json created/updated with user

2. SUBSCRIPTION CREATION (Checkout)
   └─ .mock-subscriptions.json created/updated with subscription

3. SERVER RESTART
   └─ Both files remain on disk ✓
   └─ Data persists across server restarts ✓

4. DASHBOARD LOAD
   └─ Reads from .mock-subscriptions.json
   └─ Returns current subscription status

5. LOGOUT (Optional - not yet implemented)
   └─ Files remain unchanged
   └─ New login creates new session with same data
```

---

## 🎨 UI Component Map

```
Landing Page (/)
    ↓
    ├─ "Get Started" button
    └─ Links to /signup

Signup Page (/signup)
    ├─ Email input
    ├─ Password input
    ├─ Full name input
    └─ Redirect to /onboarding/charity on success

Login Page (/login)
    ├─ Email input
    ├─ Password input
    └─ Redirect to /dashboard on success

Charity Selection (/onboarding/charity)
    ├─ Search bar
    ├─ Charity list (8 charities)
    ├─ Select charity
    └─ "Continue to Subscription" button

Subscribe Page (/subscribe)
    ├─ Charity dropdown
    ├─ Plan selector (Monthly/Yearly)
    │   ├─ Monthly: $29.99 (10% to charity)
    │   └─ Yearly: $299.99 (15% to charity)
    ├─ Price display with charity calculation
    └─ "Continue to Payment" button

Payment Success (/payment-success)
    ├─ Success icon (✓)
    ├─ Subscription details display
    │   ├─ Subscription ID
    │   ├─ Plan
    │   ├─ Amount
    │   ├─ Charity %
    │   └─ Next billing date
    ├─ "Go to Dashboard" button
    └─ "Back to Home" button

Dashboard (/dashboard)
    ├─ Header with user greeting
    ├─ Stats cards:
    │   ├─ Subscription Status
    │   ├─ Charity Contribution %
    │   ├─ Your Scores
    │   └─ Total Won
    ├─ Main content:
    │   ├─ Golf scores list
    │   └─ Winnings history
    └─ Navigation links
```

---

## ⚡ Performance Notes

- **No external API calls** (everything local)
- **File I/O only on subscription creation** (checkout endpoint)
- **Dashboard loads instantly** (in-memory mock data)
- **Charities pre-loaded** (8 mock charities in memory)
- **Cookies used for auth** (no session database needed)
- **localStorage for persistence** (browser-side)

---

## 🔐 Security (Mock Only - Not For Production)

**Current (Mock - Development Only)**:
- ✓ Passwords stored in plain text (mock only)
- ✓ JWT tokens generated locally (no validation)
- ✓ Cookies used for basic auth (no HTTPS required locally)
- ✓ No password hashing (mock only)

**For Production**:
- ❌ Hash passwords with bcrypt
- ❌ Validate JWT tokens properly
- ❌ Use HTTPS only
- ❌ Implement proper session management
- ❌ Use real Stripe integration
- ❌ Add CSRF protection
- ❌ Validate all inputs

---

**Complete Architecture Ready for Local Testing! 🚀**
