import { emitAgentEvent } from './agentBus';
import { aegisAgent } from './geminiService';
import { agentCommunication } from './agentCommunication';
import { marketplaceRegistry } from './marketplaceRegistry';
import { midnightMCP } from './midnightMCP';
import { daoContract } from './daoContract';

// Eliza Base Agent - Foundation for autonomous AI agents with blockchain interactions
export interface AgentTask {
  id: string;
  type: 'analysis' | 'monitoring' | 'execution' | 'communication' | 'compliance';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  assignedAgent: string;
  dependencies: string[]; // Task IDs that must complete first
  parameters: Record<string, any>;
  result?: any;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  estimatedDuration: number; // in milliseconds
}

export interface AgentContext {
  agentId: string;
  currentTasks: AgentTask[];
  memory: Record<string, any>;
  capabilities: string[];
  services: string[]; // Service IDs from marketplace
  communication: {
    inbox: string[];
    outbox: string[];
    channels: string[];
  };
}

export interface DecisionPoint {
  id: string;
  type: 'strategic' | 'tactical' | 'emergency';
  description: string;
  options: Array<{
    id: string;
    description: string;
    impact: number; // -100 to 100
    confidence: number; // 0 to 100
    requiredResources: string[];
  }>;
  deadline: number;
  decision?: string; // Selected option ID
  decidedAt?: number;
  rationale?: string;
}

export class ElizaBaseAgent {
  protected agentId: string;
  protected name: string;
  protected type: string;
  protected context: AgentContext;
  protected tasks: Map<string, AgentTask> = new Map();
  protected decisions: Map<string, DecisionPoint> = new Map();
  protected isRunning: boolean = false;
  protected processingInterval?: NodeJS.Timeout;

  constructor(agentId: string, name: string, type: string, capabilities: string[]) {
    this.agentId = agentId;
    this.name = name;
    this.type = type;
    
    this.context = {
      agentId,
      currentTasks: [],
      memory: {},
      capabilities,
      services: [],
      communication: {
        inbox: [],
        outbox: [],
        channels: []
      }
    };

    this.initializeAgent();
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    
    emitAgentEvent({
      type: 'agent_started',
      message: `Agent ${this.name} started`,
      timestamp: Date.now(),
      data: { agentId: this.agentId, type: this.type }
    });

    // Register with communication system
    await agentCommunication.registerAgent(
      this.agentId,
      this.name,
      this.type as any,
      this.context.capabilities,
      `/agents/${this.agentId}`
    );

    // Start processing loop
    this.processingInterval = setInterval(() => {
      this.processingLoop();
    }, 5000); // Process every 5 seconds

    // Initialize with default tasks
    await this.initializeTasks();
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    await agentCommunication.updateAgentStatus(this.agentId, 'offline');

    emitAgentEvent({
      type: 'agent_stopped',
      message: `Agent ${this.name} stopped`,
      timestamp: Date.now(),
      data: { agentId: this.agentId }
    });
  }

  async assignTask(
    type: AgentTask['type'],
    description: string,
    priority: AgentTask['priority'],
    parameters: Record<string, any> = {},
    dependencies: string[] = []
  ): Promise<AgentTask> {
    const task: AgentTask = {
      id: this.generateTaskId(),
      type,
      description,
      priority,
      status: 'pending',
      assignedAgent: this.agentId,
      dependencies,
      parameters,
      createdAt: Date.now(),
      estimatedDuration: this.estimateTaskDuration(type)
    };

    this.tasks.set(task.id, task);
    this.context.currentTasks.push(task);

    emitAgentEvent({
      type: 'task_assigned',
      message: `Task assigned to ${this.name}: ${description}`,
      timestamp: Date.now(),
      data: task
    });

    return task;
  }

  async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Check dependencies
    const unmetDependencies = task.dependencies.filter(depId => {
      const depTask = this.tasks.get(depId);
      return !depTask || depTask.status !== 'completed';
    });

    if (unmetDependencies.length > 0) {
      emitAgentEvent({
        type: 'task_waiting',
        message: `Task ${taskId} waiting for dependencies`,
        timestamp: Date.now(),
        data: { taskId, unmetDependencies }
      });
      return;
    }

    task.status = 'running';
    task.startedAt = Date.now();

    emitAgentEvent({
      type: 'task_started',
      message: `${this.name} started task: ${task.description}`,
      timestamp: Date.now(),
      data: task
    });

