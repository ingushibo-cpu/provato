import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
}

export function ErrorState({ message = "Something went wrong. Please try again." }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-destructive">
      <AlertCircle className="h-8 w-8" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
