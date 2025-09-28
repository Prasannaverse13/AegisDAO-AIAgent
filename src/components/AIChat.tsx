import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MessageCircle, Send, Bot } from 'lucide-react';

interface AIChatProps {
  onQuery: (query: string) => Promise<any>;
}

interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  analysis?: any;
}

const AIChat = ({ onQuery }: AIChatProps) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      type: 'ai',
      content: 'Hello! How can I help with the treasury today? You can ask me to analyze a hypothetical trade, like "What if we sell 1000 USDC for DEGA?"',
      timestamp: new Date()
    }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isAnalyzing) return;

    const userMessage: ChatMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsAnalyzing(true);

    // Add analyzing message
    const analyzingMessage: ChatMessage = {
      type: 'ai',
      content: 'Analyzing your request with current market conditions and risk parameters...',
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, analyzingMessage]);

    try {
      const analysis = await onQuery(message);
      
      // Remove analyzing message and add real response
      setChatHistory(prev => prev.slice(0, -1));
      
      const aiResponse: ChatMessage = {
        type: 'ai',
        content: `**${analysis.recommendation}**\n\n**Analysis:** ${analysis.justification}\n\n**Risk Assessment:** ${analysis.riskAssessment}`,
        timestamp: new Date(),
        analysis
      };
      
      setChatHistory(prev => [...prev, aiResponse]);
    } catch (error) {
      setChatHistory(prev => prev.slice(0, -1));
      const errorMessage: ChatMessage = {
        type: 'ai',
        content: 'Sorry, I encountered an error analyzing your request. Please try again.',
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <span className="text-gradient-primary">Manual Query & "What-If" Analysis</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Directly query the AI agent for strategies or test hypothetical trades.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-64 overflow-y-auto space-y-3 p-3 bg-muted/20 rounded-lg">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border'
                }`}
              >
                {msg.type === 'ai' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary">Aegis AI</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
                <p className="text-xs opacity-60 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything about treasury management..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isAnalyzing}
          />
          <Button 
            onClick={handleSend} 
            disabled={!message.trim() || isAnalyzing}
            className="glow-primary"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChat;