import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { elizaOrchestrator } from '@/services/elizaAgent';
import { Bot, Users, MessageSquare, AlertTriangle, Play } from 'lucide-react';

const AgentMonitor = () => {
  const [agentStatus, setAgentStatus] = useState<Record<string, any>>({});
  const [communications, setCommunications] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    updateAgentStatus();
    updateCommunications();
    
    const interval = setInterval(() => {
      updateAgentStatus();
      updateCommunications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateAgentStatus = async () => {
    const status = await elizaOrchestrator.getAgentStatus();
    setAgentStatus(status);
  };

  const updateCommunications = async () => {
    const history = await elizaOrchestrator.getCommunicationHistory(5);
    setCommunications(history);
  };

  const startAnalysisCycle = async () => {
    setIsRunning(true);
    await elizaOrchestrator.scheduleAnalysisCycle();
    
    // Simulate some inter-agent communications
    setTimeout(async () => {
      await elizaOrchestrator.sendAgentMessage(
        'aegis-main',
        'risk-veto',
        'Proposal generated: Rebalance 10% ETH to USDC. Risk assessment requested.',
        'proposal'
      );
    }, 2000);

    setTimeout(() => setIsRunning(false), 10000);
  };

  const triggerEmergencyAlert = async () => {
    await elizaOrchestrator.triggerEmergencyAlert(
      'market_crash',
      'Detected 15% market decline in the last hour. Immediate risk assessment required.'
    );
    updateCommunications();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'busy': return 'bg-primary text-primary-foreground';
      case 'idle': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'proposal': return '📋';
      case 'veto': return '❌';
      case 'approval': return '✅';
      case 'alert': return '🚨';
      default: return '💬';
    }
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-gradient-primary">Multi-Agent System Monitor</span>
          <Badge variant="outline" className="ml-auto">
            <Bot className="h-3 w-3 mr-1" />
            Eliza-Powered
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Real-time monitoring of autonomous AI agents and their communications.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agent Status Grid */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Agent Status
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(agentStatus).map(([agentId, status]) => (
              <div key={agentId} className="p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium">{agentId.replace('-', ' ').toUpperCase()}</p>
                  <Badge className={getStatusColor(status.status)}>
                    {status.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tasks: {status.taskCount} | Last: {new Date(status.lastActivity).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Communications */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Agent Communications
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {communications.length > 0 ? (
              communications.map((comm) => (
                <div key={comm.id} className="p-2 bg-muted/20 rounded text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{getMessageTypeIcon(comm.messageType)}</span>
                    <span className="font-medium">{comm.fromAgent}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{comm.toAgent}</span>
                    <span className="text-muted-foreground ml-auto">
                      {new Date(comm.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{comm.message}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No recent communications</p>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={startAnalysisCycle}
            disabled={isRunning}
            size="sm"
            className="flex-1"
          >
            <Play className="h-3 w-3 mr-1" />
            {isRunning ? 'Running...' : 'Start Analysis Cycle'}
          </Button>
          <Button 
            onClick={triggerEmergencyAlert}
            variant="destructive"
            size="sm"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Emergency Alert
          </Button>
        </div>

        {/* System Health */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">System Health</span>
            <Badge variant="default" className="bg-accent">
              ✅ All Systems Operational
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentMonitor;