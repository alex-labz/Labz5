import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  const [isTMA, setIsTMA] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const applyViewportHeight = () => {
      try {
        const h = WebApp.viewportStableHeight || WebApp.viewportHeight;
        if (h && h > 0) {
          document.documentElement.style.setProperty("--tg-vh", `${h}px`);
        }
      } catch {}
    };

    try {
      WebApp.ready();
      WebApp.expand();

      applyViewportHeight();

      try {
        WebApp.onEvent("viewportChanged", applyViewportHeight);
      } catch {}

      const tgUser = WebApp.initDataUnsafe?.user;
      if (tgUser) {
        setUser(tgUser as TelegramUser);
        setIsTMA(true);
      }
    } catch {}

    // Fallback: use window inner height if Telegram API unavailable
    const fallback = () => {
      document.documentElement.style.setProperty("--tg-vh", `${window.innerHeight}px`);
    };
    fallback();
    window.addEventListener("resize", fallback);

    setIsReady(true);

    return () => {
      window.removeEventListener("resize", fallback);
      try {
        WebApp.offEvent("viewportChanged", applyViewportHeight);
      } catch {}
    };
  }, []);

  const haptic = (type: "light" | "medium" | "heavy" | "soft" | "rigid" = "light") => {
    try { WebApp.HapticFeedback.impactOccurred(type); } catch {}
  };

  return { isReady, isTMA, user, haptic };
}
