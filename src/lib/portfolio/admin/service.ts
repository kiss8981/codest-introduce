import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { ApiError } from "@/lib/http";
import { removeUpload } from "@/lib/uploads/storage";
import type { PortfolioInput } from "./schema";
import { findProject, insertProject, removeProject, saveProject } from "./repository";

function refresh(slugs: string[]) {
  revalidateTag("codest-portfolio", { expire: 0 });
  revalidatePath("/portfolio");
  for (const slug of slugs) revalidatePath(`/portfolio/${slug}`);
}

function checkDates(input: PortfolioInput) {
  if (input.ended_at && input.started_at && input.ended_at < input.started_at)
    throw new ApiError("종료일은 시작일 이후여야 합니다.");
}

export async function createProject(input: PortfolioInput) {
  checkDates(input);
  if (input.thumbnail_photo_id || input.mobile_thumbnail_photo_id)
    throw new ApiError("사진을 먼저 업로드해 주세요.");
  const result = await insertProject(input);
  refresh([input.slug]);
  return result;
}

export async function updateProject(input: PortfolioInput) {
  if (!input.id) throw new ApiError("프로젝트 ID가 필요합니다.");
  checkDates(input);
  const old = await findProject(input.id);
  const result = await saveProject(input);
  refresh([old.slug, input.slug]);
  return result;
}

export async function deleteProject(id: string) {
  const old = await findProject(id);
  const keys = await removeProject(id);
  await removeUpload("portfolio", keys);
  refresh([old.slug]);
  return { ok: true };
}

export const requireProject = findProject;
export function refreshProject(slug: string) {
  refresh([slug]);
}
