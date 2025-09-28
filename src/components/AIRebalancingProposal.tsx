import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bot, Shield, Zap } from 'lucide-react';

interface AIRebalancingProposalProps {
  action: string;
  proposal: string;
  justification: string;
  onApprove: () => void;
  onReject: () => void;
}

const AIRebalancingProposal = ({ 
  action, 
  proposal, 
  justification, 
  onApprove, 
  onReject 
}: AIRebalancingProposalProps) => {
  return (
    <Card className="card-gradient pulse-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="text-gradient-primary">AI Rebalancing Proposal</span>
          <Badge variant="secondary" className="ml-auto">
            <Shield className="h-3 w-3 mr-1" />
            ZK-Verified
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">AI-generated strategy to optimize treasury.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{action}</Badge>
          </div>
          <p className="font-medium">{proposal}</p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2 text-primary">Justification</h4>
          <p className="text-sm text-muted-foreground">{justification}</p>
        </div>
        
        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            onClick={onReject}
            className="flex-1"
          >
            Reject
          </Button>
          <Button 
            onClick={onApprove}
            className="flex-1 glow-primary"
          >
            <Zap className="h-4 w-4 mr-2" />
            Approve & Execute
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRebalancingProposal;