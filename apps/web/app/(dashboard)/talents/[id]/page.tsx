"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, Badge, Avatar, AvatarFallback } from "@provato/ui";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { EditProfileDialog } from "../_components/edit-profile-dialog";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i}>{i < rating ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

export default function TalentDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: me } = trpc.user.me.useQuery();

  const { data: talent, isLoading, isError, refetch } = trpc.talent.getById.useQuery(
    { id: params.id },
    { enabled: !!params.id }
  );

  const { data: reviewsData } = trpc.review.listByUser.useQuery(
    { userId: talent?.user.id ?? "" },
    { enabled: !!talent?.user.id }
  );

  if (isLoading) return <Spinner />;
  if (isError || !talent) return <ErrorState message="Talent nicht gefunden." />;

  const isOwnProfile = me?.id === talent.user.id;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/talents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Zurück zu Talenten
      </Link>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 text-lg">
              <AvatarFallback>{getInitials(talent.user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <h1 className="font-display text-2xl font-bold">{talent.user.name}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-base">
                    ★ {Number(talent.overallScore).toFixed(1)}
                  </Badge>
                  {isOwnProfile && (
                    <EditProfileDialog
                      profile={{
                        bio: talent.bio,
                        hourlyRate: Number(talent.hourlyRate),
                        availability: talent.availability,
                        location: talent.location,
                        languages: talent.languages,
                        portfolioUrl: talent.portfolioUrl,
                      }}
                      onSuccess={refetch}
                    />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {talent.location} · {talent.availability} · ${Number(talent.hourlyRate)}/Std.
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {talent.languages.map((lang) => (
                  <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
                ))}
              </div>
              {talent.portfolioUrl && (
                <a
                  href={talent.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Portfolio <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Über mich</CardTitle></CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{talent.bio}</p>
        </CardContent>
      </Card>

      {talent.skillVerifications.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Verifizierte Skills</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {talent.skillVerifications.map((sv) => (
              <div key={sv.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{sv.skill.name}</span>
                    <Badge variant="outline" className="text-xs">{sv.skill.category}</Badge>
                  </div>
                  <span className="font-semibold">{sv.score}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${sv.score}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Verifiziert: {new Date(sv.verifiedAt).toLocaleDateString("de-DE")} ·
                  Läuft ab: {new Date(sv.expiresAt).toLocaleDateString("de-DE")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {reviewsData && reviewsData.reviews.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Bewertungen ({reviewsData.reviews.length})</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {reviewsData.reviews.map((review) => (
              <div key={review.id} className="space-y-1 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{review.reviewer.name}</span>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Projekt: {review.project.title} · {new Date(review.createdAt).toLocaleDateString("de-DE")}
                </p>
                <p className="text-sm">{review.comment}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
