const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');

const typeDefs = gql`
  type Query {
    viewer(id: ID!): User
    viewers(ids: [ID!]): [User]
  }

  type User @key(fields: "id") {
    id: ID!
  }
`;

const resolvers = {
  Query: {
    viewer(_, args) {
      return { id: args.id };
    },

    viewers(_, args) {
      return args.ids.map((id) => ({ id }));
    },
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
});

server.listen(4001).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
