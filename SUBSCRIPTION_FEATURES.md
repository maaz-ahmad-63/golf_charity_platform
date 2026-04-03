# Golf Charity Platform - Subscription Features Implementation

## Overview
This document outlines all subscription features implemented in the Golf Charity Platform and how they work with the mock backend system.

---

## 1. ✅ Plans (Monthly & Yearly with Discounts)

### Monthly Plan
- **Price**: $29.99/month
- **Charity Contribution**: 10% to charity
- **Billing Cycle**: 30 days

### Yearly Plan  
- **Price**: $299.99/year
- **Charity Contribution**: 15% to charity
- **Billing Cycle**: 365 days
- **Discount**: Save ~20% compared to monthly (yearly = $359.88 vs monthly)

### Implementation Details
- Plans defined in: [`src/app/subscribe/page.tsx`](src/app/subscribe/page.tsx#L20-L35)
- Plans stored in `SUBSCRIPTION_PLANS` constant
- UI selection in subscribe page with real-time pricing calculation
- Charity percentage varies by plan (10% monthly, 15% yearly)

---

## 2. ✅ Gateway (Mock Payment Processing - No Real Stripe Needed)

### How It Works
1. User completes subscription form
2. User data and plan details sent to `/api/checkout`
3. Mock checkout endpoint processes request without external API calls
4. Subscription created and stored in `.mock-subscriptions.json`
5. User redirected to payment success page

### Checkout Endpoint: `/api/checkout` (POST)
**Location**: [`src/app/api/checkout/route.ts`](src/app/api/checkout/route.ts)

**Request Body**:
```json
{
  "plan": "monthly" | "yearly",
  "charityId": "charity_id_string",
  "charityPercentage": 10 | 15
}
```

**Authentication**: 
- Requires `userId` and `userEmail` cookies
- Set automatically by subscribe page before calling checkout

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_1699999999_abc12345",
    "plan": "monthly",
    "amount": 29.99,
    "charityPercentage": 10,
    "status": "active"
  },
  "message": "Subscription activated successfully!"
}
```

**Response (Error - Unauthorized)**:
```json
{
  "success": false,
  "error": "Unauthorized - Please login first",
  "status": 401
}
```

### Storage
- Subscriptions persisted to: `.mock-subscriptions.json`
- Format: `{ "userId": { subscription_data }, ... }`
- Persists across server restarts

---

## 3. ✅ Access Control (Login Required for Subscription)

### Authentication Flow

1. **User Registration**
   - Endpoint: `POST /api/auth?action=signup`
   - Stores user to `.mock-users.json`
   - Returns JWT token and user data
   - User data stored in localStorage

2. **User Login**  
   - Endpoint: `POST /api/auth?action=login`
   - Validates credentials against `.mock-users.json`
   - Returns JWT token and user data
   - User data stored in localStorage

3. **Subscribe Page Protection**
   - Requires user object in localStorage
   - Shows error: "You must be logged in to subscribe"
   - Automatically sets `userId` and `userEmail` cookies before checkout
   - Checkout endpoint validates cookies (returns 401 if missing)

### Test Credentials
- **Email**: `test@example.com`
- **Password**: `password123`

### Files
- Login page: [`src/app/login/page.tsx`](src/app/login/page.tsx)
- Signup page: [`src/app/signup/page.tsx`](src/app/signup/page.tsx)
- Auth endpoint: [`src/app/api/auth/route.ts`](src/app/api/auth/route.ts)

---

## 4. ✅ Lifecycle (Subscription Status & Renewal Dates)

### Subscription States
- **Active**: Currently subscribed, charges applied monthly/yearly
- **Cancelled**: User cancelled subscription (not yet implemented)
- **Expired**: Subscription past renewal date (not yet implemented in UI)

### Key Dates
- **Created At**: ISO timestamp when subscription was created
- **Next Billing Date**: Automatically calculated on checkout
  - Monthly: 30 days from creation
  - Yearly: 365 days from creation

### Dashboard Display
**Location**: [`src/app/dashboard/page.tsx`](src/app/dashboard/page.tsx)

Shows on dashboard:
- Subscription Status (Active/Inactive) with status indicator
- Charity Contribution Percentage
- Mock scores and winnings
- All-time winnings amount

### Subscription Info in Payment Success
**Location**: [`src/app/payment-success/page.tsx`](src/app/payment-success/page.tsx)

Displays after successful checkout:
- Subscription ID
- Plan type (monthly/yearly)
- Monthly amount charged
- Charity percentage
- Next billing date (calculated)

### Dashboard API
**Endpoint**: `GET /api/dashboard`
**Location**: [`src/app/api/dashboard/route.ts`](src/app/api/dashboard/route.ts)

Returns:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@email.com",
      "subscription_status": "active" | "inactive",
      "charity_percentage": 10
    },
    "subscription": {
      "id": "sub_xxx",
      "plan": "monthly" | "yearly",
      "amount": 29.99 | 299.99,
      "status": "active",
      "nextBillingDate": "2024-03-15T00:00:00Z"
    },
    "scores": [...],
    "winnings": [...],
    "totalWon": 350.00
  }
}
```

---

## 5. ✅ Validation (Real-time Subscription Status Checks)

### Validations on Checkout
- ✅ User must be logged in (cookie validation)
- ✅ Plan must be valid (monthly/yearly only)
- ✅ Charity ID must be provided
- ✅ Charity percentage must be 10-100%

### Validations on Dashboard
- ✅ User must have cookies set (userId, userEmail)
- ✅ Loads subscription from `.mock-subscriptions.json`
- ✅ Returns "inactive" if no subscription found

