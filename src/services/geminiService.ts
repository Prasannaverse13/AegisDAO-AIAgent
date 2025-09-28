import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const API_KEY = 'AIzaSyBlPa5qn6-aMTgo__2YDd3sV9J3tGyjlKI';
const genAI = new GoogleGenerativeAI(API_KEY);

interface MarketData {
  prices: Record<string, number>;
  sentiment: string;
  volatility: number;
}

interface RiskPolicy {
  maxDrawdown: number;
  volatilityTarget: string;
  stablecoinAllocation: number;
  preferredAssetClass: string;
}

interface TreasuryState {
  assets: Record<string, number>;
  totalValue: number;
}

export class AegisFinancialAgent {
  private model: GenerativeModel;

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.3,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
  }

  async generateRebalancingProposal(
    treasuryState: TreasuryState,
    marketData: MarketData,
    riskPolicy: RiskPolicy
  ): Promise<{
    action: string;
    assetOut: string;
    amount: number;
    assetIn: string;
    justification: string;
    confidence: number;
  }> {
    const prompt = this.buildFinancialAnalysisPrompt(treasuryState, marketData, riskPolicy);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the structured JSON response
      const parsedResponse = this.parseAIResponse(text);
      return parsedResponse;
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getDefaultProposal();
    }
  }

  async analyzeHypotheticalTrade(
    currentPortfolio: TreasuryState,
    tradeQuery: string,
    riskPolicy: RiskPolicy
  ): Promise<{
    recommendation: 'Recommended' | 'Not Recommended' | 'Neutral';
    justification: string;
    riskAssessment: string;
  }> {
    const prompt = `
    You are Aegis, an AI Financial Strategist for a DAO treasury. Analyze this hypothetical trade:
    
    Current Portfolio: ${JSON.stringify(currentPortfolio)}
    Risk Policy: ${JSON.stringify(riskPolicy)}
    Trade Query: "${tradeQuery}"
    
    Provide a detailed analysis in this JSON format:
    {
      "recommendation": "Recommended|Not Recommended|Neutral",
      "justification": "Detailed explanation of the recommendation",
      "riskAssessment": "Analysis of risk impact on portfolio"
    }
    
    Consider:
    - Portfolio risk metrics (VaR, Sharpe ratio implications)
    - Alignment with stated risk policy
    - Market conditions and asset correlation
    - Liquidity considerations
    - Regulatory and operational risks
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseTradeAnalysis(text);
    } catch (error) {
      console.error('Trade analysis error:', error);
      return {
        recommendation: 'Not Recommended',
        justification: 'Unable to analyze trade due to API error. Defaulting to conservative approach.',
        riskAssessment: 'High uncertainty due to analysis failure.'
      };
    }
  }

  private buildFinancialAnalysisPrompt(
    treasury: TreasuryState,
    market: MarketData,
    policy: RiskPolicy
  ): string {
    return `
    You are Aegis, an advanced AI Financial Strategist for a DAO treasury. Your role is to act as a Decentralized Chief Financial Officer (CFO).
    
    CURRENT TREASURY STATE:
    ${JSON.stringify(treasury, null, 2)}
    
    MARKET CONDITIONS:
    ${JSON.stringify(market, null, 2)}
    
    DAO RISK POLICY:
    ${JSON.stringify(policy, null, 2)}
    
    INSTRUCTIONS:
    1. Analyze the current portfolio against the target risk policy
    2. Consider market sentiment and volatility
    3. Generate a specific rebalancing recommendation
    4. Provide clear justification for the proposal
    
    RESPOND IN THIS EXACT JSON FORMAT:
    {
      "action": "rebalance",
      "assetOut": "ASSET_SYMBOL",
      "amount": NUMBER,
      "assetIn": "TARGET_ASSET_SYMBOL", 
      "justification": "Detailed explanation of the strategy and risk considerations",
      "confidence": NUMBER_0_TO_100
    }
    
    Focus on:
    - Risk-adjusted returns
    - Portfolio correlation and diversification
    - Alignment with stated risk tolerance
    - Market timing considerations
    - Operational and liquidity constraints
    `;
  }

  private parseAIResponse(text: string) {
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }
    
    return this.getDefaultProposal();
  }

  private parseTradeAnalysis(text: string) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse trade analysis:', error);
    }
    
    return {
      recommendation: 'Not Recommended' as const,
      justification: 'Analysis parsing failed. Defaulting to conservative approach.',
      riskAssessment: 'Unable to assess risk due to parsing error.'
    };
  }

  private getDefaultProposal() {
    return {
      action: 'hold',
      assetOut: 'ETH',
      amount: 0,
      assetIn: 'USDC',
      justification: 'Conservative approach due to API limitations. Maintaining current allocation pending manual review.',
      confidence: 50
    };
  }
}

export const aegisAgent = new AegisFinancialAgent();