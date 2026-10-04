import "server-only";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/http";

type PhotoRecord = {
  portfolioId: string;
  storageKey: string;
  filename: string;
  altText: string;
  size: number;
  mimeType: string;
};

export async function insertPhoto(input: PhotoRecord) {
  const client = db();
  const orderResult = await client
    .from("photo_map")
    .select("gallery_order")
    .eq("portfolio_id", input.portfolioId)
    .not("gallery_order", "is", null)
    .order("gallery_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (orderResult.error) throw new ApiError("사진 순서를 확인하지 못했습니다.", 500);
  const { data, error } = await client
    .from("photo_map")
    .insert({
      portfolio_id: input.portfolioId,
      storage_key: input.storageKey,
      filename: input.filename,
      file_size_bytes: input.size,
      mime_type: input.mimeType,
      alt_text: input.altText,
      gallery_order: (orderResult.data?.gallery_order ?? -1) + 1,
    })
    .select("*")
    .single();
  if (error) throw new ApiError("사진 정보를 저장하지 못했습니다.", 500);
  return data;
}

export async function removePhoto(portfolioId: string, photoId: string) {
  const client = db();
  const { data: photo, error } = await client
    .from("photo_map")
    .select("storage_key")
    .eq("id", photoId)
    .eq("portfolio_id", portfolioId)
    .maybeSingle();
  if (error || !photo) throw new ApiError("사진을 찾을 수 없습니다.", 404);
  const { data: cover, error: coverError } = await client
    .from("portfolio")
    .select("thumbnail_photo_id,mobile_thumbnail_photo_id")
    .eq("id", portfolioId)
    .single();
  if (coverError) throw new ApiError("대표 사진을 확인하지 못했습니다.", 500);
  if (cover.thumbnail_photo_id === photoId || cover.mobile_thumbnail_photo_id === photoId) {
    const cleared = await client
      .from("portfolio")
      .update({
        thumbnail_photo_id: cover.thumbnail_photo_id === photoId ? null : cover.thumbnail_photo_id,
        mobile_thumbnail_photo_id:
          cover.mobile_thumbnail_photo_id === photoId ? null : cover.mobile_thumbnail_photo_id,
      })
      .eq("id", portfolioId);
    if (cleared.error) throw new ApiError("대표 사진 설정을 해제하지 못했습니다.", 500);
  }
  const deleted = await client
    .from("photo_map")
    .delete()
    .eq("id", photoId)
    .eq("portfolio_id", portfolioId);
  if (deleted.error) throw new ApiError("사진을 삭제하지 못했습니다.", 500);
  return photo.storage_key;
}
