import { gql } from "@apollo/client";

// Browser-safe GraphQL documents (no server imports).

export const CREATE_PATIENT_PROFILE = gql`
  mutation CreatePatientProfile($input: CreatePatientProfileInput!) {
    createPatientProfile(input: $input) {
      id
      createdAt
    }
  }
`;

export const GET_PATIENT_PROFILES = gql`
  query GetPatientProfiles {
    getPatientProfiles {
      id
      firstName
      lastName
      email
      phone
      dateOfBirth
      address
      insuranceCardUrl
      photoIdUrl
      consent
      createdAt
    }
  }
`;
