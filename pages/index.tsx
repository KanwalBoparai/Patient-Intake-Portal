import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, HeartPulse, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { ConfirmationStep } from "@/components/intake/ConfirmationStep";
import { DemographicsStep } from "@/components/intake/DemographicsStep";
import { DocumentsStep } from "@/components/intake/DocumentsStep";
import { Stepper } from "@/components/intake/Stepper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CREATE_PATIENT_PROFILE } from "@/lib/graphql/operations";
import { uploadDocument } from "@/lib/upload";
import { intakeSchema, STEP_FIELDS, type IntakeFormValues } from "@/lib/validations";

const STEP_COPY: Record<number, { title: string; description: string }> = {
  1: { title: "Demographics", description: "Tell us who you are and how to reach you." },
  2: { title: "Documents", description: "Upload a photo of your insurance card and a photo ID." },
  3: { title: "Confirm & consent", description: "Review your details before submitting." },
};

type Stage = "idle" | "uploading-insurance" | "uploading-id" | "saving" | "success";

const STAGE_COPY: Partial<Record<Stage, string>> = {
  "uploading-insurance": "Uploading insurance card…",
  "uploading-id": "Uploading photo ID…",
  saving: "Saving your profile…",
};

export default function IntakePage() {
  const [step, setStep] = useState(1);
  const [stage, setStage] = useState<Stage>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createProfile] = useMutation(CREATE_PATIENT_PROFILE);

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      consent: false,
    },
  });

  const isSubmitting = stage !== "idle" && stage !== "success";

  // Reward-early validation: once a field shows an error, re-check it on
  // every change so the message clears the moment the value is fixed,
  // instead of lingering until blur (which also shifts the layout right
  // when the user reaches for the button).
  useEffect(() => {
    const sub = form.watch((_values, { name }) => {
      if (name && form.getFieldState(name).error) void form.trigger(name);
    });
    return () => sub.unsubscribe();
  }, [form]);

  const goNext = async () => {
    const valid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (valid) setStep((s) => s + 1);
  };

  // Order is the contract: both files must land in Blob before the
  // profile row is created. Any failure aborts before the mutation.
  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      setStage("uploading-insurance");
      const insuranceCardUrl = await uploadDocument("insurance-card", values.insuranceCard);

      setStage("uploading-id");
      const photoIdUrl = await uploadDocument("photo-id", values.photoId);

      setStage("saving");
      await createProfile({
        variables: {
          input: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            dateOfBirth: values.dateOfBirth,
            address: values.address,
            insuranceCardUrl,
            photoIdUrl,
            consent: values.consent,
          },
        },
      });
      setStage("success");
    } catch (error) {
      setStage("idle");
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong while submitting. Please try again."
      );
    }
  });

  const startOver = () => {
    form.reset();
    setSubmitError(null);
    setStage("idle");
    setStep(1);
  };

  return (
    <main className="page-shell page-shell-narrow">
      <header className="page-header">
        <p className="brand-mark">
          <HeartPulse className="icon-sm" aria-hidden />
          Reimagine Health
        </p>
        <h1 className="page-title">Patient intake</h1>
        <p className="page-subtitle">
          Three quick steps — about two minutes to complete.
        </p>
      </header>

      {stage === "success" ? (
        <Card className="success-enter">
          <CardContent className="stack-center gap-3 p-10">
            <CheckCircle2 className="icon-hero" aria-hidden />
            <CardTitle>Your intake form has been submitted</CardTitle>
            <CardDescription>
              Our team will review your information and reach out if anything else is needed.
            </CardDescription>
            <Button variant="outline" className="mt-3" onClick={startOver}>
              Submit another intake
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Stepper currentStep={step} />
          <form onSubmit={onSubmit} noValidate>
            <Card>
              <CardHeader>
                <CardTitle>{STEP_COPY[step].title}</CardTitle>
                <CardDescription>{STEP_COPY[step].description}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <div key={step} className="step-enter">
                  {step === 1 && <DemographicsStep form={form} />}
                  {step === 2 && <DocumentsStep form={form} />}
                  {step === 3 && <ConfirmationStep form={form} />}
                </div>

                {submitError && (
                  <Alert variant="destructive" className="fade-enter">
                    <AlertCircle className="icon-sm" aria-hidden />
                    <AlertTitle>Submission failed</AlertTitle>
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="justify-between">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isSubmitting}
                    onClick={() => setStep((s) => s - 1)}
                  >
                    Back
                  </Button>
                ) : (
                  <span />
                )}
                {step < 3 ? (
                  <Button type="button" onClick={goNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="submit-wide">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="icon-spin" aria-hidden />
                        {STAGE_COPY[stage]}
                      </>
                    ) : (
                      "Submit intake form"
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </form>
        </>
      )}

      <p className="page-footer">
        <Link href="/admin" className="footer-link">
          Staff? Open the admin dashboard
        </Link>
      </p>
    </main>
  );
}
