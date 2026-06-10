import { makeExecutableSchema } from "@graphql-tools/schema";

import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";

// Single executable schema, shared by the /api/graphql handler and the
// SSR SchemaLink client (admin page) so both paths run the same resolvers.
export const schema = makeExecutableSchema({ typeDefs, resolvers });
