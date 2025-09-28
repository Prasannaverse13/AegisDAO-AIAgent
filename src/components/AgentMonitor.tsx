import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Activity, Users, MessageSquare, AlertTriangle, Play, Zap } from 'lucide-react';
import { elizaFinancialAgent } from '../services/elizaBaseAgent';
import { agentCommunication } from '../services/agentCommunication';
import { subscribeAgentEvents, type AgentEvent } from '../services/agentBus';

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'busy';
  taskCount: number;
  lastActivity: Date;
}

interface Communication {
  id: string;
  sender: string;
  receiver: string;
  type: 'request' | 'response' | 'notification' | 'alert' | 'analysis';
  message: string;
  timestamp: Date;
}

const AgentMonitor = () => {
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'aegis_financial_analyst', name: 'Aegis Financial Analyst', status: 'idle', taskCount: 0, lastActivity: new Date() },
    { id: 'sentinel_risk_manager', name: 'Sentinel Risk Manager', status: 'idle', taskCount: 0, lastActivity: new Date() },
    { id: 'oracle_market_monitor', name: 'Oracle Market Monitor', status: 'active', taskCount: 1, lastActivity: new Date() },
    { id: 'nexus_execution_engine', name: 'Nexus Execution Engine', status: 'idle', taskCount: 0, lastActivity: new Date() },
    { id: 'guardian_compliance', name: 'Guardian Compliance Checker', status: 'idle', taskCount: 0, lastActivity: new Date() }
  ]);
  
  const [communications, setCommunications] = useState<Communication[]>([
    {
      id: '1',
      sender: 'oracle_market_monitor',
      receiver: 'aegis_financial_analyst',
      type: 'analysis',
      message: 'Market volatility increased by 15%. Recommend defensive posture.',
      timestamp: new Date(Date.now() - 120000)
    },
    {
      id: '2',
      sender: 'aegis_financial_analyst',
      receiver: 'sentinel_risk_manager',
      type: 'request',
      message: 'Evaluating ETH->USDC conversion proposal for risk compliance.',
      timestamp: new Date(Date.now() - 60000)
    }
  ]);
  
const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeAgentEvents((evt: AgentEvent) => {
      // Append live event as a communication line
      setCommunications(prev => [{
        id: `${evt.timestamp}`,
        sender: 'aegis_financial_analyst',
        receiver: evt.type.includes('policy') ? 'sentinel_risk_manager' : evt.type.includes('rebalance') ? 'oracle_market_monitor' : 'system',
        type: evt.type.includes('error') ? 'alert' : evt.type.includes('proposal') ? 'request' : 'analysis',
        message: evt.message,
        timestamp: new Date(evt.timestamp)
      }, ...prev.slice(0, 19)]); // Keep last 20

      // Update agents to show activity
      setAgents(prev => prev.map(a => 
        a.id === 'aegis_financial_analyst' 
          ? { ...a, status: 'busy' as const, lastActivity: new Date() } 
          : a
      ));
    });
    return unsubscribe;
  }, []);

  const startAnalysisCycle = async () => {
    setIsRunning(true);
    
    // Update agent statuses to show activity
    setAgents(prev => prev.map(agent => ({
      ...agent,
      status: 'busy' as const,
      taskCount: agent.taskCount + 1
    })));

    // Simulate inter-agent communication
    const newCommunications: Communication[] = [
      {
        id: Date.now().toString(),
        sender: 'aegis_financial_analyst',
        receiver: 'oracle_market_monitor',
        type: 'request',
        message: 'Initiating treasury analysis cycle. Request current market sentiment.',
        timestamp: new Date()
      },
      {
        id: (Date.now() + 1).toString(),
        sender: 'oracle_market_monitor',
        receiver: 'aegis_financial_analyst',
        type: 'response',
        message: 'Market sentiment: NEUTRAL. ETH volatility: 12%. Recommended allocation shift detected.',
        timestamp: new Date(Date.now() + 2000)
      },
      {
        id: (Date.now() + 2).toString(),
        sender: 'aegis_financial_analyst',
        receiver: 'sentinel_risk_manager',
        type: 'request',
        message: 'Proposal: Convert 0.002 ETH to USDC. Requesting risk validation.',
        timestamp: new Date(Date.now() + 4000)
      },
      {
        id: (Date.now() + 3).toString(),
        sender: 'sentinel_risk_manager',
        receiver: 'aegis_financial_analyst',
        type: 'response',
        message: 'Risk assessment: APPROVED. Proposal aligns with 10% max drawdown policy.',
        timestamp: new Date(Date.now() + 6000)
      },
      {
        id: (Date.now() + 4).toString(),
        sender: 'guardian_compliance',
        receiver: 'aegis_financial_analyst',
        type: 'notification',
        message: 'Compliance check: PASSED. ZK-proof generated for proposal validation.',
        timestamp: new Date(Date.now() + 8000)
      }
    ];

    // Add communications with delays to simulate real-time activity
    for (let i = 0; i < newCommunications.length; i++) {
      setTimeout(() => {
        setCommunications(prev => [newCommunications[i], ...prev]);
        
        // Update agent activity
        setAgents(prev => prev.map(agent => 
          agent.id === newCommunications[i].sender || agent.id === newCommunications[i].receiver
            ? { ...agent, lastActivity: new Date() }
            : agent
        ));
      }, i * 2000);
    }

    // Complete the cycle
    setTimeout(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: Math.random() > 0.5 ? 'active' : 'idle' as const
      })));
      setIsRunning(false);
    }, 10000);
  };

  const triggerEmergencyAlert = () => {
    const alertComm: Communication = {
      id: Date.now().toString(),
      sender: 'system',
      receiver: 'all-agents',
      type: 'alert',
      message: '🚨 EMERGENCY: Market crash detected. Initiating emergency risk-off protocol.',
      timestamp: new Date()
    };

    setCommunications(prev => [alertComm, ...prev]);
    setAgents(prev => prev.map(agent => ({ ...agent, status: 'busy' as const })));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-accent text-accent-foreground';
      case 'busy': return 'bg-primary text-primary-foreground';
      case 'idle': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'request': return '📋';
      case 'response': return '📊';
      case 'notification': return '📢';
      case 'alert': return '🚨';
      case 'analysis': return '📊';
      default: return '💬';
    }
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <span className="text-gradient-primary">Multi-Agent System Monitor</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Real-time monitoring of autonomous AI agents and their communications.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agent Status Grid */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Agent Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agents.map((agent) => (
              <div key={agent.id} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{agent.name}</span>
                  <Badge className={getStatusColor(agent.status)}>
                    {agent.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Tasks: {agent.taskCount}</div>
                  <div>Last: {agent.lastActivity.toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Communications */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Recent Communications
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {communications.slice(0, 8).map((comm) => (
              <div key={comm.id} className="p-3 bg-muted/20 rounded text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span>{getMessageTypeIcon(comm.type)}</span>
                  <span className="font-medium">{comm.sender}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">{comm.receiver}</span>
                  <span className="text-muted-foreground ml-auto">
                    {comm.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-muted-foreground">{comm.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Control Panel */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button 
            onClick={startAnalysisCycle}
            disabled={isRunning}
            className="flex-1 glow-primary"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Analysis Running...' : 'Start Analysis Cycle'}
          </Button>
          <Button 
            onClick={triggerEmergencyAlert}
            variant="destructive"
            size="sm"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Emergency Alert
          </Button>
        </div>

        {/* System Health */}
<div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <Zap className="h-3 w-3 text-accent" />
          <span>System Health: Optimal</span>
          <span className="ml-auto">Midnight MCP: Connected • Live Events</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentMonitor;