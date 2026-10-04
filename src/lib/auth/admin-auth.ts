import "server-only";
import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiResponse } from "@/lib/http";

export async function portfolioAdmin(request: Request): Promise<User | null> {
  const match = /^Bearer (\S+)$/.exec(request.headers.get("authorization") ?? "");
  if (!match) return null;
  const { data, error } = await db().auth.getUser(match[1]);
  if (error || !data.user) return null;
  const allowedEmail = (process.env.PORTFOLIO_ADMIN_EMAIL ?? "kdh@codest.kr").toLowerCase();
  return data.user.email?.toLowerCase() === allowedEmail ? data.user : null;
}

export async function adminResponse(
  request: Request,
  action: () => Promise<unknown>,
  successStatus = 200,
) {
  if (!(await portfolioAdmin(request)))
    return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  return apiResponse(action, successStatus);
}
