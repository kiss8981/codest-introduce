import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/http";

const targets = {
  portfolio: {
    bucket: "portfolio",
    maxBytes: 20 * 1024 * 1024,
    extensions: {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
      "image/gif": "gif",
    },
  },
} as const;

export type UploadType = keyof typeof targets;
export type UploadMimeType = keyof (typeof targets)["portfolio"]["extensions"];

export async function signUpload(
  type: UploadType,
  ownerId: string,
  mimeType: UploadMimeType,
  size: number,
) {
  const target = targets[type];
  if (size <= 0 || size > target.maxBytes) throw new ApiError("사진은 20MB 이하로 올려주세요.");
  const storageKey = `${ownerId}/${randomUUID()}.${target.extensions[mimeType]}`;
  const { data, error } = await db().storage.from(target.bucket).createSignedUploadUrl(storageKey);
  if (error) throw new ApiError("업로드를 준비하지 못했습니다.", 500);
  return { storageKey, token: data.token };
}

export async function uploadedFile(type: UploadType, ownerId: string, storageKey: string) {
  const target = targets[type];
  if (!new RegExp(`^${ownerId}/[a-f0-9-]{36}\\.[a-z0-9]+$`).test(storageKey))
    throw new ApiError("업로드 경로를 확인해 주세요.");
  const { data, error } = await db().storage.from(target.bucket).info(storageKey);
  if (
    error ||
    !data?.size ||
    data.size > target.maxBytes ||
    !data.contentType ||
    !(data.contentType in target.extensions)
  )
    throw new ApiError("업로드된 파일을 확인하지 못했습니다.");
  return {
    size: data.size,
    mimeType: data.contentType,
    publicUrl: publicUploadUrl(type, storageKey),
  };
}

export function publicUploadUrl(type: UploadType, storageKey: string) {
  return db().storage.from(targets[type].bucket).getPublicUrl(storageKey).data.publicUrl;
}

export async function removeUpload(type: UploadType, keys: string[]) {
  if (!keys.length) return;
  const { error } = await db().storage.from(targets[type].bucket).remove(keys);
  if (error) console.error("storage_cleanup_failed", type, error.message);
}
