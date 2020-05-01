```
yarn watch
```

Go to playground, run query:

```
query GetMyProducts{
  viewers(ids:["user-1", "user-2"]) {
    products {
      name
      market {
        lowestAsk
        highestBid
      }
    }
  }
}
```
