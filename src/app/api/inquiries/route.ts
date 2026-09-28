import { apiResponse, ApiError } from "@/lib/http";
import { submitInquiry } from "@/lib/inquiries/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return apiResponse(async () => {
    const input = await request.json().catch(() => {
      throw new ApiError("입력 내용을 확인해 주세요.");
    });
    return submitInquiry(input);
  });
}
