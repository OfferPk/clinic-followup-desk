import { describe, it, expect } from "vitest";
import {
  normalizePhoneDigits,
  toWhatsAppUrl,
  phoneHint,
  preparePhoneForStorage,
  rewritePkLocalPhone,
  confirmMessage,
  rebookMessage,
} from "@/lib/phone";

describe("normalizePhoneDigits", () => {
  it("strips non-digits and leading +", () => {
    expect(normalizePhoneDigits("+92 300 1112233")).toBe("923001112233");
    expect(normalizePhoneDigits("(92) 300-111-2233")).toBe("923001112233");
  });

  it("returns null for too-short input", () => {
    expect(normalizePhoneDigits("123")).toBeNull();
    expect(normalizePhoneDigits("")).toBeNull();
  });
});

describe("toWhatsAppUrl", () => {
  it("builds wa.me link", () => {
    expect(toWhatsAppUrl("923001112233")).toBe("https://wa.me/923001112233");
  });

  it("appends prefilled text", () => {
    const url = toWhatsAppUrl("923001112233", "Hello");
    expect(url).toBe("https://wa.me/923001112233?text=Hello");
  });

  it("returns null for invalid phone", () => {
    expect(toWhatsAppUrl("abc")).toBeNull();
  });
});

describe("preparePhoneForStorage", () => {
  it("rewrites PK 03… to 92…", () => {
    expect(rewritePkLocalPhone("03001234567")).toBe("923001234567");
    expect(preparePhoneForStorage("03001234567")).toBe("923001234567");
    expect(preparePhoneForStorage("0300-123-4567")).toBe("923001234567");
  });

  it("keeps country-coded numbers", () => {
    expect(preparePhoneForStorage("+92 300 1234567")).toBe("923001234567");
  });

  it("returns null for short phones", () => {
    expect(preparePhoneForStorage("123")).toBeNull();
  });
});

describe("phoneHint + confirmMessage", () => {
  it("warns on local PK 03…", () => {
    expect(phoneHint("03001234567")).toMatch(/92/);
  });
  it("builds confirm text", () => {
    expect(confirmMessage("Ali", "Mon 10am")).toMatch(/Ali/);
  });
});

describe("rebookMessage + URL encoding", () => {
  it("builds rebook text with name, slot, and Roman Urdu cue", () => {
    const msg = rebookMessage("Fatima", "Mon 10:00 AM");
    expect(msg).toMatch(/Fatima/);
    expect(msg).toMatch(/Mon 10:00 AM/);
    expect(msg).toMatch(/Dubara slot|Rebook/i);
  });

  it("encodes rebook prefill in wa.me URL", () => {
    const msg = rebookMessage("Ali & Co", "Tue 3:00 PM");
    const url = toWhatsAppUrl("923001112233", msg);
    expect(url).toBeTruthy();
    expect(url!.startsWith("https://wa.me/923001112233?text=")).toBe(true);
    const encoded = url!.slice("https://wa.me/923001112233?text=".length);
    expect(encoded).toBe(encodeURIComponent(msg.trim()));
    expect(decodeURIComponent(encoded)).toBe(msg.trim());
    expect(encoded).toContain("%26"); // & in "Ali & Co"
  });
});
