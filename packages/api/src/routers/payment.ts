import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

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
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.payment.findMany({
        where: { projectId: input.projectId },
        include: {
          client: { select: { id: true, name: true } },
          talent: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["PENDING", "ESCROWED", "RELEASED", "REFUNDED"]),
        stripePaymentIntentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
