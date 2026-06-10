import { ApolloClient, InMemoryCache } from "@apollo/client";
import { SchemaLink } from "@apollo/client/link/schema";

import { schema } from "@/lib/graphql/schema";

/**
 * SSR-only Apollo client: executes queries against the executable schema
 * in-process (real resolvers, no HTTP self-call). Import only from
 * getServerSideProps — Next strips it from the client bundle.
 */
export function createSsrApolloClient() {
  return new ApolloClient({
    ssrMode: true,
    link: new SchemaLink({ schema }),
    cache: new InMemoryCache(),
  });
}
