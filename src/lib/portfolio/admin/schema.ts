import { z } from "zod";
import { ApiError } from "@/lib/http";

const uuid = z.string().uuid();

export const portfolioInput = z.object({
  id: uuid.optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9][a-z0-9-]{0,79}$/, "주소는 영문 소문자, 숫자, 하이픈만 입력해 주세요."),
  name: z.string().trim().min(1).max(150),
  summary: z.string().trim().min(1).max(300),
  description: z.string().max(50000),
  category: z.string().trim().min(1).max(80),
  stack: z.array(z.string().trim().min(1).max(50)).max(30),
  started_at: z.iso.date().nullable(),
  ended_at: z.iso.date().nullable(),
  is_maintained: z.boolean(),
  is_published: z.boolean(),
  featured: z.boolean(),
  sort_order: z.number().int(),
  thumbnail_photo_id: uuid.nullable(),
  mobile_thumbnail_photo_id: uuid.nullable(),
  links: z
    .array(
      z.object({
        id: uuid.optional(),
        type: z.string().trim().min(1).max(40),
        label: z.string().trim().max(80).nullable(),
        url: z.url().startsWith("https://").max(2048),
        sort_order: z.number().int().min(0),
      }),
    )
    .max(30),
  photos: z
    .array(
      z.object({
        id: uuid,
        alt_text: z.string().max(300),
        gallery_order: z.number().int().min(0).nullable(),
      }),
    )
    .max(100),
});

export type PortfolioInput = z.infer<typeof portfolioInput>;

export function parsePortfolioInput(value: unknown): PortfolioInput {
  const result = portfolioInput.safeParse(value);
  if (!result.success)
    throw new ApiError(result.error.issues[0]?.message ?? "입력 내용을 확인해 주세요.");
  return result.data;
}

export const uploadInput = z.discriminatedUnion("stage", [
  z.object({
    stage: z.literal("sign"),
    portfolioId: uuid,
    filename: z.string().trim().min(1).max(255),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]),
    size: z
      .number()
      .int()
      .positive()
      .max(20 * 1024 * 1024),
  }),
  z.object({
    stage: z.literal("complete"),
    portfolioId: uuid,
    storageKey: z.string().max(500),
    filename: z.string().trim().min(1).max(255),
    altText: z.string().max(300),
  }),
]);

export const deleteInput = z.object({ portfolioId: uuid, photoId: uuid });

export const projectIdInput = z.object({ id: uuid });

export function parseProjectId(value: unknown) {
  const result = projectIdInput.safeParse(value);
  if (!result.success) throw new ApiError("프로젝트 ID가 올바르지 않습니다.");
  return result.data.id;
}

export function parseUploadInput(value: unknown) {
  const result = uploadInput.safeParse(value);
  if (!result.success) throw new ApiError("사진 정보를 확인해 주세요.");
  return result.data;
}

export function parseDeletePhoto(value: unknown) {
  const result = deleteInput.safeParse(value);
  if (!result.success) throw new ApiError("사진 정보를 확인해 주세요.");
  return result.data;
}