    try {
      const result = await this.performTask(task);
      
      task.result = result;
      task.status = 'completed';
      task.completedAt = Date.now();

      // Update context memory
      this.context.memory[`task_${taskId}_result`] = result;

      emitAgentEvent({
        type: 'task_completed',
        message: `${this.name} completed task: ${task.description}`,
        timestamp: Date.now(),
        data: task
      });

    } catch (error) {
      task.status = 'failed';
      task.result = { error: String(error) };

      emitAgentEvent({
        type: 'task_failed',
        message: `${this.name} failed task: ${task.description}`,
        timestamp: Date.now(),
        data: { task, error: String(error) }
      });
    }
  }

  async makeDecision(decisionPoint: DecisionPoint): Promise<string> {
    emitAgentEvent({
      type: 'decision_start',
      message: `${this.name} evaluating decision: ${decisionPoint.description}`,
      timestamp: Date.now(),
      data: decisionPoint
    });

    // Use AI to evaluate options
    const evaluationPrompt = `
      As ${this.name}, evaluate the following decision:
      ${decisionPoint.description}
      
      Options:
      ${decisionPoint.options.map(opt => 
        `- ${opt.id}: ${opt.description} (Impact: ${opt.impact}, Confidence: ${opt.confidence})`
      ).join('\n')}
      
      Consider:
      - Current context: ${JSON.stringify(this.context.memory)}
      - Agent capabilities: ${this.context.capabilities.join(', ')}
      - Deadline: ${new Date(decisionPoint.deadline).toISOString()}
      
      Respond with the option ID and rationale in JSON format:
      {"selectedOption": "option_id", "rationale": "explanation"}
    `;

    try {
      const response = await aegisAgent.analyzeHypotheticalTrade(
        { assets: {}, totalValue: 0 },
        evaluationPrompt,
        { maxDrawdown: 10, volatilityTarget: 'Low', stablecoinAllocation: 60, preferredAssetClass: 'Stablecoins' }
      );

      let selectedOption = decisionPoint.options[0].id; // Default to first option
      let rationale = response.justification;

      // Try to parse the AI response for better decision
      try {
        const parsed = JSON.parse(response.justification);
        if (parsed.selectedOption && decisionPoint.options.find(opt => opt.id === parsed.selectedOption)) {
          selectedOption = parsed.selectedOption;
          rationale = parsed.rationale;
        }
      } catch (parseError) {
        // Use default selection and AI rationale
      }

      decisionPoint.decision = selectedOption;
      decisionPoint.decidedAt = Date.now();
      decisionPoint.rationale = rationale;

      this.decisions.set(decisionPoint.id, decisionPoint);

      emitAgentEvent({
        type: 'decision_made',
        message: `${this.name} decided: ${selectedOption}`,
        timestamp: Date.now(),
        data: decisionPoint
      });

      return selectedOption;

    } catch (error) {
      // Fallback to rule-based decision
      const fallbackOption = this.makeFallbackDecision(decisionPoint);
      
      decisionPoint.decision = fallbackOption;
      decisionPoint.decidedAt = Date.now();
      decisionPoint.rationale = 'Fallback decision due to AI analysis error';

      emitAgentEvent({
        type: 'decision_fallback',
        message: `${this.name} made fallback decision: ${fallbackOption}`,
        timestamp: Date.now(),
        data: { decisionPoint, error: String(error) }
      });

      return fallbackOption;
    }
  }

  protected async performTask(task: AgentTask): Promise<any> {
    // Base implementation - override in specific agent types
    await this.delay(task.estimatedDuration);
    
    switch (task.type) {
      case 'analysis':
        return this.performAnalysis(task);
      case 'monitoring':
        return this.performMonitoring(task);
      case 'execution':
        return this.performExecution(task);
      case 'communication':
        return this.performCommunication(task);
      case 'compliance':
        return this.performCompliance(task);
      default:
        return { status: 'completed', message: 'Task completed successfully' };
    }
  }

  protected async performAnalysis(task: AgentTask): Promise<any> {
    // Placeholder for analysis tasks
    return { analysis: 'Analysis completed', confidence: 85 };
  }

  protected async performMonitoring(task: AgentTask): Promise<any> {
    // Placeholder for monitoring tasks
    return { monitoring: 'Monitoring active', alertsTriggered: 0 };
  }

  protected async performExecution(task: AgentTask): Promise<any> {
    // Placeholder for execution tasks
    return { execution: 'Execution completed', transactionId: 'tx_' + Date.now() };
  }

  protected async performCommunication(task: AgentTask): Promise<any> {
    const { recipient, message, messageType } = task.parameters;
    
    await agentCommunication.sendMessage(
      this.agentId,
      recipient,
      messageType || 'notification',
      message,
      task.priority === 'critical' ? 'critical' : 'medium'
    );

    return { communication: 'Message sent successfully', recipient };
  }

  protected async performCompliance(task: AgentTask): Promise<any> {
    // Placeholder for compliance tasks
    return { compliance: 'Compliance check passed', violations: 0 };
  }

  private async processingLoop(): Promise<void> {
    if (!this.isRunning) return;

    // Process pending tasks
    const pendingTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'pending')
      .sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));

    for (const task of pendingTasks.slice(0, 3)) { // Process up to 3 tasks per cycle
      await this.executeTask(task.id);
    }

    // Check for pending decisions
    const pendingDecisions = Array.from(this.decisions.values())
      .filter(decision => !decision.decision && decision.deadline > Date.now());

    for (const decision of pendingDecisions) {
      await this.makeDecision(decision);
    }

    // Update agent status
    await agentCommunication.updateAgentStatus(
      this.agentId,
      pendingTasks.length > 0 ? 'busy' : 'online'
    );
  }

  protected async initializeTasks(): Promise<void> {
    // Initialize type-specific tasks - override in subclasses
  }

  private async initializeAgent(): Promise<void> {
    // Discover relevant services from marketplace
    const services = await marketplaceRegistry.discoverServices(
      this.type,
      { category: 'ai_agent', onlyVerified: true }
    );

    this.context.services = services.results.map(s => s.id);
  }

  private estimateTaskDuration(type: AgentTask['type']): number {
    const baseDurations = {
      analysis: 3000,
      monitoring: 1000,
      execution: 5000,
      communication: 500,
      compliance: 2000
    };
    
    return baseDurations[type] || 2000;
  }

  private getPriorityScore(priority: AgentTask['priority']): number {
    const scores = { low: 1, medium: 2, high: 3, critical: 4 };
    return scores[priority];
  }

  private makeFallbackDecision(decisionPoint: DecisionPoint): string {
    // Simple fallback: choose option with highest confidence and lowest negative impact
    const bestOption = decisionPoint.options.reduce((best, current) => {
      const bestScore = (best.confidence / 100) * (100 + best.impact) / 100;
      const currentScore = (current.confidence / 100) * (100 + current.impact) / 100;
      return currentScore > bestScore ? current : best;
    });

    return bestOption.id;
  }

  private generateTaskId(): string {
    return `task_${this.agentId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Getters
  getAgentId(): string { return this.agentId; }
  getName(): string { return this.name; }
  getType(): string { return this.type; }
  getContext(): AgentContext { return this.context; }
  getTasks(): AgentTask[] { return Array.from(this.tasks.values()); }
  getDecisions(): DecisionPoint[] { return Array.from(this.decisions.values()); }
  isAgentRunning(): boolean { return this.isRunning; }
}

// Specialized agents
export class FinancialAnalystAgent extends ElizaBaseAgent {
  constructor() {
    super(
      'aegis_financial_analyst',
      'Aegis Financial Analyst',
      'financial_analyst',
      ['portfolio_analysis', 'risk_assessment', 'market_research', 'ai_analysis']
    );
  }

  protected async initializeTasks(): Promise<void> {
    await this.assignTask(
      'analysis',
      'Daily portfolio risk assessment',
      'high',
      { analysisType: 'risk', frequency: 'daily' }
    );

    await this.assignTask(
      'monitoring',
      'Monitor market sentiment indicators',
      'medium',
      { indicators: ['fear_greed', 'volatility', 'volume'] }
    );
  }

  protected async performAnalysis(task: AgentTask): Promise<any> {
    // Use Gemini AI for actual analysis
    const treasuryState = { assets: { ETH: 2.5, USDC: 10000 }, totalValue: 15000 };
    const marketData = { prices: { ETH: 2000, USDC: 1 }, sentiment: 'neutral', volatility: 25 };
    const riskPolicy = { maxDrawdown: 10, volatilityTarget: 'Low', stablecoinAllocation: 60, preferredAssetClass: 'Stablecoins' };

    const proposal = await aegisAgent.generateRebalancingProposal(treasuryState, marketData, riskPolicy);
    
    return {
      analysis: 'AI-powered financial analysis completed',
      proposal,
      confidence: proposal.confidence,
      timestamp: Date.now()
    };
  }
}

export const elizaFinancialAgent = new FinancialAnalystAgent();