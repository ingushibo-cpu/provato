"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@provato/ui";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { CreateProjectDialog } from "../projects/_components/create-project-dialog";
import type { ProjectStatus } from "@provato/db";

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "destructive" | "outline"> = {
  OPEN: "default", ACTIVE: "secondary", IN_REVIEW: "secondary",
  COMPLETED: "outline", CANCELLED: "destructive", DRAFT: "outline",
};

export default function MyProjectsPage() {
  const { data: me } = trpc.user.me.useQuery();
  const { data, isLoading, isError } = trpc.project.list.useInfiniteQuery(
    { limit: 50 },
    { getNextPageParam: (last) => last.nextCursor, initialCursor: undefined }
  );

  const projects = data?.pages
    .flatMap((p) => p.projects)
    .filter((p) => p.client.id === me?.id) ?? [];

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState message="Projekte konnten nicht geladen werden." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Meine Projekte</h1>
          <p className="text-muted-foreground">{projects.length} Projekt(e)</p>
        </div>
        <CreateProjectDialog />
      </div>

      {projects.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Noch keine Projekte erstellt.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{project.title}</CardTitle>
                    <Badge variant={statusVariant[project.status]}>{project.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                  <p className="text-sm font-medium">${Number(project.budget).toLocaleString()} · {project.timeline}</p>
                  <p className="text-xs text-muted-foreground">
                    {project._count.applications} Bewerbung(en)
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
