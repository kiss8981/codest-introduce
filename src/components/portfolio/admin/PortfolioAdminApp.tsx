"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient, type Session } from "@supabase/supabase-js";
import PortfolioWorkspace from "./PortfolioWorkspace";

export default function PortfolioAdminApp({
  supabaseUrl,
  publishableKey,
}: {
  supabaseUrl: string;
  publishableKey: string;
}) {
  const client = useMemo(
    () => (supabaseUrl && publishableKey ? createClient(supabaseUrl, publishableKey) : null),
    [supabaseUrl, publishableKey],
  );
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(Boolean(client));
  const [email, setEmail] = useState("kdh@codest.kr");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!client) return;
    let mounted = true;
    client.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setBooting(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [client]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;
    setBusy(true);
    setMessage("");
    const result = await client.auth.signInWithPassword({ email, password });
    setPassword("");
    if (result.error) setMessage("로그인 정보를 확인해 주세요.");
    else setSession(result.data.session);
    setBusy(false);
  }

  async function logout() {
    await client?.auth.signOut();
    setSession(null);
    setMessage("");
  }

  if (!client)
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center text-sm text-[#526574]">
        관리자 연결을 준비 중입니다. Supabase 공개 키를 설정해 주세요.
      </div>
    );
  if (booting)
    return (
      <div className="grid min-h-screen place-items-center text-sm text-[#526574]">
        관리자 화면을 불러오는 중입니다.
      </div>
    );
  if (!session)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f8fa] px-5 py-12">
        <form
          onSubmit={login}
          className="w-full max-w-[420px] rounded-2xl border border-[#dde6eb] bg-white p-8 shadow-sm"
        >
          <Link href="/" className="text-xl font-extrabold tracking-[-0.05em] text-[#152737]">
            Codest
          </Link>
          <h1 className="mt-9 text-2xl font-bold tracking-[-0.04em] text-[#152737]">
            포트폴리오 관리
          </h1>
          <p className="mt-2 text-sm text-[#627585]">관리자 계정으로 로그인해 주세요.</p>
          <label className="mt-7 block text-sm font-semibold text-[#253846]">
            이메일
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#cbd5df] px-4 py-3"
            />
          </label>
          <label className="mt-5 block text-sm font-semibold text-[#253846]">
            비밀번호
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#cbd5df] px-4 py-3"
            />
          </label>
          {message && (
            <p className="mt-4 text-sm text-[#a84646]" role="alert">
              {message}
            </p>
          )}
          <button
            disabled={busy}
            className="mt-7 w-full rounded-full bg-[#136b9f] px-6 py-3 font-bold text-white disabled:opacity-50"
          >
            로그인
          </button>
        </form>
      </main>
    );

  return <PortfolioWorkspace client={client} onLogout={logout} />;
}
