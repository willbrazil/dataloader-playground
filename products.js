const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');
const DataLoader = require('dataloader');

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
  'product-C': { id: 'product-C', name: 'product-C-name' },
};

const PRODUCTS_BY_USER = {
  'user-1': ['product-A', 'product-B'],
  'user-2': ['product-C'],
};

async function fetchProductByUserIdBatch(ids) {
  console.log(`Getting product data for user: ${ids}`);

  return ids.map((id) => {
    const productIds = PRODUCTS_BY_USER[id];
    if (!productIds) {
      return [];
    }

    return productIds.map((id) => PRODUCTS[id]);
  });
}

function createContext() {
  const loader = new DataLoader(fetchProductByUserIdBatch);

  return {
    api: {
      getProductByUserId: (key) => loader.load(key),
    },
  };
}

const resolvers = {
  User: {
    products(user, _, context) {
      if (!PRODUCTS_BY_USER[user.id]) {
        return [];
      }

      return context.api.getProductByUserId(user.id);
    },
  },

  Product: {
    __resolveReference(product) {
      console.log(`Resolving product reference: ${product.id}`);
      return PRODUCTS[product.id];
    },
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  context: createContext,
});

server.listen(4002).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
