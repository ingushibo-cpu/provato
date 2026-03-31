import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const reviewRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        revieweeId: z.string(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().min(10).max(2000),
        skillRatings: z
          .record(z.string(), z.number().min(1).max(5))
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      const avg =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await ctx.prisma.talentProfile.updateMany({
        where: { userId: input.revieweeId },
        data: { overallScore: Math.round(avg * 10) / 10 },
      });

      return review;
    }),

  listByUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.review.findMany({
        where: { revieweeId: input.userId },
        include: {
          reviewer: { select: { id: true, name: true } },
          project: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    }),
});
