import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface TreasuryOverviewProps {
  balance: string;
  totalValue: string;
  address: string;
}

const TreasuryOverview = ({ balance, totalValue, address }: TreasuryOverviewProps) => {
  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="text-gradient-primary">DAO Treasury</CardTitle>
        <Badge variant="secondary" className="w-fit">Connected Wallet Balance</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-2xl font-bold text-gradient-secondary">{totalValue}</p>
          <p className="text-muted-foreground">{balance}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Address: {address}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreasuryOverview;