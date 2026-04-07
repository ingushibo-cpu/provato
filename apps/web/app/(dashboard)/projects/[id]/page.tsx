"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@provato/ui";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { ApplyDialog } from "../_components/apply-dialog";
import type { ProjectStatus } from "@provato/db";

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "destructive" | "outline"> = {
  OPEN: "default", ACTIVE: "secondary", IN_REVIEW: "secondary",
  COMPLETED: "outline", CANCELLED: "destructive", DRAFT: "outline",
};

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [expandedLetters, setExpandedLetters] = useState<Record<string, boolean>>({});

  const { data: me } = trpc.user.me.useQuery();
  const { data: project, isLoading, isError, refetch } = trpc.project.getById.useQuery(
    { id: params.id },
    { enabled: !!params.id }
  );
  const { data: applications, refetch: refetchApplications } = trpc.application.listByProject.useQuery(
    { projectId: params.id },
    { enabled: !!params.id && me?.role !== "TALENT" }
  );

  const updateApplicationStatus = trpc.application.updateStatus.useMutation();
  const updateProjectStatus = trpc.project.updateStatus.useMutation();

  const isOwner = me?.id && project?.client.id === me.id;
  const isTalent = me?.role === "TALENT";
  const hasApplied = applications?.applications.some((a) => a.talent.id === me?.id);

  async function handleAccept(applicationId: string) {
    try {
      await updateApplicationStatus.mutateAsync({ id: applicationId, status: "ACCEPTED" });
      if (project?.status === "OPEN" || project?.status === "IN_REVIEW") {
        await updateProjectStatus.mutateAsync({ id: params.id, status: "ACTIVE" });
      }
      toast.success("Bewerbung angenommen!");
      refetchApplications();
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Annehmen");
    }
  }

  async function handleReject(applicationId: string) {
    try {
      await updateApplicationStatus.mutateAsync({ id: applicationId, status: "REJECTED" });
      toast.success("Bewerbung abgelehnt");
      refetchApplications();
    } catch {
      toast.error("Fehler beim Ablehnen");
    }
  }

  if (isLoading) return <Spinner />;
  if (isError || !project) return <ErrorState message="Projekt nicht gefunden." />;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Zurück zu Projekten
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{project.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                von {project.client.name} · ${Number(project.budget).toLocaleString()} · {project.timeline}
              </p>
            </div>
            <Badge variant={statusVariant[project.status]}>{project.status}</Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Beschreibung</CardTitle></CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{project.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Benötigte Skills</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {isTalent && project.status === "OPEN" && (
            <Card>
              <CardContent className="pt-6">
                {hasApplied ? (
                  <div className="text-center">
                    <Badge className="mb-2">Bereits beworben</Badge>
                    <p className="text-xs text-muted-foreground">Deine Bewerbung wurde eingereicht.</p>
                  </div>
                ) : (
                  <ApplyDialog projectId={params.id} onSuccess={() => refetch()} />
                )}
              </CardContent>
            </Card>
          )}

          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Bewerbungen ({applications?.applications.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {applications?.applications.length === 0 && (
                  <p className="text-sm text-muted-foreground">Noch keine Bewerbungen.</p>
                )}
                {applications?.applications.map((app) => {
                  const expanded = expandedLetters[app.id] ?? false;
                  return (
                    <div key={app.id} className="space-y-2 rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <Link href={`/dashboard/talents/${app.talent.talentProfile?.id ?? ""}`} className="font-medium hover:underline">
                          {app.talent.name}
                        </Link>
                        <Badge variant={app.status === "ACCEPTED" ? "default" : app.status === "REJECTED" ? "destructive" : "outline"}>
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ${Number(app.proposedRate)}/Std. · Score: {Number(app.talent.talentProfile?.overallScore ?? 0).toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {expanded ? app.coverLetter : app.coverLetter.slice(0, 150) + (app.coverLetter.length > 150 ? "..." : "")}
                        {app.coverLetter.length > 150 && (
                          <button
                            className="ml-1 text-primary hover:underline"
                            onClick={() => setExpandedLetters(prev => ({ ...prev, [app.id]: !expanded }))}
                          >
                            {expanded ? "Weniger" : "Mehr"}
                          </button>
                        )}
                      </p>
                      {app.status === "PENDING" || app.status === "REVIEWED" ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAccept(app.id)} disabled={updateApplicationStatus.isPending}>
                            Annehmen
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(app.id)} disabled={updateApplicationStatus.isPending}>
                            Ablehnen
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
