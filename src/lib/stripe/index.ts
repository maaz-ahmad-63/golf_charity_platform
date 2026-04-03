import Stripe from 'stripe';

// Provide default during build, will be overridden at runtime
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-12-2.acacia',
});

export const STRIPE_PRODUCTS = {
  MONTHLY: process.env.STRIPE_MONTHLY_PRICE_ID,
  YEARLY: process.env.STRIPE_YEARLY_PRICE_ID,
};

export async function createOrGetStripeCustomer(email: string, name: string) {
  // Search for existing customer
  const customers = await stripe.customers.list({ email, limit: 1 });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  // Create new customer
  return stripe.customers.create({ email, name });
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
) {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata,
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['customer'],
  });
}

export function getStripeWebhookEvent(body: Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_placeholder';
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

// Webhook event handlers
export const handleSubscriptionCreated = async (subscription: Stripe.Subscription) => {
  // This will be called from webhook handler
  console.log('Subscription created:', subscription.id);
};

export const handleSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
  // This will be called from webhook handler
  console.log('Subscription updated:', subscription.id);
};

export const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  // This will be called from webhook handler
  console.log('Subscription deleted:', subscription.id);
};

export async function createPaymentIntent(
  customerId: string,
  amount: number,
  currency = 'usd'
) {
  return stripe.paymentIntents.create({
    customer: customerId,
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    payment_method_types: ['card'],
  });
}
