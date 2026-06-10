# Product Requirement Document and Functional Specification Document

## Reimagine Health Patient Intake Application

---

# 1. Product Requirement Document

## 1.1 Product Overview

The application is a patient intake platform built with **Next.js using the Pages Router**. It allows patients to submit their demographic information, upload required identity and insurance documents, confirm their information, provide consent, and submit the intake form.

The application also includes an operational admin dashboard where staff can view submitted patient profiles, filter and sort records, paginate through submissions, and preview uploaded documents through stored Vercel Blob URLs.

The system must be deployed to **Vercel Hobby** and use a backend/database layer capable of storing patient profile data and uploaded document URLs.

---

## 1.2 Product Goals

The main goals are:

1. Allow patients to complete intake in a simple 3-step flow.
2. Validate all submitted data before allowing submission.
3. Upload patient documents securely using Vercel Blob signed URLs.
4. Store patient profiles atomically after successful document uploads.
5. Provide admins with a usable dashboard to review patient submissions.
6. Support sortable, filterable, resizable, and paginated tabular admin views.
7. Allow admins to preview insurance card and photo ID images from stored blob URLs.
8. Deploy successfully to Vercel with required environment variables.

---

## 1.3 Target Users

### Patient User

A patient who needs to submit basic demographic information and required documents before receiving care or being onboarded.

### Admin User

An internal operations user who reviews patient intake submissions, checks uploaded documents, and manages operational visibility into incoming patient profiles.

---

## 1.4 Application Pages

The application has two main pages:

### `/index`

Patient-facing intake form.

### `/admin`

Admin-facing dashboard for reviewing submitted patient profiles.

---

# 2. Feature Breakdown

---

# Feature 1: Patient Intake Page `/index`

## 2.1 Description

The `/index` page contains a 3-step patient intake flow. The UI should start with a new fresh form for each patient session and be implemented using a quiz-style flow, or another intuitive multi-step design.

The form must collect:

### Step 1 — Demographics

Required fields:

* First name
* Last name
* Email
* Phone
* Date of birth
* Address

### Step 2 — Documents

Required uploads:

* Insurance card upload
* Photo ID upload

Both uploads must accept **images only**.

### Step 3 — Confirmation

The confirmation step must show a summary of the demographic data entered in Step 1 and include a user consent checkbox.

The user must provide consent before submitting the form.

---

## 2.2 Product Requirements

### Functional Requirements

1. Patient can enter demographic information.
2. Patient can move from Step 1 to Step 2 only after Step 1 passes validation.
3. Patient can upload insurance card image.
4. Patient can upload photo ID image.
5. Patient can move from Step 2 to Step 3 only after both required files are valid.
6. Patient can review demographic details on Step 3.
7. Patient must check a consent checkbox before final submission.
8. Patient can submit the complete intake form.
9. Patient receives a success state after successful submission.
10. Patient receives an error message if upload or profile creation fails.

### Validation Requirements

Validation must use:

* React-Hook-Form
* Zod

Rules:

* All demographic fields are required.
* Email must be valid.
* Insurance card file is required.
* Photo ID file is required.
* Files must be images only.
* Each image must be maximum 10 MB.
* Consent must be required before submission.

---

## 2.3 User Flow

### Patient Intake Flow

1. Patient opens `/index`.
2. Patient sees Step 1: Demographics.
3. Patient enters first name, last name, email, phone, date of birth, and address.
4. Patient clicks "Next."
5. Frontend validates Step 1 using React-Hook-Form and Zod.
6. If validation fails, inline error messages appear.
7. If validation succeeds, patient moves to Step 2.
8. Patient uploads insurance card image.
9. Patient uploads photo ID image.
10. Patient clicks "Next."
11. Frontend validates both files.
12. If validation fails, inline file errors appear.
13. If validation succeeds, patient moves to Step 3.
14. Patient reviews demographic summary.
15. Patient checks consent checkbox.
16. Patient clicks "Submit."
17. System requests signed upload URLs from `/api/upload` for each file.
18. System uploads each file to its signed URL.
19. System receives final Vercel Blob URLs.
20. System calls `createPatientProfile` mutation with demographic data, consent value, and uploaded file URLs.
21. Backend stores the patient profile atomically.
22. Patient sees success confirmation.

