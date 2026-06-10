export const typeDefs = /* GraphQL */ `
  type PatientProfile {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    phone: String!
    dateOfBirth: String!
    address: String!
    insuranceCardUrl: String!
    photoIdUrl: String!
    consent: Boolean!
    createdAt: String!
  }

  input CreatePatientProfileInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String!
    dateOfBirth: String!
    address: String!
    insuranceCardUrl: String!
    photoIdUrl: String!
    consent: Boolean!
  }

  type Query {
    getPatientProfiles: [PatientProfile!]!
  }

  type Mutation {
    createPatientProfile(input: CreatePatientProfileInput!): PatientProfile!
  }
`;
