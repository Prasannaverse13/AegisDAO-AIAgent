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
import { aegisAgent } from '@/services/geminiService';

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

  const handlePolicyUpdate = async (policy: string) => {
    console.log('Updating policy:', policy);
    
    if (!policy.trim()) {
      toast({
        title: "Invalid Policy",
        description: "Please enter a risk policy statement",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Processing Risk Policy...",
      description: "AI is analyzing your policy with Gemini API",
    });

    try {
      // Simulate AI processing the natural language policy
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Show success with updated parameters
      toast({
        title: "Risk Policy Updated Successfully",
        description: "AI parameters have been recalculated and applied to the system",
      });
      
      // Optional: You could also update the displayed parameters here
    } catch (error) {
      toast({
        title: "Policy Update Failed",
        description: "Unable to process policy. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAIQuery = async (query: string) => {
    console.log('AI Query:', query);
    toast({
      title: "Analyzing Query...",
      description: "Processing with Gemini API and current market data",
    });

    try {
      // Get current portfolio state
      const currentPortfolio = {
        assets: { ETH: balance ? parseFloat(balance.formatted) : 0, USDC: 0 },
        totalValue: balance ? parseFloat(balance.formatted) * 2400 : 0
      };

      const riskPolicy = {
        maxDrawdown: 10,
        volatilityTarget: 'Low',
        stablecoinAllocation: 60,
        preferredAssetClass: 'Stablecoins'
      };

      // Call the AI analysis
      const analysis = await aegisAgent.analyzeHypotheticalTrade(
        currentPortfolio,
        query,
        riskPolicy
      );

      toast({
        title: `Analysis Complete: ${analysis.recommendation}`,
        description: analysis.justification.substring(0, 100) + "...",
      });

      return analysis;
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to process query. Please try again.",
        variant: "destructive",
      });
    }
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
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--secondary)/0.05),transparent_50%)]"></div>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12">
              <h1 className="text-6xl font-bold text-gradient-primary mb-6 float-animation">
                Aegis DAO
              </h1>
              <p className="text-2xl text-foreground mb-4">
                Autonomous AI Agent for DAO Treasury Management
              </p>
              <p className="text-lg text-muted-foreground flex items-center justify-center gap-4">
                <span className="flex items-center gap-2">
                  🔒 Privacy-preserving
                </span>
                <span className="flex items-center gap-2">
                  🤖 Multi-agent
                </span>
                <span className="flex items-center gap-2">
                  ⚡ ZK-powered
                </span>
              </p>
            </div>
            <div className="flex justify-center">
              <WalletConnector />
            </div>
          </div>
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