### Form Validations (Subscribe Page)
- ✅ Charity must be selected
- ✅ Plan selection required
- ✅ User must be logged in
- ✅ User data must be in localStorage

### Error Messages
- ❌ "Unauthorized - Please login first" - If no cookies
- ❌ "Invalid subscription plan" - If plan is invalid
- ❌ "Charity percentage must be between 10 and 100" - If percentage out of range
- ❌ "You must be logged in to subscribe" - If no user in localStorage

---

## Full Subscription Flow (Testing Guide)

### Step 1: Register/Login
1. Go to homepage (`http://localhost:3000`)
2. Click "Get Started" or go to `/signup`
3. Create account with any email/password
   - **Or** use existing: `test@example.com` / `password123`
4. User data automatically stored in localStorage
5. Redirected to charity selection

### Step 2: Select Charity
1. View available charities (8 test charities)
2. Search by name if needed
3. Click charity to select
4. Click "Continue to Subscription"

### Step 3: Choose Plan & Subscribe
1. Select "Monthly" ($29.99) or "Yearly" ($299.99)
2. See charity percentage for selected plan
3. Verify total amount calculation
4. Click "Continue to Payment"
5. **Process**:
   - User data loaded from localStorage ✓
   - Cookies set: `userId`, `userEmail` ✓
   - Checkout endpoint validates cookies ✓
   - Subscription created in `.mock-subscriptions.json` ✓
   - User redirected to payment success page ✓

### Step 4: Verify Subscription
1. View payment success page with subscription details
2. See subscription ID, plan, amount, charity %, next billing date
3. Click "Go to Dashboard"
4. Dashboard loads subscription from `.mock-subscriptions.json`
5. Displays:
   - Subscription Status: "Active" ✓
   - Charity Contribution: 10% or 15% ✓
   - Mock scores and winnings ✓

---

## Storage & Persistence

### `.mock-users.json` (User Accounts)
```json
{
  "test@example.com": {
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "id": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

### `.mock-subscriptions.json` (Active Subscriptions)
```json
{
  "user_id_1": {
    "id": "sub_1699999999_abc12345",
    "userId": "user_id_1",
    "email": "test@example.com",
    "plan": "monthly",
    "amount": 29.99,
    "charityId": "charity_2",
    "charityPercentage": 10,
    "status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "nextBillingDate": "2024-02-14T10:30:00.000Z"
  }
}
```

### Browser localStorage
- `authToken`: JWT token
- `user`: User object `{id, email, fullName}`
- `subscription`: Subscription data after checkout

---

## Mock Data Available

### Test Charities (8 Available)
1. **World Wildlife Fund (WWF)** - Wildlife conservation
2. **Médecins Sans Frontières** - Emergency medical aid
3. **Save the Children** - Child welfare programs
4. **The Nature Conservancy** - Environmental protection
5. **Oxfam** - Poverty alleviation
6. **Cancer Research UK** - Cancer research
7. **UNICEF** - Children's aid
8. **International Red Cross** - Humanitarian aid

All available via `GET /api/charities`

### Test Scores (Dashboard Mock Data)
- Multiple sample golf scores shown on dashboard
- Used for UI testing

### Test Winnings (Dashboard Mock Data)
- Sample prize winnings displayed
- Used for UI testing

---

## Features NOT Yet Implemented (Future)

❌ Cancellation of subscriptions  
❌ Plan upgrades/downgrades  
❌ Subscription management dashboard  
❌ Email notifications for renewal  
❌ Real Stripe payment integration  
❌ Webhook handling for payment events  
❌ Invoice generation  
❌ Tax calculation  

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/auth` | POST | Register/Login user | No |
| `/api/charities` | GET | List available charities | Optional |
| `/api/checkout` | POST | Create subscription | Cookies |
| `/api/dashboard` | GET | Get user dashboard | Cookies |
| `/api/dashboard` | PUT | Update profile/subscription | Cookies |

---

## Development Notes

### Environment
- **Framework**: Next.js 16.2.2 with Turbopack
- **Runtime**: Node.js with file system access
- **Storage**: JSON files (no database needed)
- **Port**: `http://localhost:3000`

### Running the Application
```bash
npm run dev
```

### Testing Checklist
- [x] User can register new account
- [x] User can login with existing account
- [x] User data persists across browser refreshes
- [x] User can select charity during signup
- [x] User can select subscription plan
- [x] Subscription is created on checkout
- [x] Subscription appears in dashboard
- [x] Subscription data persists across server restarts
- [x] Payment success page shows correct details
- [x] Dashboard shows active subscription status
- [x] Charity percentage displayed correctly
- [x] Next billing date calculated correctly

---

## Troubleshooting

### "Unauthorized" on Payment Button
**Cause**: User not logged in or user data not in localStorage  
**Fix**: Logout and login again, or register new account

### "Please select a charity" Error
**Cause**: No charity selected in dropdown  
**Fix**: Click charity dropdown and select one

### Subscription Not Showing in Dashboard
**Cause**: User cookies not set or server restarted  
**Fix**: 
1. Logout and login again
2. Go through complete subscription flow
3. Check browser DevTools → Application → Cookies for `userId` and `userEmail`

### Server Error "Failed to fetch dashboard"
**Cause**: Cookies not sent with request  
**Fix**: Ensure login was successful and cookies are set

---

## Summary

✅ **All 5 Core Features Implemented:**
1. ✅ Plans - Monthly ($29.99, 10%) and Yearly ($299.99, 15%)
2. ✅ Gateway - Mock checkout endpoint with file persistence
3. ✅ Access Control - Login/registration required
4. ✅ Lifecycle - Subscription status and next billing dates
5. ✅ Validation - Real-time validation on all requests

🚀 **Ready for Local Testing** - No external services required!
