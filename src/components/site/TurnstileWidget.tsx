"use client";
import { useEffect, useRef } from "react";

type TurnstileApi = { render: (container: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void };
declare global { interface Window { turnstile?: TurnstileApi } }

export default function TurnstileWidget({ siteKey, resetKey, onToken, onFailure }: { siteKey: string; resetKey: number; onToken: (token: string | null) => void; onFailure: (message: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    let widgetId: string | undefined;
    const render = () => {
      if (!active || widgetId || !window.turnstile || !container.current) return;
      widgetId = window.turnstile.render(container.current, { sitekey: siteKey, action: "inquiry", theme: "dark", size: "flexible", callback: (token: string) => onToken(token), "expired-callback": () => { onToken(null); onFailure("로봇 확인이 만료되었습니다. 다시 완료해 주세요."); }, "error-callback": () => { onToken(null); onFailure("로봇 확인에 실패했습니다. 다시 시도해 주세요."); } });
      clearInterval(timer);
    };
    if (!document.querySelector('script[data-turnstile="true"]')) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = "true";
      script.onload = render;
      script.onerror = () => { script.remove(); onToken(null); onFailure("로봇 확인을 불러오지 못했습니다. 다시 시도해 주세요."); };
      document.head.appendChild(script);
    }
    const timer = setInterval(render, 300);
    const timeout = setTimeout(() => { if (!widgetId) { clearInterval(timer); document.querySelector('script[data-turnstile="true"]')?.remove(); onFailure("로봇 확인을 불러오지 못했습니다. 다시 시도해 주세요."); } }, 8000);
    render();
    return () => { active = false; clearInterval(timer); clearTimeout(timeout); if (widgetId && window.turnstile) window.turnstile.remove(widgetId); };
  }, [siteKey, resetKey, onToken, onFailure]);
  return <div className="turnstile-host" ref={container} aria-label="로봇 확인" />;
}
