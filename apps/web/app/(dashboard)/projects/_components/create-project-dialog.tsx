"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { trpc } from "@/trpc/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
  Button, Input, Textarea, Badge,
} from "@provato/ui";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const utils = trpc.useUtils();

  const createProject = trpc.project.create.useMutation();
  const updateStatus = trpc.project.updateStatus.useMutation();

  const isPending = createProject.isPending || updateStatus.isPending;

  function addSkill(value: string) {
    const trimmed = value.trim().replace(/,$/, "");
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  function reset() {
    setTitle(""); setDescription(""); setBudget("");
    setTimeline(""); setSkills([]); setSkillInput("");
  }

  async function handleSubmit() {
    if (!title || !description || !budget || !timeline || skills.length === 0) {
      toast.error("Bitte alle Felder ausfüllen");
      return;
    }

    try {
      const project = await createProject.mutateAsync({
        title,
        description,
        budget: Number(budget),
        timeline,
        requiredSkills: skills,
      });

      await updateStatus.mutateAsync({ id: project.id, status: "OPEN" });

      toast.success("Projekt veröffentlicht!");
      await utils.project.list.invalidate();
      setOpen(false);
      reset();
    } catch {
      toast.error("Fehler beim Erstellen des Projekts");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>Projekt erstellen</Button>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Neues Projekt erstellen</DialogTitle>
          <DialogDescription>
            Beschreibe dein Projekt, um die richtigen AI-Spezialisten zu finden.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Titel</label>
            <Input
              placeholder="z.B. RAG-System für Rechtsdokumente"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Beschreibung</label>
            <Textarea
              placeholder="Beschreibe das Projekt, Anforderungen und Erwartungen..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Budget ($)</label>
              <Input
                type="number"
                placeholder="z.B. 10000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Zeitrahmen</label>
              <Input
                placeholder="z.B. 6 Wochen"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Benötigte Skills</label>
            <Input
              placeholder="Skill eingeben + Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addSkill(skillInput);
                }
              }}
            />
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={reset}>Abbrechen</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Wird erstellt..." : "Projekt veröffentlichen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
