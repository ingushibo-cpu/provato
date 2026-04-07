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
import type { SkillCategory } from "@provato/db";

const categoryLabels: Record<SkillCategory, string> = {
  RAG: "RAG",
  FINE_TUNING: "Fine-Tuning",
  PROMPT_ENGINEERING: "Prompt Engineering",
  ML_ENGINEERING: "ML Engineering",
  AI_ETHICS: "AI Ethics",
  LLM_OPS: "LLM Ops",
  MULTIMODAL: "Multimodal",
  OTHER: "Sonstige",
};

export default function TalentsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | "ALL">("ALL");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.talent.list.useInfiniteQuery(
      {
        limit: 12,
        search: debouncedSearch || undefined,
        category: categoryFilter !== "ALL" ? categoryFilter : undefined,
      },
      { getNextPageParam: (last) => last.nextCursor, initialCursor: undefined }
    );

  const talents = data?.pages.flatMap((p) => p.talents) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Verifizierte Talente</h1>
        <p className="text-muted-foreground">AI-Spezialisten mit verifizierten Skill-Assessments.</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Talente suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as SkillCategory | "ALL")}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Alle Kategorien</SelectItem>
            {(Object.keys(categoryLabels) as SkillCategory[]).map((cat) => (
              <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Talente konnten nicht geladen werden." />}

      {!isLoading && !isError && talents.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">Keine Talente gefunden.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {talents.map((talent) => (
          <Link key={talent.id} href={`/dashboard/talents/${talent.id}`}>
            <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{talent.user.name}</CardTitle>
                  <Badge variant="secondary">★ {Number(talent.overallScore).toFixed(1)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-2 text-sm text-muted-foreground">{talent.bio}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{talent.location}</span>
                  <span className="font-semibold">${Number(talent.hourlyRate)}/Std.</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {talent.skillVerifications.slice(0, 3).map((sv) => (
                    <Badge key={sv.id} variant="outline" className="text-xs">
                      {sv.skill.name} ({sv.score}%)
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {talent.totalProjects} Projekte · {talent.availability}
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
