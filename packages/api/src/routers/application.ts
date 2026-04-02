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
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.projectId },
        select: { status: true },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.status !== "OPEN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project is not open for applications",
        });
      }

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
    .input(
      z.object({
        projectId: z.string(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.projectId },
        select: { clientId: true },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      if (project.clientId !== ctx.userId && ctx.userRole !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const applications = await ctx.prisma.application.findMany({
        where: { projectId: input.projectId },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
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

      let nextCursor: string | undefined;
      if (applications.length > input.limit) {
        const nextItem = applications.pop();
        nextCursor = nextItem?.id;
      }

      return { applications, nextCursor };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findUnique({
        where: { id: input.id },
        include: { project: { select: { clientId: true } } },
      });

      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }

      const isProjectOwner = application.project.clientId === ctx.userId;
      const isAdmin = ctx.userRole === "ADMIN";
      const isOwnApplication = application.talentId === ctx.userId;

      // Project owner can change status; talent can only withdraw (set to PENDING doesn't make sense but they can't accept their own)
      if (!isProjectOwner && !isAdmin && !isOwnApplication) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.prisma.application.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  withdraw: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findUnique({
        where: { id: input.id },
        select: { talentId: true, status: true },
      });

      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }
      if (application.talentId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (application.status === "ACCEPTED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot withdraw an accepted application",
        });
      }

      return ctx.prisma.application.delete({ where: { id: input.id } });
    }),
});
