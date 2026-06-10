import { upload } from "@vercel/blob/client";

export type DocumentKind = "insurance-card" | "photo-id";

/** Browser-side: upload one document to Vercel Blob, return its final URL. */
export async function uploadDocument(kind: DocumentKind, file: File): Promise<string> {
  const blob = await upload(`${kind}/${file.name}`, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
    contentType: file.type,
  });
  return blob.url;
}
