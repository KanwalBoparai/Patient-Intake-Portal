import { GraphQLError } from "graphql";

import { getSupabase } from "@/lib/supabase";
import { createPatientProfileSchema } from "@/lib/validations";
import type { PatientProfile, PatientProfileRow } from "@/types/patient";

const toProfile = (row: PatientProfileRow): PatientProfile => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  phone: row.phone,
  dateOfBirth: row.date_of_birth,
  address: row.address,
  insuranceCardUrl: row.insurance_card_url,
  photoIdUrl: row.photo_id_url,
  consent: row.consent,
  createdAt: row.created_at,
});

const badInput = (message: string) =>
  new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });

export const resolvers = {
  Query: {
    getPatientProfiles: async (): Promise<PatientProfile[]> => {
      const { data, error } = await getSupabase()
        .from("patient_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new GraphQLError(`Failed to load patient profiles: ${error.message}`);
      }
      return (data as PatientProfileRow[]).map(toProfile);
    },
  },

  Mutation: {
    createPatientProfile: async (
      _parent: unknown,
      args: { input: unknown }
    ): Promise<PatientProfile> => {
      const parsed = createPatientProfileSchema.safeParse(args.input);
      if (!parsed.success) {
        throw badInput(parsed.error.issues.map((i) => i.message).join("; "));
      }

      const input = parsed.data;
      const { data, error } = await getSupabase()
        .from("patient_profiles")
        .insert({
          first_name: input.firstName,
          last_name: input.lastName,
          email: input.email.toLowerCase(),
          phone: input.phone,
          date_of_birth: input.dateOfBirth,
          address: input.address,
          insurance_card_url: input.insuranceCardUrl,
          photo_id_url: input.photoIdUrl,
          consent: input.consent,
        })
        .select()
        .single();

      if (error) {
        throw new GraphQLError(`Failed to create patient profile: ${error.message}`);
      }
      return toProfile(data as PatientProfileRow);
    },
  },
};
