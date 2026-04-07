"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
  Button, Input, Textarea,
} from "@provato/ui";

interface EditProfileDialogProps {
  profile: {
    bio: string;
    hourlyRate: number;
    availability: string;
    location: string;
    languages: string[];
    portfolioUrl?: string | null;
  };
  onSuccess: () => void;
}

export function EditProfileDialog({ profile, onSuccess }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [bio, setBio] = useState(profile.bio);
  const [hourlyRate, setHourlyRate] = useState(String(profile.hourlyRate));
  const [availability, setAvailability] = useState(profile.availability);
  const [location, setLocation] = useState(profile.location);
  const [languages, setLanguages] = useState(profile.languages.join(", "));
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolioUrl ?? "");

  const utils = trpc.useUtils();
  const updateProfile = trpc.talent.updateProfile.useMutation({
    onSuccess: async () => {
      toast.success("Profil aktualisiert!");
      await utils.talent.getById.invalidate();
      setOpen(false);
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}>Profil bearbeiten</Button>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Profil bearbeiten</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Bio</label>
            <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Stundensatz ($)</label>
              <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Verfügbarkeit</label>
              <Input value={availability} onChange={(e) => setAvailability(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Standort</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Sprachen (komma-getrennt)</label>
              <Input value={languages} onChange={(e) => setLanguages(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Portfolio URL</label>
            <Input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Abbrechen</Button></DialogClose>
          <Button
            onClick={() => updateProfile.mutate({
              bio,
              hourlyRate: Number(hourlyRate),
              availability,
              location,
              languages: languages.split(",").map((l) => l.trim()).filter(Boolean),
              portfolioUrl: portfolioUrl || undefined,
            })}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Speichert..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
