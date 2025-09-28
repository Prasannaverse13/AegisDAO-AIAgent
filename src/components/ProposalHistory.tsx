import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { History, Shield, CheckCircle } from 'lucide-react';

interface Proposal {
  id: string;
  description: string;
  date: string;
  status: 'Executed' | 'Pending' | 'Rejected';
}

const ProposalHistory = () => {
  const proposals: Proposal[] = [
    {
      id: 'PROP-001',
      description: 'Given the DAO\'s high volatility target, preference for emerging tokens, and the 0% stablecoin allocation target, rebalancing the entire ETH balance into DEGA is recommended.',
      date: '2025-09-27',
      status: 'Executed'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Executed':
        return (
          <Badge variant="default" className="bg-accent text-accent-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            Executed (Shielded)
          </Badge>
        );
      case 'Pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <span className="text-gradient-primary">Proposal History</span>
          <Badge variant="outline" className="ml-auto">
            <Shield className="h-3 w-3 mr-1" />
            Privacy-Preserving
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          A log of all past and pending proposals with ZK-proof verification.
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proposal</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.map((proposal) => (
              <TableRow key={proposal.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{proposal.id}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {proposal.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{proposal.date}</TableCell>
                <TableCell>{getStatusBadge(proposal.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProposalHistory;