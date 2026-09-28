"use client";

import Image from "next/image";
import type { AdminPortfolio } from "@/lib/portfolio/admin/types";

const field =
  "mt-2 w-full rounded-lg border border-[#cbd5df] bg-white px-4 py-3 text-[15px] text-[#182b39] outline-none focus:border-[#2587bd]";
const label = "block text-sm font-semibold text-[#253846]";
const section = "border-t border-[#dbe4e9] pt-8";

type Props = {
  value: AdminPortfolio;
  onChange: (value: AdminPortfolio) => void;
  onUpload: (files: FileList) => void;
  onDeletePhoto: (id: string) => void;
  busy: boolean;
};

export default function PortfolioPhotos({ value, onChange, onUpload, onDeletePhoto, busy }: Props) {
  function change<K extends keyof AdminPortfolio>(key: K, next: AdminPortfolio[K]) {
    onChange({ ...value, [key]: next });
  }

  function updatePhoto(id: string, patch: Partial<AdminPortfolio["photos"][number]>) {
    change(
      "photos",
      value.photos.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo)),
    );
  }

  function movePhoto(index: number, direction: number) {
    const visible = value.photos
      .filter((photo) => photo.gallery_order !== null)
      .sort((a, b) => (a.gallery_order ?? 0) - (b.gallery_order ?? 0));
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= visible.length) return;
    [visible[index], visible[nextIndex]] = [visible[nextIndex], visible[index]];
    const order = new Map(visible.map((photo, position) => [photo.id, position]));
    change(
      "photos",
      value.photos.map((photo) => ({ ...photo, gallery_order: order.get(photo.id) ?? null })),
    );
  }

  const visiblePhotos = value.photos
    .filter((photo) => photo.gallery_order !== null)
    .sort((a, b) => (a.gallery_order ?? 0) - (b.gallery_order ?? 0));

  return (
    <section className={section}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[#152737]">사진</h3>
          <p className="mt-1 text-sm text-[#627585]">
            사진을 고르면 프로젝트가 먼저 저장되고 바로 업로드됩니다. 장당 최대 20MB입니다.
          </p>
        </div>
        <label className="cursor-pointer rounded-full border border-[#a8c4d4] px-5 py-2.5 text-sm font-bold text-[#145b86] hover:bg-[#edf6fb]">
          사진 추가
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            multiple
            disabled={busy}
            onChange={(event) => {
              if (event.target.files?.length) onUpload(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      </div>
      {value.photos.length ? (
        <div className="mt-5 space-y-3">
          {value.photos.map((photo) => {
            const position = visiblePhotos.findIndex((item) => item.id === photo.id);
            return (
              <div
                key={photo.id}
                className="grid gap-3 rounded-lg border border-[#e0e7ec] p-3 sm:grid-cols-[100px_1fr_auto] sm:items-center"
              >
                <Image
                  unoptimized
                  src={photo.public_url}
                  alt={photo.alt_text || photo.filename}
                  width={100}
                  height={76}
                  className="h-[76px] w-[100px] rounded-md bg-[#eef3f6] object-cover"
                />
                <div className="min-w-0 space-y-2">
                  <p className="truncate text-xs text-[#728493]">{photo.filename}</p>
                  <input
                    className="w-full rounded-md border border-[#d3dee5] px-3 py-2 text-sm"
                    aria-label={`${photo.filename} 대체 텍스트`}
                    value={photo.alt_text}
                    maxLength={300}
                    onChange={(event) => updatePhoto(photo.id, { alt_text: event.target.value })}
                    placeholder="사진 설명"
                  />
                  <label className="flex items-center gap-2 text-xs text-[#4b6171]">
                    <input
                      type="checkbox"
                      checked={photo.gallery_order !== null}
                      onChange={(event) =>
                        updatePhoto(photo.id, {
                          gallery_order: event.target.checked ? visiblePhotos.length : null,
                        })
                      }
                    />{" "}
                    상세 상단에 표시
                  </label>
                </div>
                <div className="flex gap-2 text-xs font-semibold text-[#245f83] sm:flex-col">
                  {position >= 0 && (
                    <>
                      <button
                        type="button"
                        disabled={busy || position === 0}
                        onClick={() => movePhoto(position, -1)}
                      >
                        위로
                      </button>
                      <button
                        type="button"
                        disabled={busy || position === visiblePhotos.length - 1}
                        onClick={() => movePhoto(position, 1)}
                      >
                        아래로
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    className="text-[#a84646]"
                    onClick={() => onDeletePhoto(photo.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-5 rounded-lg border border-dashed border-[#cbd5df] p-8 text-center text-sm text-[#718493]">
          아직 등록한 사진이 없습니다.
        </p>
      )}
      {value.photos.length > 0 && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className={label}>
            목록 대표 사진
            <select
              className={field}
              value={value.thumbnail_photo_id ?? ""}
              onChange={(event) => change("thumbnail_photo_id", event.target.value || null)}
            >
              <option value="">선택 안 함</option>
              {value.photos.map((photo) => (
                <option key={photo.id} value={photo.id}>
                  {photo.filename}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            모바일 대표 사진
            <select
              className={field}
              value={value.mobile_thumbnail_photo_id ?? ""}
              onChange={(event) => change("mobile_thumbnail_photo_id", event.target.value || null)}
            >
              <option value="">목록 대표 사진 사용</option>
              {value.photos.map((photo) => (
                <option key={photo.id} value={photo.id}>
                  {photo.filename}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </section>
  );
}
