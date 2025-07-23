// XRPL Wallet addresses for monitoring
export const MONITORED_WALLETS = {
  arthurBritto: {
    name: "Arthur Britto",
    addresses: [
      "rUzSNPtxrmeSTpnjsvaTuQvF2SQFPFSvLn",
      "rQKZSMgmBJvv3FvWj1vuGjUXnegTqJc25z",
      "rsXNUCJkXeyFuGHyfRnuWPita2ns32upBD",
      "ragKXjY7cBTXUus32sYHZVfkY46Nt2Q829",
      "rsF9cc6gniHLTR2Jng29ng21ez7L9PpmPt",
      "rJ5EJYsW6Vkeruj1LAmQYq3VP7QUQKBH1W",
      "rGRGYWLmSvPuhKm4rQV287PpJUgTB1VeD7",
      "rLHVsKqC72M8FXPfEwSyYkufezZJvNZuDY",
      "rEbKBkgKSQgm5x8PycZc5VjdCVTmqYfcY1",
      "rG2eEaeiJou6cVQ3KtX7XMNwGhuW99xmHP"
    ]
  },
  chrisLarsen: {
    name: "Chris Larsen",
    addresses: [
      "r476293LUcDqtjiSGJ5Dh44J1xBCDWeX3",
      "r44CNwMWyJf4MEA1eHVMLPTkZ1LSv4Bzrv",
      "rD6tdgGHG7hwGTA6P39aE7W89fbqxXRjzk",
      "rDfrrrBJZshSQDvfT2kmL9oUBdish52unH",
      "rhREXVHV938ToGkdJQ9NCYEY4x8kSEtjna",
      "rPoJNiCk7XSFLR28nH2hAbkYqjtMC3hK2k",
      "raorBmbzraA6TooLQ6kGWRSx1HQq7d4gzS",
      "rJNLz3A1qPKfWCtJLPhmMZAfBkutC2Qojm",
      "rB5TihdPbKgMrkFqrqUC3yLdE8hhv4BdeY"
    ]
  }
};

// Exchange addresses with destination tags
export const EXCHANGE_ADDRESSES = {
  arthurBritto: {
    name: "Arthur Britto",
    exchanges: [
      {
        address: "rLHzPsX6oXkzU2qL12kHCH8G8cnZv1rBJh",
        exchange: "Kraken",
        destinationTag: "2497629214"
      },
      {
        address: "rDsbeomae4FXwgQTJp9Rs64Qg9vDiTCdBv",
        exchange: "Bitstamp",
        destinationTag: "70910611"
      }
    ]
  },
  chrisLarsen: {
    name: "Chris Larsen",
    exchanges: [
      {
        address: "rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg",
        exchange: "Coinbase",
        destinationTag: "371918471"
      },
      {
        address: "rNxp4h8apvRis6mJf9Sh8C6iRxfrDWN7AV",
        exchange: "Binance",
        destinationTag: "252006006"
      },
      {
        address: "rNxp4h8apvRis6mJf9Sh8C6iRxfrDWN7AV",
        exchange: "Binance",
        destinationTag: "323022239"
      },
      {
        address: "rNxp4h8apvRis6mJf9Sh8C6iRxfrDWN7AV",
        exchange: "Binance",
        destinationTag: "469965402"
      },
      {
        address: "rJn2zAPdFA193sixJwuFixRkYDUtx3apQh",
        exchange: "Bybit",
        destinationTag: "2496734"
      },
      {
        address: "rJn2zAPdFA193sixJwuFixRkYDUtx3apQh",
        exchange: "Bybit",
        destinationTag: "13240925"
      },
      {
        address: "rDsbeomae4FXwgQTJp9Rs64Qg9vDiTCdBv",
        exchange: "Bitstamp",
        destinationTag: "35064548"
      },
      {
        address: "rnBKit9uv2L3pH8HQwPKpDJhhwACKct3ro",
        exchange: "Whitebit",
        destinationTag: "3084217433"
      }
    ]
  }
};

// Configuration for monitoring
export const MONITORING_CONFIG = {
  checkInterval: 60000, // 1 minute in milliseconds
  alertThreshold: 10000, // 10,000 XRP threshold for regular wallets
  exchangeAlertThreshold: 50000, // 50,000 XRP threshold for exchange deposits
  paymentAmount: 5 // 5 XRP payment for access
};

// Get all wallet addresses as a flat array
export const getAllWalletAddresses = () => {
  return [
    ...MONITORED_WALLETS.arthurBritto.addresses,
    ...MONITORED_WALLETS.chrisLarsen.addresses
  ];
};

// Get all exchange addresses as a flat array
export const getAllExchangeAddresses = () => {
  return [
    ...EXCHANGE_ADDRESSES.arthurBritto.exchanges.map(ex => ex.address),
    ...EXCHANGE_ADDRESSES.chrisLarsen.exchanges.map(ex => ex.address)
  ];
};

// Get wallet owner by address
export const getWalletOwner = (address: string) => {
  if (MONITORED_WALLETS.arthurBritto.addresses.includes(address)) {
    return MONITORED_WALLETS.arthurBritto.name;
  }
  if (MONITORED_WALLETS.chrisLarsen.addresses.includes(address)) {
    return MONITORED_WALLETS.chrisLarsen.name;
  }
  return "Unknown";
};

// Get exchange info by address and destination tag
export const getExchangeInfo = (address: string, destinationTag?: string) => {
  for (const [owner, data] of Object.entries(EXCHANGE_ADDRESSES)) {
    const exchange = data.exchanges.find(ex => 
      ex.address === address && ex.destinationTag === destinationTag
    );
    if (exchange) {
      return {
        owner: data.name,
        exchange: exchange.exchange,
        destinationTag: exchange.destinationTag
      };
    }
  }
  return null;
};

// Check if address is an exchange address
export const isExchangeAddress = (address: string) => {
  return getAllExchangeAddresses().includes(address);
};

// Get owner name by exchange address and destination tag
export const getOwnerByExchangeDeposit = (address: string, destinationTag?: string) => {
  const exchangeInfo = getExchangeInfo(address, destinationTag);
  return exchangeInfo ? exchangeInfo.owner : "Unknown";
};

// Get all monitored addresses (both regular and exchange)
export const getAllMonitoredAddresses = () => {
  return [
    ...getAllWalletAddresses(),
    ...getAllExchangeAddresses()
  ];
};