import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const applicationRouter = router({
  apply: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        coverLetter: z.string().min(20).max(3000),
        proposedRate: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.application.findUnique({
        where: {
          projectId_talentId: {
            projectId: input.projectId,
            talentId: ctx.userId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Already applied to this project",
        });
      }

      return ctx.prisma.application.create({
        data: { ...input, talentId: ctx.userId },
      });
    }),

  listByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.application.findMany({
        where: { projectId: input.projectId },
        include: {
          talent: {
            select: {
              id: true,
              name: true,
              talentProfile: {
                select: {
                  overallScore: true,
                  hourlyRate: true,
                  totalProjects: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.application.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),
});
