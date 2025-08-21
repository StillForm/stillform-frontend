"use client";

import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { ConnectButton as SuiConnectButton } from '@mysten/dapp-kit';

export function WalletConnect() {
  return (
    <div className="flex items-center gap-2">
      <RainbowConnectButton />
      <SuiConnectButton />
    </div>
  );
}
