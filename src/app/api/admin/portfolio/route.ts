import { adminResponse } from "@/lib/auth/admin-auth";
import { jsonBody } from "@/lib/http";
import { listProjects } from "@/lib/portfolio/admin/repository";
import { createProject, deleteProject, updateProject } from "@/lib/portfolio/admin/service";
import { parsePortfolioInput, parseProjectId } from "@/lib/portfolio/admin/schema";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return adminResponse(request, listProjects);
}

export async function POST(request: Request) {
  return adminResponse(
    request,
    async () => createProject(parsePortfolioInput(await jsonBody(request))),
    201,
  );
}

export async function PATCH(request: Request) {
  return adminResponse(request, async () =>
    updateProject(parsePortfolioInput(await jsonBody(request))),
  );
}

export async function DELETE(request: Request) {
  return adminResponse(request, async () => deleteProject(parseProjectId(await jsonBody(request))));
}
