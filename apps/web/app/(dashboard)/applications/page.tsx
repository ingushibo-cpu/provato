"use client";

import Link from "next/link";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs, TabsList, TabsTrigger, TabsContent } from "@provato/ui";
import { Spinner } from "@/components/ui/spinner";
import type { ApplicationStatus, ProjectStatus } from "@provato/db";

const statusVariant: Record<ApplicationStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  REVIEWED: "outline",
  ACCEPTED: "default",
  REJECTED: "destructive",
};

const statusLabels: Record<ApplicationStatus, string> = {
  PENDING: "Ausstehend",
  REVIEWED: "Geprüft",
  ACCEPTED: "Angenommen",
  REJECTED: "Abgelehnt",
};

const projectStatusLabel: Record<ProjectStatus, string> = {
  DRAFT: "Entwurf", OPEN: "Offen", IN_REVIEW: "In Prüfung",
  ACTIVE: "Aktiv", COMPLETED: "Abgeschlossen", CANCELLED: "Abgebrochen",
};

export default function ApplicationsPage() {
  const utils = trpc.useUtils();
  const { data: applications, isLoading } = trpc.application.listByTalent.useQuery();
  const withdraw = trpc.application.withdraw.useMutation({
    onSuccess: async () => {
      toast.success("Bewerbung zurückgezogen");
      await utils.application.listByTalent.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <Spinner />;

  const all = applications ?? [];
  const pending = all.filter((a) => a.status === "PENDING");
  const accepted = all.filter((a) => a.status === "ACCEPTED");
  const rejected = all.filter((a) => a.status === "REJECTED");

  function ApplicationCard({ app }: { app: (typeof all)[number] }) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <Link href={`/dashboard/projects/${app.projectId}`} className="hover:underline">
              <CardTitle className="text-base">{app.project.title}</CardTitle>
            </Link>
            <Badge variant={statusVariant[app.status]}>{statusLabels[app.status]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Kunde: {app.project.client.name} · Budget: ${Number(app.project.budget).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Zeitrahmen: {app.project.timeline} · Projektstatus: {projectStatusLabel[app.project.status]}
          </p>
          <p className="text-xs text-muted-foreground">
            Beworben: {new Date(app.createdAt).toLocaleDateString("de-DE")}
          </p>
          {app.status === "PENDING" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => withdraw.mutate({ id: app.id })}
              disabled={withdraw.isPending}
            >
              Zurückziehen
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  function EmptyState() {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Keine Bewerbungen in dieser Kategorie.</p>
        <Link href="/dashboard/projects">
          <Button variant="outline" className="mt-4">Projekte entdecken</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Meine Bewerbungen</h1>
        <p className="text-muted-foreground">{all.length} Bewerbung(en) insgesamt</p>
      </div>

      {all.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Du hast dich noch auf keine Projekte beworben.</p>
          <Link href="/dashboard/projects">
            <Button className="mt-4">Projekte entdecken</Button>
          </Link>
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Alle ({all.length})</TabsTrigger>
            <TabsTrigger value="pending">Ausstehend ({pending.length})</TabsTrigger>
            <TabsTrigger value="accepted">Angenommen ({accepted.length})</TabsTrigger>
            <TabsTrigger value="rejected">Abgelehnt ({rejected.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {all.map((app) => <ApplicationCard key={app.id} app={app} />)}
            </div>
          </TabsContent>
          <TabsContent value="pending">
            <div className="space-y-4">
              {pending.length > 0 ? pending.map((app) => <ApplicationCard key={app.id} app={app} />) : <EmptyState />}
            </div>
          </TabsContent>
          <TabsContent value="accepted">
            <div className="space-y-4">
              {accepted.length > 0 ? accepted.map((app) => <ApplicationCard key={app.id} app={app} />) : <EmptyState />}
            </div>
          </TabsContent>
          <TabsContent value="rejected">
            <div className="space-y-4">
              {rejected.length > 0 ? rejected.map((app) => <ApplicationCard key={app.id} app={app} />) : <EmptyState />}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
