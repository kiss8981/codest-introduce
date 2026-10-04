import { adminResponse } from "@/lib/auth/admin-auth";
import { jsonBody } from "@/lib/http";
import { parseDeletePhoto, parseUploadInput } from "@/lib/portfolio/admin/schema";
import { completeUpload, deletePhoto, signUpload } from "@/lib/portfolio/admin/photos/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return adminResponse(request, async () => {
    const input = parseUploadInput(await jsonBody(request));
    return input.stage === "sign" ? signUpload(input) : completeUpload(input);
  });
}

export async function DELETE(request: Request) {
  return adminResponse(request, async () => {
    const { portfolioId, photoId } = parseDeletePhoto(await jsonBody(request));
    return deletePhoto(portfolioId, photoId);
  });
}
