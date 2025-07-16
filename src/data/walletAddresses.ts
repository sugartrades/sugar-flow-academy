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
      "rJNLz3A1qPKfWCtJLPhmMZAfBkutC2Qojm"
    ]
  }
};

// Configuration for monitoring
export const MONITORING_CONFIG = {
  checkInterval: 60000, // 1 minute in milliseconds
  alertThreshold: 10000, // 10,000 XRP threshold
  paymentAmount: 5 // 5 XRP payment for access
};

// Get all wallet addresses as a flat array
export const getAllWalletAddresses = () => {
  return [
    ...MONITORED_WALLETS.arthurBritto.addresses,
    ...MONITORED_WALLETS.chrisLarsen.addresses
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