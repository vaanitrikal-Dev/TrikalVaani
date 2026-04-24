import { Router } from "express";
import crypto from "crypto";
import { supabase } from "../lib/supabase";

const webhookRouter = Router();

webhookRouter.post("/razorpay", async (req: any, res: any) => {
  try {
    const rawBody = req.body instanceof Buffer
      ? req.body.toString("utf8")
      : JSON.stringify(req.body);

    const signature = req.headers["x-razorpay-signature"] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    if (!signature || !webhookSecret) {
      return res.status(400).json({ error: "Missing signature" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = JSON.parse(rawBody);
    const eventId = req.headers["x-razorpay-event-id"] as string;
    const eventType = event.event as string;

    if (eventId) {
      const { data: existing } = await supabase
        .from("webhook_logs")
        .select("id")
        .eq("event_id", eventId)
        .single();

      if (existing) {
        return res.status(200).json({ status: "already_processed" });
      }
    }

    await supabase.from("webhook_logs").insert({
      event_id: eventId || `evt_${Date.now()}`,
      event_type: eventType,
      payload: event,
      processed_at: new Date().toISOString(),
    });

    switch (eventType) {
      case "payment.captured": {
        const payment = event.payload?.payment?.entity;
        if (!payment) break;
        await supabase
          .from("payments")
          .update({
            status: "success",
            razorpay_payment_id: payment.id,
            captured_at: new Date().toISOString(),
          })
          .eq("razorpay_order_id", payment.order_id);
        break;
      }
      case "payment.failed": {
        const payment = event.payload?.payment?.entity;
        if (!payment) break;
        await supabase
          .from("payments")
          .update({
            status: "failed",
            razorpay_payment_id: payment.id,
            failure_reason: payment.error_description,
            failed_at: new Date().toISOString(),
          })
          .eq("razorpay_order_id", payment.order_id);
        break;
      }
      case "refund.created": {
        const refund = event.payload?.refund?.entity;
        if (!refund) break;
        await supabase.from("refunds").insert({
          razorpay_refund_id: refund.id,
          razorpay_payment_id: refund.payment_id,
          amount: refund.amount / 100,
          status: refund.status,
          created_at: new Date().toISOString(),
        });
        break;
      }
      default:
        console.log(`Unhandled event: ${eventType}`);
    }

    return res.status(200).json({ status: "ok" });

  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(200).json({ status: "error_logged" });
  }
});

export { webhookRouter };