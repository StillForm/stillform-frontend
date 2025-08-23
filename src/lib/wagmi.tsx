"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { http } from 'wagmi';
import { mainnet, polygon, bsc, sepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: 'Tangible NFT Platform',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  wallets: [
    {
      groupName: 'Popular',
      wallets: [metaMaskWallet, walletConnectWallet],
    },
  ],
  chains: [mainnet, polygon, bsc, sepolia],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});
