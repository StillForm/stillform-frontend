"use client";

import { ConnectButton as RainbowConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { ConnectButton as SuiConnectButton } from '@mysten/dapp-kit';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EvmConnectButton = () => {
  const { isConnected, chainId: connectedChainId } = useAccount();
  const { chains, switchChain } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const defaultChainId = useChainId();

  const currentChainId = connectedChainId ?? defaultChainId;

  if (isConnected) {
    return <RainbowConnectButton />;
  }

  const currentChain = chains.find(c => c.id === currentChainId);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {currentChain ? currentChain.name : 'Select Network'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {chains.map((chain) => (
            <DropdownMenuItem
              key={chain.id}
              onClick={() => switchChain?.({ chainId: chain.id })}
              disabled={!switchChain}
            >
              {chain.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button onClick={openConnectModal}>
        Connect Wallet
      </Button>
    </div>
  );
};


export function WalletConnect() {
  return (
    <div className="flex items-center gap-2">
      <EvmConnectButton />
      <SuiConnectButton />
    </div>
  );
}
