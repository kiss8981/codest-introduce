import "server-only";
import { z } from "zod";
import { renderNotification } from "./render";

const email = z.email();
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
    type: z.enum(["inquiry_received.v1", "notice.v1"]),
    payload: z.record(z.string(), z.string()),
  })
  .strict();

export function validateNotification(input: unknown) {
  const parsed = notificationSchema.parse(input);
  renderNotification(parsed.type, parsed.payload);
  return parsed;
}
