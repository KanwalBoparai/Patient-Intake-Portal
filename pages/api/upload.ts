import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/validations";

const DOCUMENT_PATH = /^(insurance-card|photo-id)\//;

/**
 * Mints signed client-upload tokens for Vercel Blob. The browser PUTs the
 * file straight to Blob storage (10 MB images would blow the ~4.5 MB
 * serverless body cap if proxied through here).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body as HandleUploadBody,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!DOCUMENT_PATH.test(pathname)) {
          throw new Error("Unknown document type");
        }
        return {
          allowedContentTypes: ACCEPTED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: true,
        };
      },
      // No onUploadCompleted webhook: the profile row is inserted by the
      // createPatientProfile mutation only after BOTH files have final
      // URLs (see the intake submit flow), so a half-finished upload can
      // never produce a database record.
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Upload failed",
    });
  }
}
