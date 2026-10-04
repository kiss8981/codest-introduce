import { z } from "zod";

export const portfolioRow = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  summary: z.string(),
  description: z.string(),
  category: z.string(),
  stack: z.array(z.string()),
  started_at: z.string().nullable(),
  ended_at: z.string().nullable(),
  is_maintained: z.boolean(),
  featured: z.boolean(),
  thumbnail_photo_id: z.string().uuid().nullable(),
  mobile_thumbnail_photo_id: z.string().uuid().nullable(),
  updated_at: z.string(),
});

export const photoRow = z.object({
  id: z.string().uuid(),
  portfolio_id: z.string().uuid(),
  storage_key: z.string(),
  alt_text: z.string(),
  gallery_order: z.number().int().nullable(),
  created_at: z.string(),
});

export const urlRow = z.object({
  id: z.string().uuid(),
  portfolio_id: z.string().uuid(),
  type: z.string(),
  label: z.string().nullable(),
  url: z.string(),
  sort_order: z.number().int(),
});
