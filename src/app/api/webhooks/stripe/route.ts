import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseServer } from '@/lib/db/utils';
import { 
  getStripeWebhookEvent, 
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted 
} from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    const event = getStripeWebhookEvent(Buffer.from(body), signature);

    switch (event.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);

        // Update user subscription status in database
        const { error } = await supabaseServer
          .from('users')
          .update({
            subscription_status: 'active',
            stripe_subscription_id: subscription.id,
            subscription_start_date: new Date((subscription as any).created * 1000).toISOString(),
            subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
          })
          .eq('stripe_customer_id', subscription.customer);

        if (error) {
          console.error('Error updating subscription:', error);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);

        const status = subscription.status === 'active' ? 'active' : 'inactive';

        const { error } = await supabaseServer
          .from('users')
          .update({
            subscription_status: status,
            subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);

        const { error } = await supabaseServer
          .from('users')
          .update({
            subscription_status: 'cancelled',
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error cancelling subscription:', error);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded for invoice:', invoice.id);
        // Handle payment success logic here
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment failed for invoice:', invoice.id);
        // Update subscription status to past_due
        if ((invoice as any).subscription) {
          await supabaseServer
            .from('users')
            .update({ subscription_status: 'past_due' })
            .eq('stripe_subscription_id', (invoice as any).subscription);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
