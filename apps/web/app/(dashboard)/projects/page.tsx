"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@provato/ui";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import type { ProjectStatus } from "@provato/db";

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "destructive" | "outline"> = {
  OPEN: "default",
  ACTIVE: "secondary",
  IN_REVIEW: "secondary",
  COMPLETED: "outline",
  CANCELLED: "destructive",
  DRAFT: "outline",
};

export default function ProjectsPage() {
  const { data, isLoading, isError } = trpc.project.list.useQuery({ limit: 20 });

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState message="Failed to load projects. Please try again." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Open AI projects looking for talent.</p>
        </div>
        <Button>Post a Project</Button>
      </div>

      {data?.projects.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No projects found.</p>
      ) : (
        <div className="space-y-4">
          {data?.projects.map((project) => (
            <Card key={project.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{project.title}</CardTitle>
                  <Badge variant={statusVariant[project.status]}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {project.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">by {project.client.name}</span>
                  <span className="font-semibold">
                    ${Number(project.budget).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {project.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {project._count.applications} application(s) &middot; {project.timeline}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
