"use client";

import { trpc } from "@/trpc/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from "@provato/ui";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const statusVariant: Record<string, BadgeVariant> = {
  OPEN: "default",
  ACTIVE: "secondary",
  COMPLETED: "outline",
  CANCELLED: "destructive",
  IN_REVIEW: "secondary",
  DRAFT: "outline",
};

export default function ProjectsPage() {
  const { data, isLoading } = trpc.project.list.useQuery({ limit: 20 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Open AI projects looking for talent.
          </p>
        </div>
        <Button>Post a Project</Button>
      </div>

      <div className="space-y-4">
        {data?.projects.map((project) => (
          <Card
            key={project.id}
            className="transition-shadow hover:shadow-md"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{project.title}</CardTitle>
                <Badge variant={statusVariant[project.status] ?? "outline"}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {project.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  by {project.client.name}
                </span>
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
                {project._count.applications} application(s) &middot;{" "}
                {project.timeline}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
