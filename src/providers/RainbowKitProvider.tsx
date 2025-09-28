import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const config = getDefaultConfig({
  appName: 'AegisDAO',
  projectId: '91f167f5889a649b993ea6fddb741d88',
  chains: [mainnet, sepolia],
  ssr: false,
});

const queryClient = new QueryClient();

interface RainbowProviderProps {
  children: ReactNode;
}

const RainbowProvider = ({ children }: RainbowProviderProps) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default RainbowProvider;