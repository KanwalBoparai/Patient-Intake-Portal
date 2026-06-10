import { AlertCircle, Inbox } from "lucide-react";
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
  loading: () => <p className="field-hint py-12 text-center">Loading table…</p>,
});

interface AdminPageProps {
  profiles: PatientProfile[];
  error: string | null;
}

export default function AdminPage({ profiles, error }: AdminPageProps) {
  return (
    <main className="page-shell max-w-7xl">
      <header className="page-header">
        <p className="brand-mark">Reimagine Health</p>
        <h1 className="page-title">Patient submissions</h1>
        <p className="page-subtitle">
          {profiles.length} intake {profiles.length === 1 ? "record" : "records"} — click a
          document to preview it.
        </p>
      </header>

      {error ? (
        <Alert variant="destructive" className="mx-auto max-w-xl">
          <AlertCircle className="h-4 w-4" aria-hidden />
          <AlertTitle>Couldn&apos;t load submissions</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : profiles.length === 0 ? (
        <Card className="mx-auto max-w-xl">
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground" aria-hidden />
            <p className="font-medium">No submissions yet</p>
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
