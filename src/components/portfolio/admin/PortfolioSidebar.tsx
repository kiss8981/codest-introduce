"use client";

import type { AdminPortfolio } from "@/lib/portfolio/admin/types";

type Props = {
  projects: AdminPortfolio[];
  activeId?: string;
  onNew: () => void;
  onSelect: (project: AdminPortfolio) => void;
};

export default function PortfolioSidebar({ projects, activeId, onNew, onSelect }: Props) {
  return (
    <aside className="self-start rounded-xl border border-[#e0e7ec] bg-white p-4 lg:sticky lg:top-6">
      <div className="flex items-center justify-between gap-2 px-2 py-2">
        <h1 className="font-bold">프로젝트</h1>
        <span className="text-xs text-[#718493]">{projects.length}건</span>
      </div>
      <button
        type="button"
        onClick={onNew}
        className="mt-3 w-full rounded-lg bg-[#eaf4fa] px-4 py-3 text-left text-sm font-bold text-[#136b9f] hover:bg-[#d8edf8]"
      >
        + 새 프로젝트
      </button>
      <div className="mt-4 max-h-[50vh] space-y-1 overflow-y-auto lg:max-h-[calc(100vh-180px)]">
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onSelect(project)}
            className={`w-full rounded-lg px-4 py-3 text-left text-sm hover:bg-[#f1f6f9] ${activeId === project.id ? "bg-[#eaf4fa]" : ""}`}
          >
            <span className="block truncate font-semibold">{project.name}</span>
            <span className="mt-1 block text-xs text-[#718493]">
              {project.is_published ? "공개" : "비공개"} · /{project.slug}
            </span>
          </button>
        ))}
        {!projects.length && (
          <p className="px-3 py-5 text-sm text-[#718493]">아직 등록된 프로젝트가 없습니다.</p>
        )}
      </div>
    </aside>
  );
}
