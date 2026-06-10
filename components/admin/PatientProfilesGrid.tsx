/* eslint-disable @next/next/no-img-element */
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateOfBirth } from "@/lib/format";
import type { PatientProfile } from "@/types/patient";

ModuleRegistry.registerModules([AllCommunityModule]);

const theme = themeQuartz.withParams({ accentColor: "#0f766e" });

interface Preview {
  url: string;
  title: string;
}

function DocumentCell(props: ICellRendererParams<PatientProfile, string>) {
  const url = props.value;
  if (!url) return <span className="field-hint">—</span>;

  const patient = props.data ? `${props.data.firstName} ${props.data.lastName}` : "";
  const label = props.colDef?.headerName ?? "Document";
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-primary"
      onClick={() => props.context.openPreview({ url, title: `${label} — ${patient}` })}
    >
      View
    </Button>
  );
}

const columnDefs: ColDef<PatientProfile>[] = [
  { field: "firstName", headerName: "First Name" },
  { field: "lastName", headerName: "Last Name" },
  { field: "email", headerName: "Email", minWidth: 220 },
  { field: "phone", headerName: "Phone", minWidth: 150 },
  {
    field: "dateOfBirth",
    headerName: "Date of Birth",
    valueFormatter: ({ value }) => (value ? formatDateOfBirth(value) : ""),
  },
  { field: "address", headerName: "Address", minWidth: 240 },
  {
    field: "insuranceCardUrl",
    headerName: "Insurance Card",
    cellRenderer: DocumentCell,
    sortable: false,
    filter: false,
  },
  {
    field: "photoIdUrl",
    headerName: "Photo ID",
    cellRenderer: DocumentCell,
    sortable: false,
    filter: false,
  },
  {
    field: "consent",
    headerName: "Consent",
    maxWidth: 110,
    valueFormatter: ({ value }) => (value ? "Yes" : "No"),
  },
  {
    field: "createdAt",
    headerName: "Submitted At",
    sort: "desc",
    minWidth: 180,
    valueFormatter: ({ value }) => (value ? new Date(value).toLocaleString() : ""),
  },
];

const defaultColDef: ColDef<PatientProfile> = {
  sortable: true,
  filter: true,
  resizable: true,
  flex: 1,
  minWidth: 120,
};

export default function PatientProfilesGrid({ profiles }: { profiles: PatientProfile[] }) {
  const [preview, setPreview] = useState<Preview | null>(null);

  return (
    <>
      <AgGridReact<PatientProfile>
        theme={theme}
        rowData={profiles}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 25, 50]}
        domLayout="autoHeight"
        context={{ openPreview: setPreview }}
      />

      <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent>
          <DialogTitle>{preview?.title}</DialogTitle>
          <DialogDescription>Rendered from the stored Vercel Blob URL.</DialogDescription>
          {preview && (
            <img
              src={preview.url}
              alt={preview.title}
              className="max-h-[70vh] w-full rounded-lg border object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
