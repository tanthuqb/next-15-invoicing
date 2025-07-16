"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    chatwootSDK?: {
      run: (options: { websiteToken: string; baseUrl: string }) => void;
    };
  }
}

export default function ChatwootWidget() {
  useEffect(() => {
    const BASE_URL = "https://app.chatwoot.com";
    const script = document.createElement("script");
    script.src = `${BASE_URL}/packs/js/sdk.js`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (
        typeof window !== "undefined" &&
        window.chatwootSDK &&
        typeof window.chatwootSDK.run === "function"
      ) {
        (window.chatwootSDK as { run: (options: { websiteToken: string; baseUrl: string }) => void }).run({
          websiteToken: "btvrt17stabSmX2srDkGWKpU",
          baseUrl: BASE_URL,
        });
      }
    };
    document.head.appendChild(script);
  }, []);

  return null;
}
