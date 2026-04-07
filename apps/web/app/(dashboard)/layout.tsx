import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { createServerCaller } from "@/trpc/server";
import { NavItems } from "./_components/nav-items";

type Role = "TALENT" | "CLIENT" | "ADMIN";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let role: Role = "TALENT";

  try {
    const caller = await createServerCaller();
    const me = await caller.user.me();
    role = me.role;
  } catch {
    // User not in DB yet (first sign-in) or unauthenticated — default to TALENT
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/30">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="font-display text-xl font-bold">
            Provato
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          <NavItems role={role} />
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b px-6">
          <UserButton afterSignOutUrl="/" />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
