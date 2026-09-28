"use client";

import type { AdminPortfolio } from "@/lib/portfolio/admin/types";

const section = "border-t border-[#dbe4e9] pt-8";

type Props = {
  value: AdminPortfolio;
  onChange: (value: AdminPortfolio) => void;
};

export default function PortfolioLinks({ value, onChange }: Props) {
  function change<K extends keyof AdminPortfolio>(key: K, next: AdminPortfolio[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <section className={section}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-[#152737]">관련 링크</h3>
        <button
          type="button"
          className="text-sm font-bold text-[#136b9f]"
          onClick={() =>
            change("links", [
              ...value.links,
              { type: "preview", label: null, url: "", sort_order: value.links.length },
            ])
          }
        >
          + 링크 추가
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {value.links.map((link, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-lg bg-[#f7f9fa] p-3 sm:grid-cols-[130px_1fr_1fr_auto]"
          >
            <input
              aria-label="링크 종류"
              className="rounded-md border border-[#d3dee5] px-3 py-2 text-sm"
              value={link.type}
              onChange={(event) =>
                change(
                  "links",
                  value.links.map((item, i) =>
                    i === index ? { ...item, type: event.target.value } : item,
                  ),
                )
              }
              placeholder="preview"
            />
            <input
              aria-label="링크 이름"
              className="rounded-md border border-[#d3dee5] px-3 py-2 text-sm"
              value={link.label ?? ""}
              onChange={(event) =>
                change(
                  "links",
                  value.links.map((item, i) =>
                    i === index ? { ...item, label: event.target.value || null } : item,
                  ),
                )
              }
              placeholder="표시 이름 (선택)"
            />
            <input
              aria-label="링크 주소"
              className="rounded-md border border-[#d3dee5] px-3 py-2 text-sm"
              type="url"
              value={link.url}
              onChange={(event) =>
                change(
                  "links",
                  value.links.map((item, i) =>
                    i === index ? { ...item, url: event.target.value } : item,
                  ),
                )
              }
              placeholder="https://"
            />
            <button
              type="button"
              className="px-2 text-sm font-semibold text-[#a84646]"
              onClick={() =>
                change(
                  "links",
                  value.links
                    .filter((_, i) => i !== index)
                    .map((item, i) => ({ ...item, sort_order: i })),
                )
              }
            >
              삭제
            </button>
          </div>
        ))}
        {!value.links.length && <p className="text-sm text-[#718493]">등록된 링크가 없습니다.</p>}
      </div>
    </section>
  );
}
