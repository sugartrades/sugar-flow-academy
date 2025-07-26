import LeverageProfitCalculator from '@/components/LeverageProfitCalculator';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 glow-text">
            SugarTrades.io
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional trading tools and education for cryptocurrency traders
          </p>
        </div>

        {/* Calculator Section */}
        <LeverageProfitCalculator />
      </div>
    </div>
  );
};

export default Index;
