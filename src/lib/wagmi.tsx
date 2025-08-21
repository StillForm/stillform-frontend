"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, bsc } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: 'Tangible NFT Platform',
  projectId: 'a0d828c4b63e75e39a7f34c11f6922d5', // This is a public demo project ID
  chains: [mainnet, polygon, bsc],
  ssr: true,
});
