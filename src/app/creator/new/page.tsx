"use client";

import { useEffect } from 'react';
import { CreateWorkWizard } from "@/components/create-work-wizard";
import { useCreateWorkStore } from '@/store/create-work-store';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function NewWorkPage() {
  const reset = useCreateWorkStore((state) => state.reset);
  const { isConnected } = useAccount();

  useEffect(() => {
    // Reset the wizard state when the component mounts
    reset();
  }, [reset]);

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">Create New Work</h1>
        <p className="mt-2 text-muted-foreground">
          Follow the steps to publish your art as a unique NFT.
        </p>
        <div className="mt-8">
          {isConnected ? (
            <CreateWorkWizard />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-center">
              <h2 className="text-xl font-semibold">Please connect your wallet to continue</h2>
              <p className="mt-2 text-muted-foreground mb-4">
                You need to be connected to a wallet to create a new work.
              </p>
              <ConnectButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
