"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminPhoto, AdminPortfolio } from "@/lib/portfolio/admin/types";
import PortfolioForm from "./PortfolioForm";
import PortfolioSidebar from "./PortfolioSidebar";

function blank(): AdminPortfolio {
  return {
    id: "",
    slug: "",
    name: "",
    summary: "",
    description: "",
    category: "프로젝트",
    stack: [],
    started_at: null,
    ended_at: null,
    is_maintained: false,
    is_published: false,
    featured: false,
    sort_order: 0,
    thumbnail_photo_id: null,
    mobile_thumbnail_photo_id: null,
    photos: [],
    links: [],
  };
}

export default function PortfolioWorkspace({
  client,
  onLogout,
}: {
  client: SupabaseClient;
  onLogout: () => void;
}) {
  const [projects, setProjects] = useState<AdminPortfolio[]>([]);
  const [active, setActive] = useState<AdminPortfolio | null>(null);
  const [selectionKey, setSelectionKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const call = useCallback(
    async <T,>(path: string, method = "GET", body?: unknown): Promise<T> => {
      if (!client) throw new Error("Supabase 연결을 설정해 주세요.");
      const { data } = await client.auth.getSession();
      if (!data.session) throw new Error("다시 로그인해 주세요.");
      const response = await fetch(path, {
        method,
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "요청을 처리하지 못했습니다.");
      return result as T;
    },
    [client],
  );

  const load = useCallback(
    async (selectedId?: string) => {
      const { projects: loaded } = await call<{ projects: AdminPortfolio[] }>(
        "/api/admin/portfolio",
      );
      setProjects(loaded);
      const selected = loaded.find((project) => project.id === selectedId) ?? loaded[0] ?? null;
      setActive(selected ? structuredClone(selected) : null);
      setSelectionKey((current) => current + 1);
    },
    [call],
  );

  useEffect(() => {
    let mounted = true;
    client.auth
      .getSession()
      .then(() => load())
      .catch((error) => {
        if (mounted)
          setMessage(error instanceof Error ? error.message : "목록을 불러오지 못했습니다.");
      });
    return () => {
      mounted = false;
    };
  }, [client, load]);

  async function persist(record: AdminPortfolio) {
    const { id } = await call<{ id: string }>(
      "/api/admin/portfolio",
      record.id ? "PATCH" : "POST",
      record,
    );
    return id;
  }

  async function save() {
    if (!active) return;
    setBusy(true);
    setMessage("");
    try {
      const id = await persist(active);
      await load(id);
      setMessage("저장했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "저장하지 못했습니다.");
    }
    setBusy(false);
  }

  async function upload(files: FileList) {
    if (!active || !client) return;
    setBusy(true);
    setMessage("");
    try {
      const id = active.id || (await persist(active));
      const draft: AdminPortfolio = { ...active, id, photos: [...active.photos] };
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) throw new Error("이미지 파일만 올릴 수 있습니다.");
        const signed = await call<{ storageKey: string; token: string }>(
          "/api/admin/portfolio/upload",
          "POST",
          {
            stage: "sign",
            portfolioId: id,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
          },
        );
        const uploaded = await client.storage
          .from("portfolio")
          .uploadToSignedUrl(signed.storageKey, signed.token, file, { contentType: file.type });
        if (uploaded.error) throw new Error("사진 업로드에 실패했습니다.");
        const { photo } = await call<{ photo: AdminPhoto }>("/api/admin/portfolio/upload", "POST", {
          stage: "complete",
          portfolioId: id,
          storageKey: signed.storageKey,
          filename: file.name,
          altText: "",
        });
        draft.photos.push(photo);
        draft.thumbnail_photo_id ||= photo.id;
      }
      await persist(draft);
      await load(id);
      setMessage(`${files.length}장의 사진을 올렸습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "사진을 올리지 못했습니다.");
    }
    setBusy(false);
  }

  async function removePhoto(photoId: string) {
    if (!active?.id || !window.confirm("이 사진을 삭제할까요?")) return;
    setBusy(true);
    setMessage("");
    try {
      await persist(active);
      await call("/api/admin/portfolio/upload", "DELETE", { portfolioId: active.id, photoId });
      await load(active.id);
      setMessage("사진을 삭제했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "사진을 삭제하지 못했습니다.");
    }
    setBusy(false);
  }

  async function removeProject() {
    if (!active?.id || !window.confirm(`“${active.name}” 프로젝트와 사진을 삭제할까요?`)) return;
    setBusy(true);
    setMessage("");
    try {
      await call("/api/admin/portfolio", "DELETE", { id: active.id });
      await load();
      setMessage("프로젝트를 삭제했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "프로젝트를 삭제하지 못했습니다.");
    }
    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-[#f5f8fa] text-[#152737]">
      <header className="border-b border-[#e0e7ec] bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-5">
            <Link href="/" className="text-xl font-extrabold tracking-[-0.05em]">
              Codest
            </Link>
            <span className="text-sm font-semibold text-[#597184]">포트폴리오 관리</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/portfolio" target="_blank" className="text-[#136b9f] hover:underline">
              사이트 보기 ↗
            </Link>
            <button type="button" onClick={onLogout} className="text-[#597184] hover:underline">
              로그아웃
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-10">
        <PortfolioSidebar
          projects={projects}
          activeId={active?.id}
          onNew={() => {
            setActive(blank());
            setSelectionKey((current) => current + 1);
            setMessage("");
          }}
          onSelect={(project) => {
            setActive(structuredClone(project));
            setSelectionKey((current) => current + 1);
            setMessage("");
          }}
        />
        <div className="min-w-0">
          {message && (
            <p
              className="mb-4 rounded-lg border border-[#cee2ec] bg-white px-5 py-3 text-sm text-[#245f83]"
              role="status"
            >
              {message}
            </p>
          )}
          {active ? (
            <PortfolioForm
              key={`${active.id}-${selectionKey}`}
              value={active}
              onChange={setActive}
              onSave={save}
              onUpload={upload}
              onDeletePhoto={removePhoto}
              onDelete={removeProject}
              busy={busy}
            />
          ) : (
            <div className="grid min-h-[360px] place-items-center rounded-xl border border-dashed border-[#cbd5df] bg-white p-8 text-center text-sm text-[#718493]">
              왼쪽에서 프로젝트를 선택하거나 새 프로젝트를 만들어 주세요.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
