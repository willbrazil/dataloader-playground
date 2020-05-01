const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');
const DataLoader = require('dataloader');

const typeDefs = gql`
  extend type Product @key(fields: "id") {
    id: ID! @external
    market: Market
  }

  type Market {
    lowestAsk: Float
    highestBid: Float
  }
`;

const MARKET_BY_PRODUCT = {
  'product-A': { lowestAsk: 20, highestBid: 10 },
  'product-B': { lowestAsk: 300, highestBid: 150 },
  'product-C': { lowestAsk: 1000, highestBid: 400 },
};

async function fetchMarketByProductIdBatch(ids) {
  console.log(`Getting market data for products: ${ids}`);
  return ids.map((id) => MARKET_BY_PRODUCT[id] || null);
}

function createContext() {
  const loader = new DataLoader(fetchMarketByProductIdBatch);

  return {
    api: {
      getMarketByProductId: (key) => loader.load(key),
    },
  };
}

const resolvers = {
  Product: {
    market: (product, _, context) => {
      return context.api.getMarketByProductId(product.id);
    },
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  context: createContext,
});

server.listen(4003).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
