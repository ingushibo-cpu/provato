import { router, adminProcedure } from "../trpc";

export const adminRouter = router({
  stats: adminProcedure.query(async ({ ctx }) => {
    const [activeProjects, verifiedTalents, revenueResult, acceptedApplications] =
      await ctx.prisma.$transaction([
        ctx.prisma.project.count({ where: { status: "ACTIVE" } }),
        ctx.prisma.talentProfile.count(),
        ctx.prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: "RELEASED" },
        }),
        ctx.prisma.application.count({ where: { status: "ACCEPTED" } }),
      ]);

    return {
      activeProjects,
      verifiedTalents,
      totalRevenue: revenueResult._sum.amount ?? 0,
      acceptedApplications,
    };
  }),
});
