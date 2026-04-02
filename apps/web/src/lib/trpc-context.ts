import "server-only";

import { prisma } from "@provato/db";
import { auth } from "@clerk/nextjs/server";
import type { Context } from "@provato/api";

export async function createTRPCContext(): Promise<Context> {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return { prisma, userId: null, userRole: null };
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, role: true },
  });

  return {
    prisma,
    userId: dbUser?.id ?? null,
    userRole: dbUser?.role ?? null,
  };
}