---

# Feature 2: Step 1 — Demographics

## 2.4 Description

The first step collects required patient identity and contact information.

## 2.5 Fields

| Field         | Type          | Required | Validation           |
| ------------- | ------------- | -------- | -------------------- |
| First name    | Text          | Yes      | Non-empty            |
| Last name     | Text          | Yes      | Non-empty            |
| Email         | Email         | Yes      | Valid email format   |
| Phone         | Text/Tel      | Yes      | Non-empty            |
| Date of birth | Date          | Yes      | Non-empty valid date |
| Address       | Text/Textarea | Yes      | Non-empty            |

## 2.6 Technical Requirements

Frontend must:

* Register all fields with React-Hook-Form.
* Define validation schema using Zod.
* Show inline validation messages.
* Preserve entered values when user moves between steps.
* Display entered values later in Step 3 confirmation.

Backend dependency:

* These fields must map directly to the patient profile database schema.
* These fields must be passed to `createPatientProfile`.

---

# Feature 3: Step 2 — Document Uploads

## 2.7 Description

The second step allows patients to upload two required image files:

1. Insurance card
2. Photo ID

Both must be images and each file must be no larger than 10 MB.

## 2.8 File Requirements

| Upload         | Required | Type       | Max Size |
| -------------- | -------- | ---------- | -------- |
| Insurance card | Yes      | Image only | 10 MB    |
| Photo ID       | Yes      | Image only | 10 MB    |

Accepted MIME types should include:

* `image/png`
* `image/jpeg`
* `image/jpg`
* `image/webp`

## 2.9 Technical Requirements

Frontend must:

* Use file picker inputs.
* Restrict accepted file types using `accept="image/*"`.
* Validate MIME type using Zod or custom validation.
* Validate file size is less than or equal to 10 MB.
* Store selected files in form state.
* Prevent Step 2 completion if either file is missing or invalid.

Backend dependencies:

* `/api/upload` API route must provide signed URLs for Vercel Blob upload.
* Vercel Blob must be configured through environment variables.
* Final blob URLs must be stored in the patient profile record.

---

# Feature 4: Step 3 — Confirmation and Consent

## 2.10 Description

The third step displays a confirmation summary of the demographic information from Step 1 and asks the user to provide consent.

## 2.11 Displayed Confirmation Data

The confirmation screen must show:

* First name
* Last name
* Email
* Phone
* Date of birth
* Address

It may also show document upload status, such as:

* Insurance card selected
* Photo ID selected

## 2.12 Consent Requirement

The consent checkbox is required before submission.

Example consent label:

"I confirm that the information provided is accurate and I consent to submitting my patient intake information."

## 2.13 Technical Requirements

Frontend must:

* Read Step 1 values from React-Hook-Form state.
* Display a read-only summary.
* Register consent checkbox with React-Hook-Form.
* Validate consent as `true`.
* Disable or block submission until consent is provided.

Backend dependency:

* Consent value should be saved with patient profile data.
* Submission timestamp should be stored for audit purposes.

---

# Feature 5: Form Submission Flow

## 2.14 Description

On final submission, the application must upload files first and then create the patient profile.

Submission order is important:

1. Request signed URL for insurance card.
2. Upload insurance card to signed URL.
3. Request signed URL for photo ID.
4. Upload photo ID to signed URL.
5. Receive final blob URLs.
6. Call `createPatientProfile`.
7. Store profile atomically.

## 2.15 Technical Requirements

Frontend must:

