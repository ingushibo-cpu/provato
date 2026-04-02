import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@provato/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: pi.id },
          data: { status: "ESCROWED" },
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: pi.id },
          data: { status: "REFUNDED" },
        });
        break;
      }

      case "transfer.created": {
        // Payout to talent — mark as RELEASED
        const transfer = event.data.object as Stripe.Transfer;
        const paymentIntentId = transfer.source_transaction as string | null;
        if (paymentIntentId) {
          await prisma.payment.updateMany({
            where: { stripePaymentIntentId: paymentIntentId },
            data: { status: "RELEASED" },
          });
        }
        break;
      }

      default:
        // Unhandled event types ignored
        break;
    }
  } catch {
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response(null, { status: 200 });
}
