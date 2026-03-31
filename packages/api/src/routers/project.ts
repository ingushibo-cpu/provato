import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";

const statusEnum = z.enum([
  "DRAFT",
  "OPEN",
  "IN_REVIEW",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

export const projectRouter = router({
  list: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        status: statusEnum.optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, status, search } = input;

      const projects = await ctx.prisma.project.findMany({
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        where: {
          ...(status ? { status } : { status: { not: "DRAFT" } }),
          ...(search
            ? {
                OR: [
                  { title: { contains: search, mode: "insensitive" as const } },
                  {
                    description: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              }
            : {}),
        },
        include: {
          client: { select: { id: true, name: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (projects.length > limit) {
        const nextItem = projects.pop();
        nextCursor = nextItem?.id;
      }

      return { projects, nextCursor };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.project.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          client: { select: { id: true, name: true, email: true } },
          applications: {
            include: {
              talent: {
                select: {
                  id: true,
                  name: true,
                  talentProfile: {
                    select: { overallScore: true, totalProjects: true },
                  },
                },
              },
            },
          },
          _count: { select: { applications: true } },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5).max(200),
        description: z.string().min(20).max(5000),
        budget: z.number().positive(),
        timeline: z.string(),
        requiredSkills: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.project.create({
        data: { ...input, clientId: ctx.userId, status: "DRAFT" },
      });
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: statusEnum }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUniqueOrThrow({
        where: { id: input.id },
      });

      if (project.clientId !== ctx.userId && ctx.userRole !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.prisma.project.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),
});
