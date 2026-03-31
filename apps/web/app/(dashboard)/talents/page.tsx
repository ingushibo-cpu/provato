"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@provato/ui";

export default function TalentsPage() {
  const { data, isLoading } = trpc.talent.list.useQuery({ limit: 20 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Verified Talents</h1>
        <p className="text-muted-foreground">
          AI specialists with verified skill assessments.
        </p>
      </div>

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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