* Prevent duplicate submissions while submission is in progress.
* Show loading state during upload and profile creation.
* Handle errors clearly.
* Only call `createPatientProfile` after both files upload successfully.
* Reset form or show success message after successful submission.

Backend/API must:

* Generate upload URLs through `/api/upload`.
* Accept upload metadata such as filename and content type.
* Return signed upload URL or equivalent Vercel Blob client upload payload.
* Ensure uploaded file URLs are available after upload.
* Insert profile only after file URLs exist.

---

# Feature 6: `/api/upload`

## 2.16 Description

The `/api/upload` route is responsible for generating signed upload URLs for file uploads to Vercel Blob.

## 2.17 Responsibilities

The API must:

1. Receive file metadata from the frontend.
2. Validate that the requested file is an image.
3. Validate upload request structure.
4. Generate a signed Vercel Blob upload URL.
5. Return signed upload information to the frontend.
6. Support upload completion flow so final blob URLs can be used in patient profile creation.

## 2.18 Request Payload

Example request:

```json
{
  "filename": "insurance-card.png",
  "contentType": "image/png",
  "fileType": "insuranceCard"
}
```

## 2.19 Response Payload

Example response:

```json
{
  "uploadUrl": "signed-vercel-blob-upload-url",
  "blobUrl": "final-or-pending-blob-url",
  "token": "optional-client-upload-token"
}
```

Exact response shape may depend on the Vercel Blob upload method used.

## 2.20 Dependencies

* Vercel Blob SDK
* Vercel Blob token in environment variables
* Next.js API Routes
* File metadata from frontend
* Patient profile mutation that later stores final URLs

---

# Feature 7: Vercel Blob File Upload Service

## 2.21 Description

Vercel Blob is used to store uploaded patient image files.

## 2.22 Requirements

The Blob storage layer must:

* Store insurance card images.
* Store photo ID images.
* Return stable public or accessible blob URLs.
* Support uploads up to 10 MB per image.
* Work in Vercel deployment.
* Use environment variables securely.

## 2.23 Stored File Metadata

Recommended metadata:

| Field             | Description                |
| ----------------- | -------------------------- |
| Original filename | Name of uploaded file      |
| MIME type         | File content type          |
| File size         | Size in bytes              |
| Blob URL          | Final stored file URL      |
| Upload timestamp  | When file was uploaded     |
| Document type     | Insurance card or photo ID |

---

# Feature 8: `createPatientProfile` Mutation

## 2.24 Description

After both files are uploaded successfully, the frontend calls `createPatientProfile` to insert the patient profile.

The insertion must be atomic for the patient profile data. This means the patient record should only be created when all required data is available.

## 2.25 Input Data

The mutation must receive:

```json
{
  "firstName": "Kanwal",
  "lastName": "Boparai",
  "email": "kanwal@example.com",
  "phone": "1234567890",
  "dateOfBirth": "2001-01-01",
  "address": "123 Example Street",
  "insuranceCardUrl": "https://blob-url/insurance-card.png",
  "photoIdUrl": "https://blob-url/photo-id.png",
  "consent": true
}
```

## 2.26 Backend Requirements

The mutation must:

1. Validate all required fields.
2. Validate email format.
3. Validate consent is true.
4. Validate document URLs exist.
5. Insert patient profile into database.
6. Return created patient profile or success response.
7. Fail safely if required fields are missing.

## 2.27 Dependencies

* Database
* Patient profile table/model
* Blob URLs from Vercel Blob
* Validation schema on backend or shared schema
* API/mutation framework used by the application

---

# Feature 9: Patient Profile Database Model

## 2.28 Description

The database stores submitted patient intake profiles.

## 2.29 Recommended Schema

Table: `patient_profiles`

