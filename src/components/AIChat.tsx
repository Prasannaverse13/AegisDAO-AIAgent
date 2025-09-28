import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { MessageSquare, Send, TrendingDown } from 'lucide-react';

interface AIChatProps {
  onQuery: (query: string) => void;
}

const AIChat = ({ onQuery }: AIChatProps) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      content: 'Hello! How can I help with the treasury today? You can ask me to analyze a hypothetical trade, like "What if we sell 1000 USDC for DEGA?"'
    }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    onQuery(message);
    setMessage('');
    
    // Simulate AI response (in real implementation, this would come from Gemini API)
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'Analyzing your request with current market conditions and risk parameters...'
      }]);
    }, 1000);
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="text-gradient-primary">Manual Query & "What-If" Analysis</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Directly query the AI agent for strategies or test hypothetical trades.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-32 overflow-y-auto space-y-2 p-3 bg-muted/20 rounded-lg">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`text-sm ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded-lg max-w-[80%] ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Ask about treasury strategies..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Example scenario analysis result */}
        <div className="p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="destructive">
              <TrendingDown className="h-3 w-3 mr-1" />
              Not Recommended
            </Badge>
          </div>
          <p className="text-sm font-medium mb-2">Hypothetical Trade: Sell 10,000 USDC to buy DEGA.</p>
          <div>
            <h4 className="text-sm font-semibold mb-1">Justification:</h4>
            <p className="text-xs text-muted-foreground">
              Rejecting this proposal. Investing 10,000 USDC into DEGA at this time presents an elevated risk profile that conflicts with our treasury's established goal of maintaining a balanced and relatively stable portfolio.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChat;