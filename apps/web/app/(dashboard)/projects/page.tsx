"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { trpc } from "@/trpc/client";
import {
  Card, CardContent, CardHeader, CardTitle, Badge, Button,
  Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@provato/ui";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { CreateProjectDialog } from "./_components/create-project-dialog";
import type { ProjectStatus } from "@provato/db";

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "destructive" | "outline"> = {
  OPEN: "default", ACTIVE: "secondary", IN_REVIEW: "secondary",
  COMPLETED: "outline", CANCELLED: "destructive", DRAFT: "outline",
};

const statusLabels: Record<ProjectStatus, string> = {
  OPEN: "Offen", ACTIVE: "Aktiv", IN_REVIEW: "In Prüfung",
  COMPLETED: "Abgeschlossen", CANCELLED: "Abgebrochen", DRAFT: "Entwurf",
};

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">("ALL");
  const { data: me } = trpc.user.me.useQuery();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.project.list.useInfiniteQuery(
      {
        limit: 10,
        search: debouncedSearch || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      },
      { getNextPageParam: (last) => last.nextCursor, initialCursor: undefined }
    );

  const projects = data?.pages.flatMap((p) => p.projects) ?? [];
  const canCreateProject = me?.role === "CLIENT" || me?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Projekte</h1>
          <p className="text-muted-foreground">Offene AI-Projekte auf der Suche nach Talent.</p>
        </div>
        {canCreateProject && <CreateProjectDialog />}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Projekte suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as ProjectStatus | "ALL")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Alle Status</SelectItem>
            <SelectItem value="OPEN">Offen</SelectItem>
            <SelectItem value="IN_REVIEW">In Prüfung</SelectItem>
            <SelectItem value="ACTIVE">Aktiv</SelectItem>
            <SelectItem value="COMPLETED">Abgeschlossen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Projekte konnten nicht geladen werden." />}

      {!isLoading && !isError && projects.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">Keine Projekte gefunden.</p>
      )}

      <div className="space-y-4">
        {projects.map((project) => (
          <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{project.title}</CardTitle>
                  <Badge variant={statusVariant[project.status]}>
                    {statusLabels[project.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">von {project.client.name}</span>
                  <span className="font-semibold">${Number(project.budget).toLocaleString()}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {project.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {project._count.applications} Bewerbung(en) · {project.timeline}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Lädt..." : "Mehr laden"}
          </Button>
        </div>
      )}
    </div>
  );
}
