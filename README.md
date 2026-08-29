# WebFoundry AI V4 — Payments

V4 adds Stripe subscription checkout to WebFoundry.

Included:
- AI generation + AI editing
- Stripe Checkout for Starter / Growth / Pro
- Server-side Stripe secret key
- Server-side subscription verification
- Publish button locked until payment is verified

Set these Vercel environment variables:
OPENAI_API_KEY
STRIPE_SECRET_KEY
STRIPE_PRICE_STARTER
STRIPE_PRICE_GROWTH
STRIPE_PRICE_PRO

Create recurring monthly Stripe prices for $19, $39, and $79 and copy their Price IDs into Vercel.

Use Stripe test mode first.

V4 verifies payment but does not yet permanently host each customer-generated website. The next version needs persistent database storage plus public customer URLs/custom domains.