| Column           | Type        | Required | Notes                 |
| ---------------- | ----------- | -------- | --------------------- |
| id               | UUID/String | Yes      | Primary key           |
| firstName        | String      | Yes      | Patient first name    |
| lastName         | String      | Yes      | Patient last name     |
| email            | String      | Yes      | Valid email           |
| phone            | String      | Yes      | Patient phone         |
| dateOfBirth      | Date/String | Yes      | Patient DOB           |
| address          | String      | Yes      | Patient address       |
| insuranceCardUrl | String      | Yes      | Vercel Blob URL       |
| photoIdUrl       | String      | Yes      | Vercel Blob URL       |
| consent          | Boolean     | Yes      | Must be true          |
| createdAt        | DateTime    | Yes      | Submission timestamp  |
| updatedAt        | DateTime    | Optional | Last update timestamp |

## 2.30 Data Integrity Requirements

* Patient profile should not be created without required fields.
* Patient profile should not be created without both document URLs.
* Patient profile should not be created without consent.
* Email should be stored in normalized lowercase format if possible.
* Created timestamp should be generated server-side.

---

# Feature 10: Admin Dashboard `/admin`

## 2.31 Description

The `/admin` page displays submitted patient profiles for operational review.

The page must server-side render patient profile data using `getPatientProfiles`.

The table must use Ag-Grid and support:

* Sorting
* Filtering
* Resizing columns
* Pagination
* Opening insurance card previews
* Opening photo ID previews

---

## 2.32 Admin User Flow

1. Admin opens `/admin`.
2. Server-side function calls `getPatientProfiles`.
3. Page loads with patient profile data.
4. Admin views records in Ag-Grid table.
5. Admin sorts columns.
6. Admin filters records.
7. Admin resizes columns.
8. Admin navigates through pages using pagination.
9. Admin clicks insurance card preview link/button.
10. Insurance card opens from stored blob URL.
11. Admin clicks photo ID preview link/button.
12. Photo ID opens from stored blob URL.

---

## 2.33 Admin Table Columns

Recommended Ag-Grid columns:

| Column         | Source             |
| -------------- | ------------------ |
| First name     | `firstName`        |
| Last name      | `lastName`         |
| Email          | `email`            |
| Phone          | `phone`            |
| Date of birth  | `dateOfBirth`      |
| Address        | `address`          |
| Insurance card | `insuranceCardUrl` |
| Photo ID       | `photoIdUrl`       |
| Consent        | `consent`          |
| Submitted at   | `createdAt`        |

---

## 2.34 Ag-Grid Requirements

Ag-Grid must be configured with:

```ts
sortable: true
filter: true
resizable: true
pagination: true
```

Additional recommended settings:

```ts
paginationPageSize: 10
domLayout: "autoHeight"
suppressCellFocus: false
```

Document columns should use custom cell renderers, such as:

* "View Insurance Card"
* "View Photo ID"

Clicking these should open the blob URL in a new tab or modal preview.

---

# Feature 11: `getPatientProfiles`

## 2.35 Description

`getPatientProfiles` is the backend/server function used by `/admin` to fetch patient profile records.

## 2.36 Requirements

The function must:

1. Query the patient profile database.
2. Return all required profile fields.
3. Include uploaded document URLs.
4. Include created timestamp.
5. Be callable during SSR.
6. Return data in a shape suitable for Ag-Grid.

## 2.37 Dependencies

* Database client
* Patient profile table/model
* Next.js `getServerSideProps`
* Admin page component
* Ag-Grid row data

---

# Feature 12: Server-Side Rendering for `/admin`

## 2.38 Description

The `/admin` page must load data server-side instead of relying only on client-side fetching.

## 2.39 Technical Requirements

The page should use:

```ts
export async function getServerSideProps() {
  const profiles = await getPatientProfiles();

  return {
    props: {
      profiles
    }
  };
}
```

The admin component receives `profiles` as props and passes them to Ag-Grid as row data.

## 2.40 Dependencies

* Next.js Pages Router
* `getServerSideProps`
* `getPatientProfiles`
* Database connection available during server render

---

