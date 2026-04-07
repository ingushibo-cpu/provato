import { router, protectedProcedure } from "../trpc";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        talentProfile: { select: { id: true } },
      },
    });
  }),
});
