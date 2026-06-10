import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  { number: 1, label: "Demographics" },
  { number: 2, label: "Documents" },
  { number: 3, label: "Confirm" },
];

export function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <ol className="mb-8 flex items-center justify-center gap-2 sm:gap-3">
      {STEPS.map((step, i) => {
        const isDone = currentStep > step.number;
        const isActive = currentStep === step.number;
        return (
          <li
            key={step.number}
            className="flex items-center gap-2 sm:gap-3"
            aria-current={isActive ? "step" : undefined}
          >
            {i > 0 && (
              <span
                className={cn("h-px w-6 sm:w-10", isDone || isActive ? "bg-primary" : "bg-border")}
              />
            )}
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                isDone && "bg-primary text-primary-foreground",
                isActive && "border-2 border-primary bg-accent text-accent-foreground",
                !isDone && !isActive && "border border-border bg-card text-muted-foreground"
              )}
            >
              {isDone ? <Check className="h-4 w-4" /> : step.number}
            </span>
            <span
              className={cn(
                "hidden text-sm font-medium sm:block",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
