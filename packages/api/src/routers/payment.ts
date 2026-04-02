import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, adminProcedure } from "../trpc";

const PLATFORM_FEE_RATE = 0.1; // 10%

export const paymentRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        talentId: z.string(),
        amount: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.projectId },
        select: { clientId: true, status: true },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.clientId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (project.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payments can only be created for active projects",
        });
      }

      const talent = await ctx.prisma.user.findUnique({
        where: { id: input.talentId },
        select: { id: true, role: true },
      });

      if (!talent || talent.role !== "TALENT") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Talent not found" });
      }

      const acceptedApplication = await ctx.prisma.application.findFirst({
        where: {
          projectId: input.projectId,
          talentId: input.talentId,
          status: "ACCEPTED",
        },
      });

      if (!acceptedApplication) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Talent does not have an accepted application for this project",
        });
      }

      const platformFee = input.amount * PLATFORM_FEE_RATE;

      return ctx.prisma.payment.create({
        data: {
          projectId: input.projectId,
          clientId: ctx.userId,
          talentId: input.talentId,
          amount: input.amount,
          platformFee,
          status: "PENDING",
        },
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

      const isClientOrAdmin =
        project.clientId === ctx.userId || ctx.userRole === "ADMIN";
      const isTalentOnProject = await ctx.prisma.application.findFirst({
        where: {
          projectId: input.projectId,
          talentId: ctx.userId,
          status: "ACCEPTED",
        },
      });

      if (!isClientOrAdmin && !isTalentOnProject) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const payments = await ctx.prisma.payment.findMany({
        where: { projectId: input.projectId },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        include: {
          client: { select: { id: true, name: true } },
          talent: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (payments.length > input.limit) {
        const nextItem = payments.pop();
        nextCursor = nextItem?.id;
      }

      return { payments, nextCursor };
    }),

  // Admin-only: update payment status (webhook target in production)
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["PENDING", "ESCROWED", "RELEASED", "REFUNDED"]),
        stripePaymentIntentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.findUnique({
        where: { id: input.id },
        select: { id: true },
      });

      if (!payment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
      }

      return ctx.prisma.payment.update({
        where: { id: input.id },
        data: {
          status: input.status,
          ...(input.stripePaymentIntentId
            ? { stripePaymentIntentId: input.stripePaymentIntentId }
            : {}),
        },
      });
    }),
});
