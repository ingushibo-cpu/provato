"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@provato/ui";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";

export default function TalentsPage() {
  const { data, isLoading, isError } = trpc.talent.list.useQuery({ limit: 20 });

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState message="Failed to load talents. Please try again." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Verified Talents</h1>
        <p className="text-muted-foreground">
          AI specialists with verified skill assessments.
        </p>
      </div>

      {data?.talents.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No talents found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.talents.map((talent) => (
            <Card key={talent.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{talent.user.name}</CardTitle>
                  <Badge variant="secondary">
                    ★ {Number(talent.overallScore).toFixed(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {talent.bio}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{talent.location}</span>
                  <span className="font-semibold">
                    ${Number(talent.hourlyRate)}/hr
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {talent.skillVerifications.slice(0, 3).map((sv) => (
                    <Badge key={sv.id} variant="outline" className="text-xs">
                      {sv.skill.name} ({sv.score}%)
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {talent.totalProjects} completed projects &middot; {talent.availability}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
