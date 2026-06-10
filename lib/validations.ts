import { z } from "zod";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

const digitsOf = (value: string) => value.replace(/\D/g, "");

export const demographicsSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((v) => digitsOf(v).length === 10, "Enter a 10-digit phone number"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date")
    .refine((v) => Date.parse(v) < Date.now(), "Date of birth must be in the past")
    .refine((v) => Date.parse(v) > Date.parse("1900-01-01"), "Enter a valid date of birth"),
  address: z.string().trim().min(1, "Address is required"),
});

const imageFile = (label: string) =>
  z
    .custom<File>((file) => file instanceof File, { message: `${label} is required` })
    .refine((file) => file.size <= MAX_FILE_SIZE, "Image must be 10 MB or smaller")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Upload a PNG, JPEG, or WebP image"
    );

export const documentsSchema = z.object({
  insuranceCard: imageFile("Insurance card"),
  photoId: imageFile("Photo ID"),
});

export const consentSchema = z.object({
  consent: z
    .boolean()
    .refine((v) => v === true, "You must consent before submitting"),
});

/** Full client-side intake form schema (steps 1–3). */
export const intakeSchema = demographicsSchema
  .merge(documentsSchema)
  .merge(consentSchema);

export type IntakeFormValues = z.infer<typeof intakeSchema>;

/** Fields validated when leaving each step. */
export const STEP_FIELDS: Record<number, (keyof IntakeFormValues)[]> = {
  1: ["firstName", "lastName", "email", "phone", "dateOfBirth", "address"],
  2: ["insuranceCard", "photoId"],
  3: ["consent"],
};

/**
 * Server-side schema for the createPatientProfile mutation: same
 * demographics, but documents arrive as already-uploaded blob URLs.
 */
export const createPatientProfileSchema = demographicsSchema.extend({
  insuranceCardUrl: z.string().url("Insurance card URL is missing"),
  photoIdUrl: z.string().url("Photo ID URL is missing"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent is required" }),
  }),
});

export type CreatePatientProfileInput = z.infer<typeof createPatientProfileSchema>;
