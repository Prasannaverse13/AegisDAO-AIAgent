import { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import WalletConnector from './WalletConnector';
import TreasuryOverview from './TreasuryOverview';
import MarketSentiment from './MarketSentiment';
import AIRebalancingProposal from './AIRebalancingProposal';
import RiskPolicyManager from './RiskPolicyManager';
import AIChat from './AIChat';
import ProposalHistory from './ProposalHistory';
import AgentMonitor from './AgentMonitor';
import { toast } from '@/hooks/use-toast';

const AegisDashboard = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address,
  });

  const [currentProposal] = useState({
    action: 'Rebalance',
    proposal: 'Sell 0.002 ETH to buy USDC.',
    justification: "The proposed rebalancing aligns the DAO's portfolio with its risk tolerance policy, which specifies a low volatility target and a preferred asset class of stablecoins. Converting the current ETH balance to USDC mitigates market volatility risk and moves the portfolio towards the target stablecoin allocation."
  });

  const handleApproveProposal = () => {
    toast({
      title: "Proposal Executed",
      description: "Shielded transaction submitted to Midnight blockchain",
    });
  };

  const handleRejectProposal = () => {
    toast({
      title: "Proposal Rejected",
      description: "AI will generate a new proposal based on updated parameters",
      variant: "destructive",
    });
  };

  const handlePolicyUpdate = (policy: string) => {
    console.log('Updating policy:', policy);
    toast({
      title: "Risk Policy Updated",
      description: "AI parameters have been recalculated using Gemini API",
    });
  };

  const handleAIQuery = (query: string) => {
    console.log('AI Query:', query);
    toast({
      title: "Analyzing Query",
      description: "Processing with Gemini API and current market data",
    });
  };

  const formatBalance = (bal: any) => {
    if (!bal) return '0 ETH';
    return `${parseFloat(bal.formatted).toFixed(6)} ${bal.symbol}`;
  };

  const formatValue = (bal: any) => {
    if (!bal) return '$0.00';
    // Simple mock calculation - in real app, would use price feeds
    const ethPrice = 2400; // Mock ETH price
    const value = parseFloat(bal.formatted) * ethPrice;
    return `$${value.toFixed(2)}`;
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gradient-primary mb-4 float-animation">
              Aegis DAO
            </h1>
            <p className="text-xl text-muted-foreground">
              Autonomous AI Agent for DAO Treasury Management
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Privacy-preserving • Multi-agent • ZK-powered
            </p>
          </div>
          <WalletConnector />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary">Aegis DAO</h1>
            <p className="text-muted-foreground">Autonomous Treasury Management</p>
          </div>
          <WalletConnector />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Treasury & Market */}
          <div className="space-y-6">
            <TreasuryOverview
              balance={formatBalance(balance)}
              totalValue={formatValue(balance)}
              address={formatAddress(address || '')}
            />
            <MarketSentiment
              sentiment="Neutral"
              description="Market news shows mixed signals with tech stocks rallying while commodity prices fall. Social media is bullish on AI tokens but bearish on older DeFi projects, leading to a neutral overall sentiment."
            />
          </div>

          {/* Center Column - AI Proposal & Chat */}
          <div className="space-y-6">
            <AIRebalancingProposal
              action={currentProposal.action}
              proposal={currentProposal.proposal}
              justification={currentProposal.justification}
              onApprove={handleApproveProposal}
              onReject={handleRejectProposal}
            />
            <AIChat onQuery={handleAIQuery} />
          </div>

          {/* Right Column - Risk Policy & History */}
          <div className="space-y-6">
            <RiskPolicyManager onPolicyUpdate={handlePolicyUpdate} />
            <ProposalHistory />
          </div>
        </div>

        {/* Agent Monitor Section */}
        <div className="mt-6">
          <AgentMonitor />
        </div>

        {/* Additional Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="card-gradient p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gradient-primary mb-2">Privacy Features</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✅ ZK-Proof Compliance Verification</li>
              <li>✅ Shielded Transaction Execution</li>
              <li>✅ Private Balance Proofs</li>
              <li>✅ Encrypted Agent Communications</li>
            </ul>
          </div>
          <div className="card-gradient p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gradient-primary mb-2">AI Capabilities</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>🤖 Gemini-powered Financial Analysis</li>
              <li>🔄 Multi-Agent Risk Assessment</li>
              <li>📊 Real-time Market Sentiment</li>
              <li>⚡ Autonomous Rebalancing</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-8">
          <p>Powered by Midnight MCP • Eliza Base Agent • Gemini API</p>
        </div>
      </div>
    </div>
  );
};

export default AegisDashboard;