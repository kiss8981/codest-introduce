"use client";

import { useState } from "react";
import type { AdminPortfolio } from "@/lib/portfolio/admin/types";

const field =
  "mt-2 w-full rounded-lg border border-[#cbd5df] bg-white px-4 py-3 text-[15px] text-[#182b39] outline-none focus:border-[#2587bd]";
const label = "block text-sm font-semibold text-[#253846]";
const section = "border-t border-[#dbe4e9] pt-8";

type Props = {
  value: AdminPortfolio;
  onChange: (value: AdminPortfolio) => void;
};

export default function PortfolioSettings({ value, onChange }: Props) {
  const [stackText, setStackText] = useState(value.stack.join(", "));
  function change<K extends keyof AdminPortfolio>(key: K, next: AdminPortfolio[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <section className={section}>
      <h3 className="text-lg font-bold text-[#152737]">추가 정보</h3>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <label className={label}>
          시작일
          <input
            className={field}
            type="date"
            value={value.started_at ?? ""}
            onChange={(event) => change("started_at", event.target.value || null)}
          />
        </label>
        <label className={label}>
          종료일
          <input
            className={field}
            type="date"
            value={value.ended_at ?? ""}
            onChange={(event) => change("ended_at", event.target.value || null)}
          />
        </label>
        <label className={`${label} sm:col-span-2`}>
          사용 기술 (쉼표로 구분)
          <input
            className={field}
            value={stackText}
            onChange={(event) => {
              setStackText(event.target.value);
              change(
                "stack",
                event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              );
            }}
            placeholder="Next.js, React, Supabase"
          />
        </label>
        <label className={label}>
          정렬 순서
          <input
            className={field}
            type="number"
            value={value.sort_order}
            onChange={(event) => change("sort_order", Number(event.target.value) || 0)}
          />
        </label>
      </div>
      <div className="mt-6 flex flex-wrap gap-5 text-sm font-semibold text-[#344d5e]">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.is_maintained}
            onChange={(event) => change("is_maintained", event.target.checked)}
          />
          현재 관리 중
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.featured}
            onChange={(event) => change("featured", event.target.checked)}
          />
          주요 프로젝트
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.is_published}
            onChange={(event) => change("is_published", event.target.checked)}
          />
          사이트에 공개
        </label>
      </div>
    </section>
  );
}
