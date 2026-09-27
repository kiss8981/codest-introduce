import { NextResponse } from "next/server";

const mime: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", avif: "image/avif" };
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const { GITHUB_OWNER, GITHUB_REPO, GITHUB_REF = "main", PORTFOLIO_DIR = "content/portfolio", GITHUB_TOKEN } = process.env;
  if (!GITHUB_OWNER || !GITHUB_REPO || !GITHUB_TOKEN || !/^[\w.-]+$/.test(GITHUB_OWNER) || !/^[\w.-]+$/.test(GITHUB_REPO) || !/^[\w.-]+$/.test(GITHUB_REF) || !/^[\w/.-]+$/.test(PORTFOLIO_DIR) || PORTFOLIO_DIR.includes("..")) return new Response(null, { status: 404 });
  if (!path?.length || path.length > 10 || path.some(part => !part || part === "." || part === ".." || /[/\\\0]/.test(part))) return new Response(null, { status: 404 });
  const extension = path.at(-1)?.split(".").at(-1)?.toLowerCase() ?? "";
  if (!mime[extension]) return new Response(null, { status: 404 });
  const file = [...PORTFOLIO_DIR.split("/"), ...path].map(encodeURIComponent).join("/");
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${file}?ref=${encodeURIComponent(GITHUB_REF)}`;
  const response = await fetch(url, { headers: { Accept: "application/vnd.github.raw+json", Authorization: `Bearer ${GITHUB_TOKEN}` }, next: { revalidate: 600 } });
  if (!response.ok || Number(response.headers.get("content-length") ?? 0) > 10_000_000) return new Response(null, { status: 404 });
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > 10_000_000) return new Response(null, { status: 404 });
  return new NextResponse(bytes, { headers: { "Content-Type": mime[extension], "Cache-Control": "public, max-age=0, s-maxage=600", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox" } });
}
