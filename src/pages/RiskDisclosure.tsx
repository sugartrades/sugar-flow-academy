
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function RiskDisclosure() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">SugarTrades.io Risk Disclosure Statement</h1>
          
          <p className="text-muted-foreground mb-8">
            <strong>Last Updated:</strong> May 29, 2025
          </p>
          
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-8">
            <p className="font-semibold text-red-800 mb-4">
              IF YOU DO NOT AGREE WITH ANY PORTION OF THIS RISK DISCLOSURE, YOU ARE PROHIBITED FROM USING OR ACCESSING THE SITE.
            </p>
            <p className="text-red-700">
              THIS RISK DISCLOSURE INCORPORATES BY REFERENCE THE TERMS AND CONDITIONS FOUND AT{' '}
              <a href="http://WWW.SUGARTRADES.IO" className="underline">WWW.SUGARTRADES.IO</a>{' '}
              ("THE SITE") IN THEIR ENTIRETY AS IF SET FORTH FULLY HEREIN. FOR PURPOSES OF THIS DISCLOSURE, THE SITE AND OTHER SERVICES OFFERED BY SUGARTRADES.IO ARE COLLECTIVELY REFERRED TO AS "SUGARTRADES."
            </p>
          </div>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">RISK DISCLOSURE:</h2>
          <p className="mb-6">
            SUGARTRADES IS NOT A REGISTERED BROKER, ANALYST OR INVESTMENT ADVISOR. THE SERVICES, CONTENT, AND INFORMATION PROVIDED BY SUGARTRADES ARE EDUCATIONAL IN NATURE AND SHOULD NOT BE TREATED AS FINANCIAL ADVISORY SERVICES OR INVESTMENT ADVICE. TRADING AND INVESTING IN CRYPTOCURRENCIES INVOLVES SUBSTANTIAL RISK OF LOSS AND IS NOT RECOMMENDED FOR ANYONE WHO IS NOT A TRAINED INVESTOR. SUCH ACTIVITIES SHALL BE CONDUCTED AT YOUR OWN RISK. WE RECOMMEND THAT YOU CONSULT AN INDEPENDENT LICENSED FINANCIAL ADVISOR BEFORE ENGAGING IN ANY TRADING OR INVESTING ACTIVITY.
          </p>
          <p className="mb-6">
            PAST PERFORMANCE AND RESULTS DO NOT GUARANTEE FUTURE RESULTS. SUGARTRADES IS NOT RESPONSIBLE FOR ANY LOSSES THAT OCCUR AS A RESULT OF OUR SERVICES.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">TRADE AND INVEST AT YOUR OWN RISK:</h2>
          <p className="mb-6">
            Trading and investing in cryptocurrencies involves substantial risk of loss and is not suitable for every investor. The valuation of cryptocurrencies and futures may fluctuate, and, as a result, you may lose more than your original investment. Futures trading is highly leveraged and small market movements can have significant impacts, both positive and negative, on your trading account.
          </p>
          <p className="mb-6">
            If the market moves against you, you may sustain a total loss greater than the amount you deposited. You are responsible for all risks and financial resources you use. Do not engage in trading unless you fully understand the risks involved. If you do not, seek advice from a licensed financial advisor.
          </p>
          <p className="mb-6">
            Cryptocurrencies represent a rapidly evolving and unpredictable market. SugarTrades cannot and does not claim to anticipate all risks. Forward-looking statements made by SugarTrades or its team are not guarantees of future outcomes and are not obligations to update.
          </p>
          <p className="mb-6">
            Results, performance, or events may differ materially from any forward-looking statements. Factors contributing to this include, but are not limited to: market volatility; government regulation; cyberattacks; misinformation; manipulation; economic conditions; geopolitical conflict.
          </p>
          <p className="mb-6">
            Investing in cryptocurrencies is an individual decision. You must assess your capabilities, risk tolerance, and goals before engaging in trading. You alone are responsible for any decisions and outcomes.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">SERVICES AND CONTENT ARE NOT INVESTMENT ADVICE:</h2>
          <p className="mb-6">
            None of SugarTrades' content constitutes a recommendation that any cryptocurrency, investment strategy, or trading action is suitable for you. We do not provide personalized investment advice. Any opinions, research, or educational materials provided are for general informational purposes only.
          </p>
          <p className="mb-6">
            All strategies are used at your own discretion and risk. Leverage, margin, and shorting strategies carry unique risks and must be approached with caution.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">YOUR REPRESENTATIONS AND WARRANTIES:</h2>
          <p className="mb-6">
            By using SugarTrades, you understand and agree that you are solely responsible for your actions. Neither SugarTrades nor its team guarantees the performance of any strategy or content.
          </p>
          <p className="mb-4">You understand that:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Cryptocurrency markets are volatile and risky.</li>
            <li>SugarTrades does not guarantee accuracy or completeness of information.</li>
            <li>You must not rely solely on our content to make trading decisions.</li>
            <li>You trade and invest at your own risk.</li>
            <li>No refunds are guaranteed.</li>
            <li>Community comments do not represent SugarTrades.</li>
            <li>Technical failures, system errors, or delays may occur.</li>
            <li>You are responsible for verifying legal status of crypto use in your country.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">DISCLAIMER OF LIABILITY:</h2>
          <p className="mb-6">
            SugarTrades is not liable for any losses incurred as a result of using any strategies, content, or services offered on this site. Information is believed to be accurate but is not guaranteed. No representation of future performance is made.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">CFTC RULE 4.41 – HYPOTHETICAL OR SIMULATED PERFORMANCE RESULTS HAVE LIMITATIONS.</h2>
          <p className="mb-6">
            THEY DO NOT REPRESENT ACTUAL TRADING. NO REPRESENTATION IS BEING MADE THAT ANY ACCOUNT WILL OR IS LIKELY TO ACHIEVE PROFITS OR LOSSES SIMILAR TO THOSE SHOWN.
          </p>
          
          <p className="font-semibold mt-8">
            By using SugarTrades.io, you acknowledge these risks and accept full responsibility for your trading decisions.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