# Feature 13: Document Preview

## 2.41 Description

Admins must be able to open uploaded insurance card and photo ID images from stored Vercel Blob URLs.

## 2.42 Requirements

The admin dashboard must:

* Show a preview action for insurance card.
* Show a preview action for photo ID.
* Open the corresponding blob URL.
* Handle missing URLs gracefully, although missing URLs should not occur for valid submissions.

## 2.43 User Flow

1. Admin sees a patient row.
2. Admin clicks "View Insurance Card."
3. Browser opens stored insurance card blob URL.
4. Admin returns to dashboard.
5. Admin clicks "View Photo ID."
6. Browser opens stored photo ID blob URL.

---

# 3. Functional Specification Document

---

# 3.1 System Architecture

## 3.1.1 High-Level Architecture

The system consists of:

1. Patient frontend page `/index`
2. Admin frontend page `/admin`
3. Next.js API route `/api/upload`
4. Vercel Blob file storage
5. Backend mutation `createPatientProfile`
6. Backend query `getPatientProfiles`
7. Database storing patient profiles
8. Vercel deployment environment

---

## 3.1.2 Component Map

| Component              | Responsibility                          |
| ---------------------- | --------------------------------------- |
| `/index`               | Patient intake form                     |
| React-Hook-Form        | Form state management                   |
| Zod                    | Validation schema                       |
| `/api/upload`          | Generate Vercel Blob signed upload URLs |
| Vercel Blob            | Store uploaded images                   |
| `createPatientProfile` | Save complete patient profile           |
| Database               | Persist patient profile records         |
| `/admin`               | Admin dashboard                         |
| `getPatientProfiles`   | Fetch patient profiles                  |
| Ag-Grid                | Admin table UI                          |
| Vercel                 | Hosting and environment                 |

---

# 3.2 Frontend Specification

## 3.2.1 `/index` Intake Form

### State Management

The form should use React-Hook-Form to manage:

* Current step
* Demographic values
* Selected files
* Consent
* Validation errors
* Submission state
* Success/error state

### Form Schema

Zod schema should validate:

```ts
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const intakeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(1, "Phone is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
  insuranceCard: z
    .any()
    .refine((file) => file, "Insurance card is required")
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Max file size is 10 MB")
    .refine((file) => file?.type?.startsWith("image/"), "File must be an image"),
  photoId: z
    .any()
    .refine((file) => file, "Photo ID is required")
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Max file size is 10 MB")
    .refine((file) => file?.type?.startsWith("image/"), "File must be an image"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent is required" })
  })
});
```

---

## 3.2.2 Step Navigation

The form should support:

* `Next`
* `Back`
* `Submit`

Navigation rules:

| Current Step | Action | Requirement                         |
| ------------ | ------ | ----------------------------------- |
| Step 1       | Next   | Demographics valid                  |
| Step 2       | Back   | Always allowed                      |
| Step 2       | Next   | Documents valid                     |
| Step 3       | Back   | Always allowed                      |
| Step 3       | Submit | Full form valid and consent checked |

---

## 3.2.3 Submission Logic

Frontend submission pseudocode:

```ts
async function onSubmit(values) {
  setIsSubmitting(true);

  try {
    const insuranceUpload = await getSignedUploadUrl(values.insuranceCard);
    const insuranceBlobUrl = await uploadFileToBlob(
      values.insuranceCard,
      insuranceUpload
    );

    const photoUpload = await getSignedUploadUrl(values.photoId);
    const photoBlobUrl = await uploadFileToBlob(
      values.photoId,
      photoUpload
    );

    await createPatientProfile({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      dateOfBirth: values.dateOfBirth,
      address: values.address,
      insuranceCardUrl: insuranceBlobUrl,
      photoIdUrl: photoBlobUrl,
      consent: values.consent
    });

    setSuccess(true);
  } catch (error) {
    setError("Something went wrong. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
}
```

