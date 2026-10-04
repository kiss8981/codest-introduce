import "server-only";
import { z } from "zod";

const email = z.email();
export type DeliveryStatus = "sent" | "failed" | "needs_review";
export const reciptSchema = z
  .object({
    from: z.object({ name: z.string().max(100).optional(), address: email }).strict(),
    replyTo: z.array(email).max(10).optional(),
    bcc: z.array(email).max(10).optional(),
  })
  .strict();

const notificationSchema = z
  .object({
    to: email,
    recipt: reciptSchema,
    type: z.literal("inquiry_received.v1"),
    payload: z.record(z.string(), z.string()),
  })
  .strict();

export const notificationWebhook = z.object({
  type: z.literal("INSERT"),
  table: z.literal("notification"),
  schema: z.literal("public"),
  record: z.object({
    id: z.string().uuid(),
    to: z.string(),
    recipt: z.unknown(),
    type: z.string(),
    payload: z.unknown(),
    status: z.literal("pending"),
  }),
});

export function validateNotification(input: unknown) {
  return notificationSchema.parse(input);
}
