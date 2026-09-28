import "server-only";
import type { z } from "zod";
import {
  publicUploadUrl,
  removeUpload,
  signUpload as signStorageUpload,
  uploadedFile,
} from "@/lib/uploads/storage";
import type { uploadInput } from "../schema";
import { refreshProject, requireProject } from "../service";
import { insertPhoto, removePhoto } from "./repository";

type UploadInput = z.infer<typeof uploadInput>;

export async function signUpload(input: Extract<UploadInput, { stage: "sign" }>) {
  await requireProject(input.portfolioId);
  return signStorageUpload("portfolio", input.portfolioId, input.mimeType, input.size);
}

export async function completeUpload(input: Extract<UploadInput, { stage: "complete" }>) {
  const project = await requireProject(input.portfolioId);
  const file = await uploadedFile("portfolio", input.portfolioId, input.storageKey);
  const photo = await insertPhoto({
    portfolioId: input.portfolioId,
    storageKey: input.storageKey,
    filename: input.filename,
    altText: input.altText,
    size: file.size,
    mimeType: file.mimeType,
  });
  refreshProject(project.slug);
  return { photo: { ...photo, public_url: publicUploadUrl("portfolio", photo.storage_key) } };
}

export async function deletePhoto(portfolioId: string, photoId: string) {
  const project = await requireProject(portfolioId);
  const storageKey = await removePhoto(portfolioId, photoId);
  await removeUpload("portfolio", [storageKey]);
  refreshProject(project.slug);
  return { ok: true };
}
