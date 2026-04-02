import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const reviewRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        revieweeId: z.string(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().min(10).max(2000),
        skillRatings: z.record(z.string(), z.number().min(1).max(5)).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.revieweeId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot review yourself",
        });
      }

      const project = await ctx.prisma.project.findUnique({
        where: { id: input.projectId },
        select: { status: true, clientId: true },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.status !== "COMPLETED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reviews can only be submitted after a project is completed",
        });
      }

      const reviewee = await ctx.prisma.user.findUnique({
        where: { id: input.revieweeId },
        select: { id: true },
      });

      if (!reviewee) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reviewee not found" });
      }

      const review = await ctx.prisma.review.create({
        data: {
          projectId: input.projectId,
          reviewerId: ctx.userId,
          revieweeId: input.revieweeId,
          rating: input.rating,
          comment: input.comment,
          skillRatings: input.skillRatings ?? {},
        },
      });

      const allReviews = await ctx.prisma.review.findMany({
        where: { revieweeId: input.revieweeId },
        select: { rating: true },
      });

      if (allReviews.length > 0) {
        const avg =
          allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await ctx.prisma.talentProfile.updateMany({
          where: { userId: input.revieweeId },
          data: { overallScore: Math.round(avg * 10) / 10 },
        });
      }

      return review;
    }),

  listByUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.prisma.review.findMany({
        where: { revieweeId: input.userId },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        include: {
          reviewer: { select: { id: true, name: true } },
          project: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (reviews.length > input.limit) {
        const nextItem = reviews.pop();
        nextCursor = nextItem?.id;
      }

      return { reviews, nextCursor };
    }),
});