---

# 3.3 Backend Specification

## 3.3.1 `/api/upload`

### Method

`POST`

### Purpose

Generate a signed upload URL for Vercel Blob.

### Request Body

```json
{
  "filename": "photo-id.jpg",
  "contentType": "image/jpeg",
  "fileType": "photoId"
}
```

### Validation

The API route must validate:

* `filename` exists.
* `contentType` exists.
* `contentType` starts with `image/`.
* `fileType` is either `insuranceCard` or `photoId`.

### Response

```json
{
  "uploadUrl": "signed-upload-url",
  "pathname": "generated-blob-path"
}
```

### Error Responses

| Error                       | Status |
| --------------------------- | ------ |
| Missing file metadata       | 400    |
| Invalid file type           | 400    |
| Failed to create upload URL | 500    |

---

## 3.3.2 `createPatientProfile`

### Purpose

Create the patient profile after successful file uploads.

### Required Input

* First name
* Last name
* Email
* Phone
* Date of birth
* Address
* Insurance card URL
* Photo ID URL
* Consent

### Validation

The server should validate:

* Required demographic data exists.
* Email is valid.
* Insurance card URL exists.
* Photo ID URL exists.
* Consent is true.

### Database Operation

The mutation should perform a single insert operation.

Example:

```ts
await db.patientProfile.create({
  data: {
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    address,
    insuranceCardUrl,
    photoIdUrl,
    consent,
    createdAt: new Date()
  }
});
```

---

## 3.3.3 `getPatientProfiles`

### Purpose

Fetch patient profile records for the admin dashboard.

### Output

```json
[
  {
    "id": "profile-id",
    "firstName": "Kanwal",
    "lastName": "Boparai",
    "email": "kanwal@example.com",
    "phone": "1234567890",
    "dateOfBirth": "2001-01-01",
    "address": "123 Example Street",
    "insuranceCardUrl": "https://blob-url/insurance.png",
    "photoIdUrl": "https://blob-url/photo.png",
    "consent": true,
    "createdAt": "2026-06-09T20:00:00.000Z"
  }
]
```

### Requirements

* Must be server-side callable.
* Must return all fields needed by Ag-Grid.
* Should sort by newest submissions first.

---

# 3.4 Admin Dashboard Specification

## 3.4.1 Page

Route:

```txt
/admin
```

## 3.4.2 Data Loading

Use SSR:

```ts
export async function getServerSideProps() {
  const profiles = await getPatientProfiles();

  return {
    props: {
      profiles
    }
  };
}
```

## 3.4.3 Table Component

Use Ag-Grid.

Required features:

* Sortable columns
* Filterable columns
* Resizable columns
* Pagination

Recommended column definition:

```ts
const columnDefs = [
  { field: "firstName", headerName: "First Name", sortable: true, filter: true, resizable: true },
  { field: "lastName", headerName: "Last Name", sortable: true, filter: true, resizable: true },
  { field: "email", headerName: "Email", sortable: true, filter: true, resizable: true },
  { field: "phone", headerName: "Phone", sortable: true, filter: true, resizable: true },
  { field: "dateOfBirth", headerName: "Date of Birth", sortable: true, filter: true, resizable: true },
  { field: "address", headerName: "Address", sortable: true, filter: true, resizable: true },
  {
    field: "insuranceCardUrl",
    headerName: "Insurance Card",
    cellRenderer: ViewDocumentButton
  },
  {
    field: "photoIdUrl",
    headerName: "Photo ID",
    cellRenderer: ViewDocumentButton
  },
  { field: "createdAt", headerName: "Submitted At", sortable: true, filter: true, resizable: true }
];
```

---

# 3.5 Microservice and Backend Component Dependencies

## 3.5.1 Patient Intake Frontend

Depends on:

* React
* Next.js Pages Router
* React-Hook-Form
* Zod
* `/api/upload`
* Vercel Blob upload response
* `createPatientProfile`

