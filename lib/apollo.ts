import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

// Browser client for the intake form's createPatientProfile mutation.
export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: "/api/graphql" }),
  cache: new InMemoryCache(),
});
