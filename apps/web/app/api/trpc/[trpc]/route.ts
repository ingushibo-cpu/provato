import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, type Context } from "@provato/api";
import { prisma } from "@provato/db";
import { auth } from "@clerk/nextjs/server";

const handler = async (req: Request) => {
  const { userId: clerkId } = await auth();

  let dbUser: { id: string; role: "TALENT" | "CLIENT" | "ADMIN" } | null =
    null;

  if (clerkId) {
    dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    });
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: (): Context => ({
      prisma,
      userId: dbUser?.id ?? null,
      userRole: dbUser?.role ?? null,
    }),
  });
};

export { handler as GET, handler as POST };
