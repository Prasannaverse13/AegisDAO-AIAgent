import { emitAgentEvent } from './agentBus';

// Agent Communications MCP - Secure agent-to-agent communication using Supabase
export interface AgentMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  messageType: 'request' | 'response' | 'notification' | 'alert' | 'data_share';
  content: string;
  encrypted: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  deliveryStatus: 'pending' | 'delivered' | 'read' | 'failed';
  metadata?: Record<string, any>;
}

export interface AgentEndpoint {
  agentId: string;
  name: string;
  type: 'financial_analyst' | 'risk_manager' | 'market_monitor' | 'execution_engine' | 'compliance_checker';
  capabilities: string[];
  endpoint: string;
  status: 'online' | 'offline' | 'busy';
  lastSeen: number;
  publicKey?: string; // For encrypted communications
}

export interface CommunicationChannel {
  id: string;
  participants: string[];
  channelType: 'direct' | 'broadcast' | 'group';
  encrypted: boolean;
  createdAt: number;
  lastActivity: number;
  messages: AgentMessage[];
}

export class AgentCommunicationMCP {
  private messages: Map<string, AgentMessage> = new Map();
  private agents: Map<string, AgentEndpoint> = new Map();
  private channels: Map<string, CommunicationChannel> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map(); // agentId -> Set of subscribed channels

  constructor() {
    this.initializeDefaultAgents();
    this.setupHeartbeatMonitoring();
  }

  async registerAgent(
    agentId: string,
    name: string,
    type: AgentEndpoint['type'],
    capabilities: string[],
    endpoint: string
  ): Promise<AgentEndpoint> {
    emitAgentEvent({
      type: 'agent_registration',
      message: `Registering agent: ${name}`,
      timestamp: Date.now(),
      data: { agentId, name, type }
    });

    const agent: AgentEndpoint = {
      agentId,
      name,
      type,
      capabilities,
      endpoint,
      status: 'online',
      lastSeen: Date.now(),
      publicKey: this.generatePublicKey(agentId)
    };

    this.agents.set(agentId, agent);

    emitAgentEvent({
      type: 'agent_registered',
      message: `Agent registered successfully: ${name}`,
      timestamp: Date.now(),
      data: agent
    });

    return agent;
  }

  async sendMessage(
    fromAgent: string,
    toAgent: string,
    messageType: AgentMessage['messageType'],
    content: string,
    priority: AgentMessage['priority'] = 'medium',
    encrypted: boolean = true,
    metadata?: Record<string, any>
  ): Promise<AgentMessage> {
    const fromAgentInfo = this.agents.get(fromAgent);
    const toAgentInfo = this.agents.get(toAgent);

    if (!fromAgentInfo || !toAgentInfo) {
      throw new Error('Agent not found');
    }

    emitAgentEvent({
      type: 'message_sending',
      message: `${fromAgentInfo.name} sending message to ${toAgentInfo.name}`,
      timestamp: Date.now(),
      data: { fromAgent, toAgent, messageType, priority }
    });

    const message: AgentMessage = {
      id: this.generateMessageId(),
      fromAgent,
      toAgent,
      messageType,
      content: encrypted ? this.encryptMessage(content, toAgentInfo.publicKey!) : content,
      encrypted,
      priority,
      timestamp: Date.now(),
      deliveryStatus: 'pending',
      metadata
    };

    this.messages.set(message.id, message);

    // Simulate message delivery
    setTimeout(() => {
      message.deliveryStatus = 'delivered';
      
      emitAgentEvent({
        type: 'message_delivered',
        message: `Message delivered to ${toAgentInfo.name}`,
        timestamp: Date.now(),
        data: message
      });

      // Simulate agent response for certain message types
      if (messageType === 'request') {
        setTimeout(() => {
          this.simulateAgentResponse(message);
        }, 1000 + Math.random() * 2000);
      }
    }, 500 + Math.random() * 1000);

    return message;
  }

  async broadcastMessage(
    fromAgent: string,
    messageType: AgentMessage['messageType'],
    content: string,
    priority: AgentMessage['priority'] = 'medium',
    targetTypes?: AgentEndpoint['type'][]
  ): Promise<AgentMessage[]> {
    const fromAgentInfo = this.agents.get(fromAgent);
    if (!fromAgentInfo) {
      throw new Error('Agent not found');
    }

    let targetAgents = Array.from(this.agents.values()).filter(agent => agent.agentId !== fromAgent);
    
    if (targetTypes) {
      targetAgents = targetAgents.filter(agent => targetTypes.includes(agent.type));
    }

    emitAgentEvent({
      type: 'broadcast_start',
      message: `${fromAgentInfo.name} broadcasting to ${targetAgents.length} agents`,
      timestamp: Date.now(),
      data: { fromAgent, messageType, targetCount: targetAgents.length }
    });

    const messages = await Promise.all(
      targetAgents.map(agent => 
        this.sendMessage(fromAgent, agent.agentId, messageType, content, priority, false)
      )
    );

    emitAgentEvent({
      type: 'broadcast_complete',
      message: `Broadcast completed: ${messages.length} messages sent`,
      timestamp: Date.now(),
      data: { messageIds: messages.map(m => m.id) }
    });

    return messages;
  }

