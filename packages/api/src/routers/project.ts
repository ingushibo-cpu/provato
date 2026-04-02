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

// Valid status transitions
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["OPEN", "CANCELLED"],
  OPEN: ["IN_REVIEW", "CANCELLED"],
  IN_REVIEW: ["OPEN", "ACTIVE", "CANCELLED"],
  ACTIVE: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

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
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.id },
        include: {
          client: { select: { id: true, name: true, email: true } },
          _count: { select: { applications: true } },
        },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      return project;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5).max(200),
        description: z.string().min(20).max(5000),
        budget: z.number().positive(),
        timeline: z.string().min(2).max(100),
        requiredSkills: z.array(z.string()).min(1).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.project.create({
        data: { ...input, clientId: ctx.userId, status: "DRAFT" },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(5).max(200).optional(),
        description: z.string().min(20).max(5000).optional(),
        budget: z.number().positive().optional(),
        timeline: z.string().min(2).max(100).optional(),
        requiredSkills: z.array(z.string()).min(1).max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const project = await ctx.prisma.project.findUnique({
        where: { id },
        select: { clientId: true, status: true },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.clientId !== ctx.userId && ctx.userRole !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (project.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft projects can be edited",
        });
      }

      return ctx.prisma.project.update({ where: { id }, data });
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: statusEnum }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.id },
        select: { clientId: true, status: true },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.clientId !== ctx.userId && ctx.userRole !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const allowed = ALLOWED_TRANSITIONS[project.status] ?? [];
      if (!allowed.includes(input.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot transition project from ${project.status} to ${input.status}`,
        });
      }

      return ctx.prisma.project.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.id },
        select: { clientId: true, status: true },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.clientId !== ctx.userId && ctx.userRole !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (project.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft projects can be deleted",
        });
      }

      return ctx.prisma.project.delete({ where: { id: input.id } });
    }),
});
