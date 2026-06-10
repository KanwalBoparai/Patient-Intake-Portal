import { AlertCircle, HeartPulse, Inbox } from "lucide-react";
import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { createSsrApolloClient } from "@/lib/apollo-ssr";
import { GET_PATIENT_PROFILES } from "@/lib/graphql/operations";
import type { PatientProfile } from "@/types/patient";

// Grid is browser-only; profile data itself still arrives via SSR below.
const PatientProfilesGrid = dynamic(() => import("@/components/admin/PatientProfilesGrid"), {
  ssr: false,
  loading: () => <p className="grid-loading">Loading table…</p>,
});

interface AdminPageProps {
  profiles: PatientProfile[];
  error: string | null;
}

export default function AdminPage({ profiles, error }: AdminPageProps) {
  return (
    <main className="page-shell page-shell-wide">
      <header className="page-header">
        <p className="brand-mark">
          <HeartPulse className="icon-sm" aria-hidden />
          Reimagine Health
        </p>
        <h1 className="page-title">Patient submissions</h1>
        <p className="page-subtitle">
          {profiles.length} intake {profiles.length === 1 ? "record" : "records"} — click a
          document to preview it.
        </p>
      </header>

      {error ? (
        <Alert variant="destructive" className="panel-narrow">
          <AlertCircle className="icon-sm" aria-hidden />
          <AlertTitle>Couldn&apos;t load submissions</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : profiles.length === 0 ? (
        <Card className="panel-narrow">
          <CardContent className="stack-center gap-2 p-10">
            <Inbox className="icon-empty" aria-hidden />
            <p className="empty-title">No submissions yet</p>
            <p className="field-hint">
              Completed intake forms will appear here as soon as patients submit them.
            </p>
          </CardContent>
        </Card>
      ) : (
        <PatientProfilesGrid profiles={profiles} />
      )}
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<AdminPageProps> = async () => {
  try {
    const client = createSsrApolloClient();
    const { data } = await client.query<{ getPatientProfiles: PatientProfile[] }>({
      query: GET_PATIENT_PROFILES,
      fetchPolicy: "no-cache",
    });
    return { props: { profiles: data.getPatientProfiles, error: null } };
  } catch (error) {
    return {
      props: {
        profiles: [],
        error: error instanceof Error ? error.message : "Failed to load patient profiles",
      },
    };
  }
};
