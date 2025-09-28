import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketSentimentProps {
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  description: string;
}

const MarketSentiment = ({ sentiment, description }: MarketSentimentProps) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish':
        return 'status-profit';
      case 'Bearish':
        return 'status-loss';
      default:
        return 'status-neutral';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish':
        return <TrendingUp className="h-4 w-4" />;
      case 'Bearish':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-gradient-primary">Market Sentiment</span>
          <Badge variant="outline" className={`${getSentimentColor(sentiment)} border-current`}>
            <span className="flex items-center gap-1">
              {getSentimentIcon(sentiment)}
              {sentiment}
            </span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default MarketSentiment;