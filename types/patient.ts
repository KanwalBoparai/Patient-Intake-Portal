import type { CreatePatientProfileInput } from "@/lib/validations";

/** A stored patient profile, as exposed by the GraphQL API. */
export interface PatientProfile extends CreatePatientProfileInput {
  id: string;
  createdAt: string; // ISO timestamp
}

/** Row shape in Supabase (snake_case). Mapped in the GraphQL resolvers. */
export interface PatientProfileRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
  insurance_card_url: string;
  photo_id_url: string;
  consent: boolean;
  created_at: string;
}
