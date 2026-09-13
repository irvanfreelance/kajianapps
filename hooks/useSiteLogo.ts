"use client";

import { useState, useLayoutEffect, useEffect } from "react";

const CACHE_KEY = "site_logo_url";

export function useSiteLogo(fallback: string = "/64.png") {
  const [logoUrl, setLogoUrl] = useState<string>(fallback);

  // Synchronously swap to the cached logo before paint (client-only, avoids SSR hydration mismatch).
  useLayoutEffect(() => {
    try {
      const cached = window.localStorage.getItem(CACHE_KEY);
      if (cached) setLogoUrl(cached);
    } catch {}
  }, []);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((data) => {
        const url = data?.settings?.site_logo;
        if (url) {
          setLogoUrl(url);
          try {
            window.localStorage.setItem(CACHE_KEY, url);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  return logoUrl;
}
