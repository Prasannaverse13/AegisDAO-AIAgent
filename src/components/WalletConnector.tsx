import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card } from './ui/card';

const WalletConnector = () => {
  return (
    <Card className="card-gradient p-6 transition-smooth hover:glow-primary mx-auto max-w-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gradient-primary">AegisDAO</h3>
          <p className="text-sm text-muted-foreground">Connect your wallet to manage treasury</p>
        </div>
        <ConnectButton />
      </div>
    </Card>
  );
};

export default WalletConnector;