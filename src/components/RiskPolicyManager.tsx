import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Settings, Brain, CheckCircle } from 'lucide-react';

interface RiskPolicyParameters {
  maxDrawdown: string;
  volatilityTarget: string;
  stablecoinAllocation: string;
  preferredAssetClass: string;
}

interface RiskPolicyManagerProps {
  onPolicyUpdate: (policy: string) => Promise<{
    maxDrawdown: number;
    volatilityTarget: string;
    stablecoinAllocation: number;
    preferredAssetClass: string;
  }>;
}

const RiskPolicyManager = ({ onPolicyUpdate }: RiskPolicyManagerProps) => {
  const [policyStatement, setPolicyStatement] = useState('');
  
  const examplePolicies = [
    '"I want a conservative policy focused on 60% stablecoin yield and low volatility."',
    '"Aggressively pursue high-growth, emerging tokens and accept a 25% drawdown."'
  ];

const [currentParameters, setCurrentParameters] = useState<RiskPolicyParameters>({
  maxDrawdown: '10%',
  volatilityTarget: 'Low',
  stablecoinAllocation: '60%',
  preferredAssetClass: 'Stablecoins'
});
const [isUpdating, setIsUpdating] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="text-gradient-primary">Dynamic Risk Policy</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Define your treasury's risk tolerance using natural language. The AI will translate it into programmatic parameters.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Risk Policy Statement</label>
            <Textarea
              placeholder="Enter your risk policy in natural language..."
              value={policyStatement}
              onChange={(e) => setPolicyStatement(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Examples:</p>
            <div className="space-y-2">
              {examplePolicies.map((example, index) => (
                <div
                  key={index}
                  className="p-2 bg-muted/30 rounded text-xs cursor-pointer hover:bg-muted/50 transition-smooth"
                  onClick={() => setPolicyStatement(example)}
                >
                  {example}
                </div>
              ))}
            </div>
          </div>
          
<Button 
            onClick={async () => {
              if (!policyStatement.trim()) return;
              try {
                setIsUpdating(true);
                const res = await onPolicyUpdate(policyStatement);
                setCurrentParameters({
                  maxDrawdown: `${res.maxDrawdown}%`,
                  volatilityTarget: res.volatilityTarget,
                  stablecoinAllocation: `${res.stablecoinAllocation}%`,
                  preferredAssetClass: res.preferredAssetClass,
                });
              } finally {
                setIsUpdating(false);
              }
            }}
            className="w-full glow-primary"
            disabled={!policyStatement.trim() || isUpdating}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isUpdating ? 'Updating...' : 'Update AI Policy'}
          </Button>
        </CardContent>
      </Card>

      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-accent" />
            Current AI Parameters
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            This is what the agent will use for its decisions.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Max Drawdown</p>
              <Badge variant="outline" className="mt-1">{currentParameters.maxDrawdown}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Volatility Target</p>
              <Badge variant="outline" className="mt-1">{currentParameters.volatilityTarget}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Stablecoin Allocation</p>
              <Badge variant="outline" className="mt-1">{currentParameters.stablecoinAllocation}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Preferred Asset Class</p>
              <Badge variant="outline" className="mt-1">{currentParameters.preferredAssetClass}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskPolicyManager;