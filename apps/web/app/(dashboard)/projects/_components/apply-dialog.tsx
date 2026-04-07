"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
  Button, Input, Textarea,
} from "@provato/ui";

interface ApplyDialogProps {
  projectId: string;
  onSuccess: () => void;
}

export function ApplyDialog({ projectId, onSuccess }: ApplyDialogProps) {
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");

  const apply = trpc.application.apply.useMutation({
    onSuccess: () => {
      toast.success("Bewerbung erfolgreich eingereicht!");
      setOpen(false);
      setCoverLetter("");
      setProposedRate("");
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>Jetzt bewerben</Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Auf Projekt bewerben</DialogTitle>
          <DialogDescription>Überzeuge den Kunden von deinen Fähigkeiten.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Anschreiben</label>
            <Textarea
              placeholder="Beschreibe deine Erfahrung und warum du der richtige Kandidat bist..."
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Stundensatz ($)</label>
            <Input
              type="number"
              placeholder="z.B. 150"
              value={proposedRate}
              onChange={(e) => setProposedRate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Abbrechen</Button>
          </DialogClose>
          <Button
            onClick={() => apply.mutate({ projectId, coverLetter, proposedRate: Number(proposedRate) })}
            disabled={apply.isPending || !coverLetter || !proposedRate}
          >
            {apply.isPending ? "Wird eingereicht..." : "Bewerbung einreichen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
