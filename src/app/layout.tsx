import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClinicDesk — Appointment Follow-Up",
  description:
    "WhatsApp-first clinic appointment confirm / remind / no-show desk. Not an EMR.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