Responsibilities:

* Render intake UI.
* Validate user input.
* Manage step transitions.
* Upload files.
* Submit patient profile.

---

## 3.5.2 Upload API Service

Depends on:

* Next.js API Routes
* Vercel Blob SDK
* Vercel Blob environment token

Responsibilities:

* Generate signed upload URLs.
* Validate requested file metadata.
* Return upload credentials to frontend.

---

## 3.5.3 Blob Storage Service

Depends on:

* Vercel Blob
* Signed upload URL generated by `/api/upload`

Responsibilities:

* Store image files.
* Return final blob URLs.
* Make uploaded files accessible for admin preview.

---

## 3.5.4 Patient Profile Mutation Service

Depends on:

* Database client
* Uploaded blob URLs
* Validated patient data

Responsibilities:

* Validate profile payload.
* Insert patient profile record.
* Ensure patient profile is not created unless required data exists.

---

## 3.5.5 Patient Profile Query Service

Depends on:

* Database client
* Patient profile table/model

Responsibilities:

* Fetch patient profiles.
* Return data for SSR admin dashboard.
* Include document URLs for preview.

---

## 3.5.6 Admin Dashboard Frontend

Depends on:

* Next.js Pages Router
* `getServerSideProps`
* `getPatientProfiles`
* Ag-Grid
* Stored blob URLs

Responsibilities:

* Display patient profiles.
* Support sorting, filtering, resizing, and pagination.
* Provide document preview links.

---

# 3.6 Environment Variables

Required environment variables may include:

```txt
BLOB_READ_WRITE_TOKEN=
DATABASE_URL=
```

Depending on the database/backend framework, additional environment variables may be required.

The assignment mentions committing `.env`, so the project should include the required environment variables for evaluation. In a real production system, secrets should not be committed to GitHub.

---

# 3.7 Error Handling Requirements

## Patient Intake Errors

The frontend must show clear errors for:

* Missing first name
* Missing last name
* Invalid email
* Missing phone
* Missing date of birth
* Missing address
* Missing insurance card
* Missing photo ID
* Non-image file upload
* File larger than 10 MB
* Missing consent
* Failed signed URL generation
* Failed file upload
* Failed patient profile creation

## Admin Errors

The admin dashboard should handle:

* No patient profiles available
* Failed SSR data loading
* Missing document URL
* Broken blob preview link

---

# 3.8 Loading States

The system should include loading states for:

* Moving between steps if async validation is added
* Submitting the intake form
* Generating signed upload URLs
* Uploading insurance card
* Uploading photo ID
* Creating patient profile
* Loading admin dashboard data through SSR

Recommended patient-facing message:

"Submitting your intake form…"

---

# 3.9 Success States

After successful submission, the patient should see a confirmation message.

Example:

"Your intake form has been submitted successfully."

The form should prevent duplicate submissions after success.

---

# 3.10 Security and Privacy Requirements

Because the application handles patient-related information and identity documents, the system should follow privacy-aware practices.

## Required

* Validate file type and size before upload.
* Avoid storing files before validation.
* Store only final blob URLs in the database.
* Do not expose database credentials to the frontend.
* Use server-side functions for database operations.
* Use environment variables for tokens and database URLs.

## Recommended

* Add authentication to `/admin`.
* Restrict document preview access.
* Avoid public access to sensitive document URLs in production.
* Add audit logs for admin document views.
* Avoid committing real production secrets.

---

# 3.11 Non-Functional Requirements

## Performance

* Form interactions should feel instant.
* Admin dashboard should load SSR data efficiently.
* Ag-Grid pagination should prevent large-table UI slowdown.

## Reliability

* Failed uploads should not create incomplete patient profiles.
* Failed profile creation should show an error.
* Duplicate submissions should be prevented.

## Maintainability

* Keep form schema centralized.
* Keep upload logic reusable.
* Separate frontend components from backend services.
* Use typed data models where possible.

