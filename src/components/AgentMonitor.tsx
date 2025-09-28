import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Activity, Users, MessageSquare, AlertTriangle, Play, Zap } from 'lucide-react';
import { subscribeAgentEvents } from '@/services/agentBus';

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'busy';
  tasks: number;
  lastActivity: string;
}

interface Communication {
  id: string;
  from: string;
  to: string;
  type: 'proposal' | 'analysis' | 'veto' | 'alert';
  message: string;
  timestamp: Date;
}

const AgentMonitor = () => {
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'aegis-main', name: 'Aegis Main Agent', status: 'idle', tasks: 0, lastActivity: '2 min ago' },
    { id: 'risk-analyzer', name: 'Risk Analyzer', status: 'idle', tasks: 0, lastActivity: '5 min ago' },
    { id: 'market-monitor', name: 'Market Monitor', status: 'active', tasks: 1, lastActivity: 'Just now' },
    { id: 'compliance-veto', name: 'Compliance Veto Agent', status: 'idle', tasks: 0, lastActivity: '1 min ago' }
  ]);
  
  const [communications, setCommunications] = useState<Communication[]>([
    {
      id: '1',
      from: 'market-monitor',
      to: 'aegis-main',
      type: 'analysis',
      message: 'Market volatility increased by 15%. Recommend defensive posture.',
      timestamp: new Date(Date.now() - 120000)
    },
    {
      id: '2',
      from: 'aegis-main',
      to: 'risk-analyzer',
      type: 'proposal',
      message: 'Evaluating ETH->USDC conversion proposal for risk compliance.',
      timestamp: new Date(Date.now() - 60000)
    }
  ]);
  
const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeAgentEvents((evt) => {
      // Append live event as a communication line
      setCommunications(prev => [{
        id: `${evt.timestamp}`,
        from: 'aegis-main',
        to: evt.type.includes('policy') ? 'risk-analyzer' : evt.type.includes('rebalance') ? 'market-monitor' : 'system',
        type: evt.type.includes('error') ? 'alert' : evt.type.includes('proposal') ? 'proposal' : 'analysis',
        message: evt.message,
        timestamp: new Date(evt.timestamp)
      }, ...prev]);

      // Poke agents to show activity
      setAgents(prev => prev.map(a => a.id === 'aegis-main' ? { ...a, status: 'busy', lastActivity: 'Just now' } : a));
    });
    return unsubscribe;
  }, []);

  const startAnalysisCycle = async () => {
    setIsRunning(true);
    
    // Update agent statuses to show activity
    setAgents(prev => prev.map(agent => ({
      ...agent,
      status: 'busy' as const,
      tasks: agent.tasks + 1
    })));

    // Simulate inter-agent communication
    const newCommunications: Communication[] = [
      {
        id: Date.now().toString(),
        from: 'aegis-main',
        to: 'market-monitor',
        type: 'proposal',
        message: 'Initiating treasury analysis cycle. Request current market sentiment.',
        timestamp: new Date()
      },
      {
        id: (Date.now() + 1).toString(),
        from: 'market-monitor',
        to: 'aegis-main',
        type: 'analysis',
        message: 'Market sentiment: NEUTRAL. ETH volatility: 12%. Recommended allocation shift detected.',
        timestamp: new Date(Date.now() + 2000)
      },
      {
        id: (Date.now() + 2).toString(),
        from: 'aegis-main',
        to: 'risk-analyzer',
        type: 'proposal',
        message: 'Proposal: Convert 0.002 ETH to USDC. Requesting risk validation.',
        timestamp: new Date(Date.now() + 4000)
      },
      {
        id: (Date.now() + 3).toString(),
        from: 'risk-analyzer',
        to: 'aegis-main',
        type: 'analysis',
        message: 'Risk assessment: APPROVED. Proposal aligns with 10% max drawdown policy.',
        timestamp: new Date(Date.now() + 6000)
      },
      {
        id: (Date.now() + 4).toString(),
        from: 'compliance-veto',
        to: 'aegis-main',
        type: 'analysis',
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
          agent.id === newCommunications[i].from || agent.id === newCommunications[i].to
            ? { ...agent, lastActivity: 'Just now' }
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
      from: 'system',
      to: 'all-agents',
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
      case 'proposal': return '📋';
      case 'analysis': return '📊';
      case 'veto': return '❌';
      case 'alert': return '🚨';
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
                  <div>Tasks: {agent.tasks}</div>
                  <div>Last: {agent.lastActivity}</div>
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
                  <span className="font-medium">{comm.from}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">{comm.to}</span>
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