  async createCommunicationChannel(
    participants: string[],
    channelType: CommunicationChannel['channelType'],
    encrypted: boolean = true
  ): Promise<CommunicationChannel> {
    const channel: CommunicationChannel = {
      id: this.generateChannelId(),
      participants,
      channelType,
      encrypted,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      messages: []
    };

    this.channels.set(channel.id, channel);

    // Subscribe all participants to the channel
    participants.forEach(agentId => {
      if (!this.subscriptions.has(agentId)) {
        this.subscriptions.set(agentId, new Set());
      }
      this.subscriptions.get(agentId)!.add(channel.id);
    });

    emitAgentEvent({
      type: 'channel_created',
      message: `Communication channel created with ${participants.length} participants`,
      timestamp: Date.now(),
      data: channel
    });

    return channel;
  }

  getAgentMessages(agentId: string, limit: number = 50): AgentMessage[] {
    return Array.from(this.messages.values())
      .filter(msg => msg.fromAgent === agentId || msg.toAgent === agentId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getChannelMessages(channelId: string, limit: number = 50): AgentMessage[] {
    const channel = this.channels.get(channelId);
    if (!channel) return [];

    return channel.messages
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getRegisteredAgents(): AgentEndpoint[] {
    return Array.from(this.agents.values());
  }

  getOnlineAgents(): AgentEndpoint[] {
    return Array.from(this.agents.values()).filter(agent => agent.status === 'online');
  }

  async updateAgentStatus(agentId: string, status: AgentEndpoint['status']): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.status = status;
    agent.lastSeen = Date.now();

    emitAgentEvent({
      type: 'agent_status_updated',
      message: `Agent ${agent.name} status: ${status}`,
      timestamp: Date.now(),
      data: { agentId, status }
    });
  }

  private async simulateAgentResponse(originalMessage: AgentMessage): Promise<void> {
    const toAgent = this.agents.get(originalMessage.toAgent);
    if (!toAgent) return;

    let responseContent = '';
    
    switch (toAgent.type) {
      case 'financial_analyst':
        responseContent = 'Analysis complete. Market conditions suggest moderate risk. Recommendation: proceed with caution.';
        break;
      case 'risk_manager':
        responseContent = 'Risk assessment complete. Current exposure within acceptable parameters. No immediate action required.';
        break;
      case 'market_monitor':
        responseContent = 'Market monitoring active. Recent volatility detected in ETH/USDC pair. Alert threshold not exceeded.';
        break;
      case 'execution_engine':
        responseContent = 'Trade execution parameters validated. Ready to execute on confirmation.';
        break;
      case 'compliance_checker':
        responseContent = 'Compliance check passed. Transaction meets regulatory requirements.';
        break;
    }

    await this.sendMessage(
      originalMessage.toAgent,
      originalMessage.fromAgent,
      'response',
      responseContent,
      originalMessage.priority,
      originalMessage.encrypted
    );
  }

  private initializeDefaultAgents(): void {
    const defaultAgents = [
      {
        agentId: 'aegis_financial_analyst',
        name: 'Aegis Financial Analyst',
        type: 'financial_analyst' as const,
        capabilities: ['portfolio_analysis', 'risk_assessment', 'market_research'],
        endpoint: '/api/agents/financial'
      },
      {
        agentId: 'sentinel_risk_manager',
        name: 'Sentinel Risk Manager',
        type: 'risk_manager' as const,
        capabilities: ['risk_monitoring', 'position_sizing', 'drawdown_protection'],
        endpoint: '/api/agents/risk'
      },
      {
        agentId: 'oracle_market_monitor',
        name: 'Oracle Market Monitor',
        type: 'market_monitor' as const,
        capabilities: ['price_monitoring', 'volatility_tracking', 'sentiment_analysis'],
        endpoint: '/api/agents/market'
      },
      {
        agentId: 'nexus_execution_engine',
        name: 'Nexus Execution Engine',
        type: 'execution_engine' as const,
        capabilities: ['trade_execution', 'order_management', 'slippage_optimization'],
        endpoint: '/api/agents/execution'
      },
      {
        agentId: 'guardian_compliance',
        name: 'Guardian Compliance Checker',
        type: 'compliance_checker' as const,
        capabilities: ['regulatory_compliance', 'audit_trails', 'reporting'],
        endpoint: '/api/agents/compliance'
      }
    ];

    defaultAgents.forEach(agentData => {
      const agent: AgentEndpoint = {
        ...agentData,
        status: 'online',
        lastSeen: Date.now(),
        publicKey: this.generatePublicKey(agentData.agentId)
      };
      this.agents.set(agent.agentId, agent);
    });
  }

  private setupHeartbeatMonitoring(): void {
    setInterval(() => {
      const now = Date.now();
      this.agents.forEach(agent => {
        if (now - agent.lastSeen > 60000 && agent.status === 'online') { // 1 minute timeout
          agent.status = 'offline';
          emitAgentEvent({
            type: 'agent_offline',
            message: `Agent ${agent.name} went offline`,
            timestamp: Date.now(),
            data: { agentId: agent.agentId }
          });
        }
      });
    }, 30000); // Check every 30 seconds
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private generateChannelId(): string {
    return `ch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private generatePublicKey(agentId: string): string {
    return `pk_${agentId}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private encryptMessage(content: string, publicKey: string): string {
    // Simulate encryption (in real implementation, use proper cryptography)
    return `encrypted_${btoa(content)}_${publicKey.substring(0, 8)}`;
  }
}

export const agentCommunication = new AgentCommunicationMCP();