## Accessibility

* Inputs should have labels.
* Errors should be readable.
* Buttons should be keyboard accessible.
* Step progress should be clear.
* File upload controls should be accessible.

---

# 3.12 Deployment Requirements

The project must be:

* Pushed to a private GitHub repository.
* Deployed on Vercel Hobby.
* Configured with required environment variables.
* Shared with a live deployment link.
* Submitted with screenshots or videos if required.

---

# 3.13 Acceptance Criteria

## Patient Intake

* User can open `/index`.
* User can complete Step 1 demographics.
* Required fields are validated.
* Invalid email is rejected.
* User can upload insurance card image.
* User can upload photo ID image.
* Non-image files are rejected.
* Files over 10 MB are rejected.
* User can review Step 1 data on Step 3.
* User must check consent before submitting.
* On submit, both files upload to Vercel Blob.
* Final blob URLs are saved with the patient profile.
* Patient profile is created only after both uploads succeed.
* User sees success message after submission.

## Admin Dashboard

* Admin can open `/admin`.
* Page uses SSR to fetch profiles.
* Admin can see patient profiles in Ag-Grid.
* Admin can sort columns.
* Admin can filter columns.
* Admin can resize columns.
* Admin can paginate records.
* Admin can open insurance card preview.
* Admin can open photo ID preview.

## Backend

* `/api/upload` returns signed upload URL.
* `createPatientProfile` stores complete profile data.
* `getPatientProfiles` returns stored patient profiles.
* Database includes patient demographics, document URLs, consent, and timestamps.

---

# 3.14 Suggested Folder Structure

```txt
/pages
  /index.tsx
  /admin.tsx
  /api
    /upload.ts

/components
  /intake
    DemographicsStep.tsx
    DocumentsStep.tsx
    ConfirmationStep.tsx
    Stepper.tsx
  /admin
    PatientProfilesGrid.tsx
    ViewDocumentButton.tsx

/lib
  db.ts
  blob.ts
  patients.ts
  validations.ts

/types
  patient.ts
```

---

# 3.15 Implementation Checklist

## Frontend

* Build `/index`.
* Add 3-step intake UI.
* Add React-Hook-Form.
* Add Zod schema.
* Add demographic fields.
* Add file upload fields.
* Add confirmation screen.
* Add consent checkbox.
* Add submit loading state.
* Add success/error handling.

## Upload Backend

* Build `/api/upload`.
* Add file metadata validation.
* Integrate Vercel Blob.
* Return signed upload details.

## Database Backend

* Create patient profile schema/table.
* Implement `createPatientProfile`.
* Implement `getPatientProfiles`.
* Ensure atomic insert after uploads.

## Admin

* Build `/admin`.
* Add `getServerSideProps`.
* Fetch profiles using `getPatientProfiles`.
* Add Ag-Grid.
* Enable sorting.
* Enable filtering.
* Enable resizing.
* Enable pagination.
* Add document preview buttons.

## Deployment

* Configure `.env`.
* Push to private GitHub repo.
* Deploy to Vercel Hobby.
* Test `/index`.
* Test `/admin`.
* Submit live link and screenshots/video.

---

# 4. Summary

This application is a full-stack patient intake platform with a patient-facing multi-step form and an admin-facing operational dashboard. The core workflow is:

1. Patient enters demographics.
2. Patient uploads insurance card and photo ID.
3. Patient confirms information and gives consent.
4. Files are uploaded to Vercel Blob using signed URLs from `/api/upload`.
5. Final blob URLs are stored with patient profile data using `createPatientProfile`.
6. Admin reviews submissions through `/admin`, using SSR data from `getPatientProfiles` and Ag-Grid for operational table features.

The most important technical requirement is that the patient profile should only be created after both document uploads succeed, so the admin dashboard always receives complete records with valid demographic data, consent, and document preview URLs.
