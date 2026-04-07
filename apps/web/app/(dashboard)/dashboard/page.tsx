"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@provato/ui";
import { Users, FolderOpen, DollarSign, CheckCircle, Clock, Send } from "lucide-react";

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        <div className="mt-1 h-3 w-32 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

function AdminDashboard() {
  const { data, isLoading } = trpc.admin.stats.useQuery();

  if (isLoading) return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "Aktive Projekte", value: data?.activeProjects ?? 0, icon: FolderOpen },
        { label: "Verifizierte Talente", value: data?.verifiedTalents ?? 0, icon: Users },
        { label: "Ausgezahlte Einnahmen", value: `$${Number(data?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign },
        { label: "Angenommene Bewerbungen", value: data?.acceptedApplications ?? 0, icon: CheckCircle },
      ].map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TalentDashboard() {
  const { data, isLoading } = trpc.application.listByTalent.useQuery();

  if (isLoading) return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1,2,3].map(i => <SkeletonCard key={i} />)}
    </div>
  );

  const pending = data?.filter(a => a.status === "PENDING").length ?? 0;
  const accepted = data?.filter(a => a.status === "ACCEPTED").length ?? 0;
  const total = data?.length ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        { label: "Bewerbungen gesamt", value: total, icon: Send },
        { label: "Ausstehend", value: pending, icon: Clock },
        { label: "Angenommen", value: accepted, icon: CheckCircle },
      ].map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ClientDashboard({ userId }: { userId: string }) {
  const { data, isLoading } = trpc.project.list.useQuery({ limit: 50 });

  if (isLoading) return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1,2,3].map(i => <SkeletonCard key={i} />)}
    </div>
  );

  const myProjects = data?.projects.filter(p => p.client.id === userId) ?? [];
  const open = myProjects.filter(p => p.status === "OPEN").length;
  const active = myProjects.filter(p => p.status === "ACTIVE").length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        { label: "Projekte gesamt", value: myProjects.length, icon: FolderOpen },
        { label: "Offen", value: open, icon: Clock },
        { label: "Aktiv", value: active, icon: CheckCircle },
      ].map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data: me, isLoading } = trpc.user.me.useQuery();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">
          {isLoading ? "Dashboard" : `Willkommen, ${me?.name?.split(" ")[0]}`}
        </h1>
        <p className="text-muted-foreground">Deine Provato-Übersicht.</p>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      )}
      {!isLoading && me?.role === "ADMIN" && <AdminDashboard />}
      {!isLoading && me?.role === "TALENT" && <TalentDashboard />}
      {!isLoading && me?.role === "CLIENT" && <ClientDashboard userId={me.id} />}
    </div>
  );
}
