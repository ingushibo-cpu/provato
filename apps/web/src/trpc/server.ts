import "server-only";

import { createCaller, type Context } from "@provato/api";
import { prisma } from "@provato/db";
import { auth } from "@clerk/nextjs/server";

export async function createServerCaller() {
  const { userId: clerkId } = await auth();

  let dbUser: { id: string; role: "TALENT" | "CLIENT" | "ADMIN" } | null =
    null;

  if (clerkId) {
    dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    });
  }

  const ctx: Context = {
    prisma,
    userId: dbUser?.id ?? null,
    userRole: dbUser?.role ?? null,
  };

  return createCaller(ctx);
}
