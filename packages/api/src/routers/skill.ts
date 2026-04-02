import { z } from "zod";
import { SkillCategory } from "@provato/db";
import { router, publicProcedure, adminProcedure } from "../trpc";

export const skillRouter = router({
  list: publicProcedure
    .input(
      z.object({
        category: z.nativeEnum(SkillCategory).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.skill.findMany({
        where: input.category ? { category: input.category } : undefined,
        include: { _count: { select: { verifications: true } } },
        orderBy: { name: "asc" },
      });
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        category: z.nativeEnum(SkillCategory),
        description: z.string().min(10).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.skill.create({ data: input });
    }),
});
