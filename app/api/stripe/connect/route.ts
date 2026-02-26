import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe non configuré. Ajoute STRIPE_SECRET_KEY dans .env.local." },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const account = await stripe.accounts.create({
    type: "express"
  });

  return NextResponse.json({ accountId: account.id });
}
