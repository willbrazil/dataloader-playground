const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');

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
};

function fetchMarketByProductId(id) {
  return MARKET_BY_PRODUCT[id];
}

const resolvers = {
  Product: {
    market: (product) => {
      return fetchMarketByProductId(product.id);
    },
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
});

server.listen(4003).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
