
export interface Course {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  lessons: number;
  enrolled: number;
  rating: number;
  price: string;
}

export const courses: Course[] = [
  {
    id: 1,
    title: "Cryptocurrency Fundamentals",
    description: "Learn the basics of blockchain, Bitcoin, and major cryptocurrencies",
    difficulty: "Free",
    duration: "2 hours",
    lessons: 12,
    enrolled: 1420,
    rating: 4.8,
    price: "Free"
  },
  {
    id: 2,
    title: "Technical Analysis Mastery",
    description: "Master chart patterns, indicators, and trading signals",
    difficulty: "Pro",
    duration: "4 hours",
    lessons: 18,
    enrolled: 890,
    rating: 4.9,
    price: "Pro"
  },
  {
    id: 3,
    title: "Risk Management Strategies",
    description: "Protect your capital with proven risk management techniques",
    difficulty: "Free",
    duration: "1.5 hours",
    lessons: 8,
    enrolled: 756,
    rating: 4.7,
    price: "Free"
  },
  {
    id: 4,
    title: "Advanced Trading Psychology",
    description: "Control emotions and develop a winning trader mindset",
    difficulty: "Advanced",
    duration: "3 hours",
    lessons: 15,
    enrolled: 423,
    rating: 4.9,
    price: "Pro"
  },
  {
    id: 5,
    title: "DeFi and Yield Farming",
    description: "Explore decentralized finance opportunities and strategies",
    difficulty: "Pro",
    duration: "2.5 hours",
    lessons: 10,
    enrolled: 612,
    rating: 4.6,
    price: "Pro"
  },
  {
    id: 6,
    title: "Portfolio Diversification",
    description: "Build a balanced crypto portfolio that minimizes risk",
    difficulty: "Free",
    duration: "1 hour",
    lessons: 6,
    enrolled: 934,
    rating: 4.5,
    price: "Free"
  },
  {
    id: 7,
    title: "Crypto Safety & Wallet Security",
    description: "Learn how to protect your crypto assets with safe wallet practices and scam detection strategies",
    difficulty: "Free",
    duration: "1 hour",
    lessons: 7,
    enrolled: 615,
    rating: 4.6,
    price: "Free"
  },
  {
    id: 8,
    title: "Reading the Blockchain: On-Chain Insights for Traders",
    description: "Explore on-chain tools and metrics to gain a trading edge through blockchain transparency",
    difficulty: "Advanced",
    duration: "2 hours",
    lessons: 9,
    enrolled: 388,
    rating: 4.7,
    price: "Pro"
  },
  {
    id: 9,
    title: "Tokenomics & Project Due Diligence",
    description: "Understand token supply mechanics, governance, and utility to evaluate crypto projects wisely",
    difficulty: "Advanced",
    duration: "2.5 hours",
    lessons: 11,
    enrolled: 514,
    rating: 4.8,
    price: "Pro"
  },
  {
    id: 10,
    title: "Crypto Taxes 101: What You Need to Know",
    description: "Learn how to track, report, and minimize taxes on your crypto trades and holdings",
    difficulty: "Free",
    duration: "1 hour",
    lessons: 6,
    enrolled: 710,
    rating: 4.5,
    price: "Free"
  },
  {
    id: 11,
    title: "Crypto in the Real World",
    description: "Discover real-world crypto use cases in payments, NFTs, stablecoins, and emerging economies",
    difficulty: "Advanced",
    duration: "45 mins",
    lessons: 5,
    enrolled: 832,
    rating: 4.4,
    price: "Free"
  },
  {
    id: 12,
    title: "Intro to Crypto Bots & Algorithmic Trading",
    description: "Automate your strategy using trading bots, DCA, and backtesting tools like 3Commas and Pionex",
    difficulty: "Pro",
    duration: "3 hours",
    lessons: 12,
    enrolled: 289,
    rating: 4.7,
    price: "Pro"
  },
  {
    id: 13,
    title: "Mastering Market Sentiment",
    description: "Use sentiment tools, social trends, and news flow to anticipate crypto market shifts",
    difficulty: "Advanced",
    duration: "1.5 hours",
    lessons: 8,
    enrolled: 477,
    rating: 4.6,
    price: "Pro"
  }
];
