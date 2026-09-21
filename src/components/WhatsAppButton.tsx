"use client";

import { toWhatsAppUrl } from "@/lib/phone";

export function WhatsAppButton({
  phone,
  text,
  label = "WhatsApp",
}: {
  phone: string;
  text?: string;
  label?: string;
}) {
  const url = toWhatsAppUrl(phone, text);
  if (!url) {
    return (
      <span className="text-xs text-slate-400" title="Invalid phone">
        No WA
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-wa !py-1.5 !text-xs"
    >
      {label}
    </a>
  );
}
