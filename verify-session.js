import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: "STRIPE_SECRET_KEY is not configured." });

  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).json({ error: "Missing session_id." });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
    const subscription = session.subscription;
    const active = session.payment_status === "paid" &&
      subscription && ["active", "trialing"].includes(subscription.status);

    return res.status(200).json({
      active,
      customer: session.customer || null,
      subscriptionStatus: subscription?.status || null
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Could not verify checkout." });
  }
}
