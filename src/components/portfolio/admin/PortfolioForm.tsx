"use client";

import type { AdminPortfolio } from "@/lib/portfolio/admin/types";
import MarkdownEditor from "./MarkdownEditor";
import PortfolioLinks from "./PortfolioLinks";
import PortfolioPhotos from "./PortfolioPhotos";
import PortfolioSettings from "./PortfolioSettings";

const field =
  "mt-2 w-full rounded-lg border border-[#cbd5df] bg-white px-4 py-3 text-[15px] text-[#182b39] outline-none focus:border-[#2587bd]";
const label = "block text-sm font-semibold text-[#253846]";
const section = "border-t border-[#dbe4e9] pt-8";

type Props = {
  value: AdminPortfolio;
  onChange: (value: AdminPortfolio) => void;
  onSave: () => void;
  onUpload: (files: FileList) => void;
  onDeletePhoto: (id: string) => void;
  onDelete: () => void;
  busy: boolean;
};

export default function PortfolioForm({
  value,
  onChange,
  onSave,
  onUpload,
  onDeletePhoto,
  onDelete,
  busy,
}: Props) {
  function change<K extends keyof AdminPortfolio>(key: K, next: AdminPortfolio[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="min-w-0 space-y-9 rounded-xl border border-[#e0e7ec] bg-white p-5 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-[-0.04em] text-[#152737]">
            {value.id ? "프로젝트 수정" : "새 프로젝트"}
          </h2>
          <p className="mt-2 text-sm text-[#627585]">
            내용을 작성하고 사진을 올린 뒤 공개 여부를 선택하세요.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={onSave}
          className="rounded-full bg-[#136b9f] px-6 py-3 text-sm font-bold text-white hover:bg-[#0b527e] disabled:opacity-50"
        >
          변경사항 저장
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={`${label} sm:col-span-2`}>
          프로젝트 이름 *
          <input
            className={field}
            required
            maxLength={150}
            value={value.name}
            onChange={(event) => change("name", event.target.value)}
            placeholder="예: 우리동네 예약 서비스"
          />
        </label>
        <label className={label}>
          주소 이름 *
          <input
            className={field}
            required
            maxLength={80}
            value={value.slug}
            onChange={(event) =>
              change("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
            }
            placeholder="예: local-reservation"
          />
        </label>
        <label className={label}>
          분류
          <input
            className={field}
            maxLength={80}
            value={value.category}
            onChange={(event) => change("category", event.target.value)}
            placeholder="웹 서비스"
          />
        </label>
        <label className={`${label} sm:col-span-2`}>
          한 줄 소개 *
          <input
            className={field}
            required
            maxLength={300}
            value={value.summary}
            onChange={(event) => change("summary", event.target.value)}
            placeholder="목록에 표시할 짧은 설명"
          />
        </label>
      </div>

      <section className={section}>
        <h3 className="text-lg font-bold text-[#152737]">프로젝트 소개</h3>
        <p className="mb-4 mt-1 text-sm text-[#627585]">
          서식 버튼으로 간단하게 소개글을 작성하세요.
        </p>
        <MarkdownEditor
          key={value.id || "new"}
          value={value.description}
          onChange={(next) => change("description", next)}
        />
      </section>

      <PortfolioPhotos
        value={value}
        onChange={onChange}
        onUpload={onUpload}
        onDeletePhoto={onDeletePhoto}
        busy={busy}
      />
      <PortfolioLinks value={value} onChange={onChange} />
      <PortfolioSettings value={value} onChange={onChange} />
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#dbe4e9] pt-7">
        {value.id ? (
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="text-sm font-semibold text-[#a84646] hover:underline"
          >
            프로젝트 삭제
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          disabled={busy}
          onClick={onSave}
          className="rounded-full bg-[#136b9f] px-7 py-3 text-sm font-bold text-white hover:bg-[#0b527e] disabled:opacity-50"
        >
          변경사항 저장
        </button>
      </div>
    </div>
  );
}
