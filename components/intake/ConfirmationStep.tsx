import { FileCheck2 } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatDateOfBirth } from "@/lib/format";
import type { IntakeFormValues } from "@/lib/validations";

export function ConfirmationStep({ form }: { form: UseFormReturn<IntakeFormValues> }) {
  const v = form.getValues();
  const consentError = form.formState.errors.consent?.message;

  const summary: [string, string][] = [
    ["First name", v.firstName],
    ["Last name", v.lastName],
    ["Email", v.email],
    ["Phone", v.phone],
    ["Date of birth", formatDateOfBirth(v.dateOfBirth)],
    ["Address", v.address],
  ];

  return (
    <div className="grid gap-6">
      <dl className="grid gap-x-6 gap-y-4 rounded-lg border bg-muted/40 p-5 sm:grid-cols-2">
        {summary.map(([label, value]) => (
          <div key={label} className={label === "Address" ? "sm:col-span-2" : undefined}>
            <dt className="summary-label">{label}</dt>
            <dd className="summary-value">{value}</dd>
          </div>
        ))}
        <div className="sm:col-span-2">
          <dt className="summary-label">Documents</dt>
          <dd className="summary-value flex flex-wrap gap-x-5 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <FileCheck2 className="h-4 w-4 text-primary" aria-hidden />
              Insurance card attached
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileCheck2 className="h-4 w-4 text-primary" aria-hidden />
              Photo ID attached
            </span>
          </dd>
        </div>
      </dl>

      <div className="space-y-1.5">
        <div className="flex items-start gap-3">
          <Controller
            control={form.control}
            name="consent"
            render={({ field }) => (
              <Checkbox
                id="consent"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                className="mt-0.5"
              />
            )}
          />
          <Label htmlFor="consent" className="cursor-pointer leading-snug">
            I confirm that the information provided is accurate and I consent to
            submitting my patient intake information.
          </Label>
        </div>
        {consentError && (
          <p className="field-error" role="alert">
            {consentError}
          </p>
        )}
      </div>
    </div>
  );
}
