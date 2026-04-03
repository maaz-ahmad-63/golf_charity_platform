# Quick Subscription Test Guide

## 5-Minute Test Flow

### Prerequisites
- Dev server running: `npm run dev` (on `http://localhost:3000`)
- Browser DevTools open (for debugging)

---

## Test Steps

### 1️⃣ Login (1 min)
```
URL: http://localhost:3000/login
Email: test@example.com
Password: password123
Click: "Sign In"
Expected: Redirected to /dashboard
```

✅ Check browser DevTools → Application → localStorage:
- `authToken` should exist
- `user` should have `{id, email, fullName}`

✅ Check cookies:
- Should NOT have `userId` or `userEmail` yet (set on subscribe)

---

### 2️⃣ Navigate to Subscribe (1 min)
```
URL: http://localhost:3000/subscribe
Or click "Subscribe" on dashboard
```

✅ Verify page loads without errors  
✅ See 8 charities in dropdown  
✅ See 2 plan options: Monthly ($29.99) and Yearly ($299.99)  

---

### 3️⃣ Select Plan & Charity (1 min)
```
1. Select charity from dropdown
   - Choose any (e.g., "World Wildlife Fund")
2. Select plan
   - Monthly: 10% to charity = $2.99
   - Yearly: 15% to charity = $44.99
3. Click: "Continue to Payment"
```

✅ Check browser DevTools → Application → Cookies:
- Should now have `userId=...`
- Should now have `userEmail=...`

---

### 4️⃣ Verify Payment Success (2 min)
```
Expected: Redirected to /payment-success
```

✅ See subscription confirmation:
- Subscription ID (starts with `sub_`)
- Plan: monthly or yearly
- Amount: 29.99 or 299.99
- Charity %: 10 or 15
- Next Billing Date: calculated

✅ Click "Go to Dashboard"

---

### 5️⃣ Verify Dashboard Shows Subscription (0.5 min)
```
URL: http://localhost:3000/dashboard
```

✅ See stat cards at top:
- **Subscription Status**: "Active" (green indicator)
- **Charity Contribution**: 10% or 15%
- **Your Scores**: 2/5
- **Total Won**: $350.00

✅ Check localStorage:
- `subscription` should have full subscription data

---

## Verification Checklist

| Step | Status | Notes |
|------|--------|-------|
| 1. Login works | ✓ | Credentials: test@example.com / password123 |
| 2. Charities load | ✓ | 8 charities in dropdown |
| 3. Plans show pricing | ✓ | Monthly: $29.99, Yearly: $299.99 |
| 4. Cookies set on submit | ✓ | userId, userEmail in cookies |
| 5. Checkout succeeds | ✓ | Redirects to /payment-success |
| 6. Success page loads | ✓ | Shows subscription details |
| 7. Dashboard loads | ✓ | Shows "Active" subscription |
| 8. Subscription persists | ✓ | Check .mock-subscriptions.json |

---

## What's Being Tested

### ✅ Plans Feature
- Monthly plan: $29.99 with 10% charity
- Yearly plan: $299.99 with 15% charity
- Real-time price calculation on UI

### ✅ Gateway Feature  
- Mock checkout endpoint (no Stripe needed)
- File-based storage (`.mock-subscriptions.json`)
- Returns subscription confirmation

### ✅ Access Control Feature
- Login required to subscribe
- User data stored in localStorage
- Cookies validated on checkout

### ✅ Lifecycle Feature
- Subscription status: Active
- Next billing date calculated
- Displayed on dashboard and success page

### ✅ Validation Feature
- User authentication checked
- Plan type validated (monthly/yearly only)
- Charity percentage validated (10-100%)

---

## Files Modified for Testing

**New Files Created:**
- ✅ `/src/app/payment-success/page.tsx` - Success confirmation page
- ✅ `/SUBSCRIPTION_FEATURES.md` - Full feature documentation

**Files Updated:**
- ✅ `/src/app/subscribe/page.tsx` - Sets cookies before checkout
- ✅ `/src/app/login/page.tsx` - Stores user data in localStorage
- ✅ `/src/app/signup/page.tsx` - Stores user data in localStorage
- ✅ `/src/app/api/checkout/route.ts` - Mock checkout endpoint
- ✅ `/src/app/api/dashboard/route.ts` - Mock dashboard API with subscriptions

---

## Troubleshooting During Test

### 🔴 "Unauthorized" on Payment Button
```
1. Open DevTools → Application → Cookies
2. Check if userId and userEmail cookies are present
3. If not, logout and login again
4. Try subscribing again
```

### 🔴 "Failed to fetch charities"
```
1. Check network tab in DevTools
2. Verify /api/charities endpoint returns 8 charities
3. Restart dev server: npm run dev
```

### 🔴 Dashboard shows "Inactive"
```
1. Check DevTools → Application → localStorage
2. Verify subscription object exists
3. Check .mock-subscriptions.json file exists
4. Verify userId matches between localStorage and cookies
```

### 🔴 Page won't load
```
1. Check console for errors
2. Restart dev server: npm run dev
3. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. Clear cookies if stuck
```

---

## Success Indicators

🎯 **All 5 Subscription Features Working:**

```
✅ Plans
   └─ Monthly $29.99 (10% charity)
   └─ Yearly $299.99 (15% charity)

✅ Gateway  
   └─ Mock checkout creates subscription
   └─ Stored in .mock-subscriptions.json

✅ Access Control
   └─ Login required
   └─ User data in localStorage
   └─ Cookies validated on checkout

✅ Lifecycle
   └─ Status: Active
   └─ Next Billing: 30/365 days from now
   └─ Displays on dashboard

✅ Validation
   └─ User must be logged in
   └─ Plan must be valid
   └─ Charity % must be 10-100%
```

---

## Next Steps After Testing

Once subscription flow is verified working:

1. **Add more test users**: Create more accounts for load testing
2. **Test cancellation**: Implement cancel subscription feature
3. **Add upgrade/downgrade**: Let users change plans
4. **Implement real Stripe**: When ready, swap mock checkout with real Stripe integration
5. **Add email notifications**: Send confirmation emails
6. **Add subscription management**: Allow users to manage their subscription

---

## Files Location for Reference

```
/Users/maazahmad/Desktop/FlutterDev/golf-charity-platform/
├── src/app/
│   ├── subscribe/page.tsx (Updated - Sets cookies before checkout)
│   ├── login/page.tsx (Updated - Stores user in localStorage)
│   ├── signup/page.tsx (Updated - Stores user in localStorage)
│   ├── payment-success/page.tsx (New - Success confirmation)
│   ├── dashboard/page.tsx (Shows subscription status)
│   └── api/
│       ├── checkout/route.ts (Mock - Creates subscription)
│       ├── dashboard/route.ts (Mock - Returns subscription data)
│       └── charities/route.ts (Mock - Returns 8 charities)
├── .mock-subscriptions.json (Created on first checkout)
├── .mock-users.json (Created on first signup/login)
└── SUBSCRIPTION_FEATURES.md (Full documentation)
```

---

**Time to Complete**: ~5 minutes  
**Success Rate**: Should be 100% if all features working  
**Restart Required**: No (data persists across server restarts)
