import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const talentRouter = router({
  list: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        category: z.string().optional(),
        minScore: z.number().min(0).max(100).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, category, minScore, search } = input;

      const talents = await ctx.prisma.talentProfile.findMany({
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        where: {
          ...(minScore ? { overallScore: { gte: minScore } } : {}),
          ...(search
            ? {
                OR: [
                  { bio: { contains: search, mode: "insensitive" as const } },
                  {
                    user: {
                      name: { contains: search, mode: "insensitive" as const },
                    },
                  },
                ],
              }
            : {}),
          ...(category
            ? {
                skillVerifications: {
                  some: { skill: { category: category as never } },
                },
              }
            : {}),
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          skillVerifications: {
            include: { skill: true },
            orderBy: { score: "desc" },
          },
        },
        orderBy: { overallScore: "desc" },
      });

      let nextCursor: string | undefined;
      if (talents.length > limit) {
        const nextItem = talents.pop();
        nextCursor = nextItem?.id;
      }

      return { talents, nextCursor };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.talentProfile.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          skillVerifications: {
            include: { skill: true },
            orderBy: { score: "desc" },
          },
        },
      });
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        bio: z.string().min(10).max(2000).optional(),
        hourlyRate: z.number().positive().optional(),
        availability: z.string().optional(),
        location: z.string().optional(),
        languages: z.array(z.string()).optional(),
        portfolioUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.talentProfile.update({
        where: { userId: ctx.userId },
        data: input,
      });
    }),
});
