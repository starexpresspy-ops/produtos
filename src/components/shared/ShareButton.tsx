"use client";

import { useState } from "react";

export function ShareButton({
  title,
  url,
  text,
}: {
  title: string;
  url: string;
  text?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    if (navigator.share) {
      await navigator.share({ title, url, text: text ?? undefined });
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="border-border hover:bg-background rounded-full border px-5 py-3 text-sm font-semibold"
    >
      {copied ? "Link copiado!" : "Compartilhar"}
    </button>
  );
}
