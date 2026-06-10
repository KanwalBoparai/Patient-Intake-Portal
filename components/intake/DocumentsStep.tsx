/* eslint-disable @next/next/no-img-element */
import { FileWarning, ImageUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import { Field } from "@/components/intake/Field";
import { formatFileSize } from "@/lib/format";
import { ACCEPTED_IMAGE_TYPES, type IntakeFormValues } from "@/lib/validations";

type DocumentField = "insuranceCard" | "photoId";

interface FileFieldProps {
  form: UseFormReturn<IntakeFormValues>;
  name: DocumentField;
  label: string;
}

function FileField({ form, name, label }: FileFieldProps) {
  const file = form.watch(name);
  const error = form.formState.errors[name]?.message as string | undefined;
  const [preview, setPreview] = useState<string>();

  useEffect(() => {
    // Only build a thumbnail for files we can actually render — a rejected
    // PDF/HEIC would otherwise show a broken image next to its error.
    if (!(file instanceof File) || !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setPreview(undefined);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <Field id={name} label={label} error={error}>
      <input
        id={name}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) form.setValue(name, selected, { shouldValidate: true });
        }}
      />
      <label
        htmlFor={name}
        className="flex min-h-[7rem] cursor-pointer items-center justify-center gap-4 rounded-lg border-2 border-dashed border-input bg-card p-4 transition-colors hover:border-primary/60 hover:bg-accent/40"
      >
        {file instanceof File ? (
          <>
            {preview ? (
              <img
                src={preview}
                alt={`${label} preview`}
                className="h-20 w-28 rounded-md border object-cover"
              />
            ) : (
              <FileWarning
                className="h-10 w-10 shrink-0 text-muted-foreground"
                aria-hidden
              />
            )}
            <span className="min-w-0 text-left">
              <span className="block truncate text-sm font-medium">{file.name}</span>
              <span className="field-hint block">{formatFileSize(file.size)}</span>
              <span className="block text-sm font-medium text-primary">Replace image</span>
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-1 text-center">
            <ImageUp className="mb-1 h-6 w-6 text-primary" aria-hidden />
            <span className="text-sm font-medium">Choose an image</span>
            <span className="field-hint">PNG, JPEG, or WebP — up to 10 MB</span>
          </span>
        )}
      </label>
    </Field>
  );
}

export function DocumentsStep({ form }: { form: UseFormReturn<IntakeFormValues> }) {
  return (
    <div className="grid gap-5">
      <FileField form={form} name="insuranceCard" label="Insurance card" />
      <FileField form={form} name="photoId" label="Photo ID" />
    </div>
  );
}
