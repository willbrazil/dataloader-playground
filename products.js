const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');

const typeDefs = gql`
  extend type User @key(fields: "id") {
    id: ID! @external
    products: [Product]
  }

  type Product @key(fields: "id") {
    id: ID!
    name: String
  }
`;

const PRODUCTS = {
  'product-A': { id: 'product-A', name: 'product-A-name' },
  'product-B': { id: 'product-B', name: 'product-B-name' },
};

const PRODUCTS_BY_USER = {
  'user-1': ['product-A', 'product-B'],
};

function fetchProductById(id) {
  return PRODUCTS[id];
}

const resolvers = {
  User: {
    products(user) {
      if (!PRODUCTS_BY_USER[user.id]) {
        return [];
      }

      return PRODUCTS_BY_USER[user.id].map(fetchProductById);
    },
  },

  Product: {
    __resolveReference(product) {
      return PRODUCTS[product.id];
    },
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
});

server.listen(4002).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
