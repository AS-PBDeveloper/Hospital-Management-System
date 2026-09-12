import type { Request, Response } from "express";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { Webhook } from "standardwebhooks";
import invoice from "../models/invoice";

const getWebhookHeaders = (req: Request) => ({
  "webhook-id": req.header("webhook-id") || "",
  "webhook-timestamp": req.header("webhook-timestamp") || "",
  "webhook-signature": req.header("webhook-signature") || "",
});

const verifyPolarEvent = (body: Buffer, headers: Record<string, string>) => {
  const secret = process.env.POLAR_WEBHOOK_SECRET || "";

  try {
    return validateEvent(body, headers, secret);
  } catch (error) {
    if (!(error instanceof WebhookVerificationError)) {
      throw error;
    }

    return new Webhook(secret).verify(body, headers);
  }
};

export const handlePolarWebhook = async (req: Request, res: Response) => {
  try {
    const event = verifyPolarEvent(req.body, getWebhookHeaders(req)) as any;
    const { data, type } = event;

    if (
      (type === "order.paid" ||
        type === "order.created" ||
        type === "order.updated") &&
      data.paid
    ) {
      const invoiceId = data.metadata?.hospitalInvoiceId;
      if (invoiceId) {
        await invoice.findByIdAndUpdate(invoiceId, {
          status: "paid",
        });
        console.log(`Invoice ${invoiceId} marked as PAID via Polar!`);
      }
    }

    return res.status(202).json({ received: true });
  } catch (error) {
    console.error("Polar Webhook Error:", error);
    return res.status(400).json({ message: "Webhook signature verification failed" });
  }
};
