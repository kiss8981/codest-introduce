import "server-only";
import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

export async function jsonBody(request: Request): Promise<unknown> {
  const text = await request.text();
  if (text.length > 100_000) throw new ApiError("입력 내용이 너무 깁니다.", 413);
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError("입력 내용을 확인해 주세요.");
  }
}

export async function apiResponse(action: () => Promise<unknown>, successStatus = 200) {
  try {
    return NextResponse.json(await action(), {
      status: successStatus,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof ApiError)
      return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("api_request_failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "요청을 처리하지 못했습니다." }, { status: 500 });
  }
}
