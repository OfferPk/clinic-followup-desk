import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Nav } from "@/components/Nav";

export default async function DeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div className="min-h-dvh">
      <Nav user={user} />
      <main className="mx-auto max-w-6xl px-3 py-4">{children}</main>
    </div>
  );
}
