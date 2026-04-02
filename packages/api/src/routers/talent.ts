import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { SkillCategory } from "@provato/db";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const talentRouter = router({
  list: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        category: z.nativeEnum(SkillCategory).optional(),
        minScore: z.number().min(0).max(5).optional(),
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
                  some: { skill: { category } },
                },
              }
            : {}),
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          skillVerifications: {
            include: { skill: true },
            orderBy: { score: "desc" },
            take: 5,
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
      const talent = await ctx.prisma.talentProfile.findUnique({
        where: { id: input.id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          skillVerifications: {
            include: { skill: true },
            orderBy: { score: "desc" },
          },
        },
      });

      if (!talent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Talent not found" });
      }

      return talent;
    }),

  getByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const talent = await ctx.prisma.talentProfile.findUnique({
        where: { userId: input.userId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          skillVerifications: {
            include: { skill: true },
            orderBy: { score: "desc" },
          },
        },
      });

      if (!talent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Talent not found" });
      }

      return talent;
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        bio: z.string().min(10).max(2000).optional(),
        hourlyRate: z.number().positive().max(10000).optional(),
        availability: z.string().optional(),
        location: z.string().optional(),
        languages: z.array(z.string()).min(1).optional(),
        portfolioUrl: z.string().url().optional().or(z.literal("")),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.prisma.talentProfile.findUnique({
        where: { userId: ctx.userId },
        select: { id: true },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Talent profile not found. Please create one first.",
        });
      }

      return ctx.prisma.talentProfile.update({
        where: { userId: ctx.userId },
        data: input,
      });
    }),
});
