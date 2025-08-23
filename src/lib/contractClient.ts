"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, type Address } from 'wagmi';
import { decodeEventLog } from 'viem';
import {useEffect, useState} from "react";

// ABIs - Using correct relative paths
import PlatformRegistryAbi from '../../abis/PlatformRegistry.abi.json';
import CollectionFactoryAbi from '../../abis/CollectionFactory.abi.json';
import PrimaryMarketAbi from '../../abis/PrimaryMarket.abi.json';
import ArtProductCollectionAbi from '../../abis/ArtProductCollection.abi.json';
import addresses from '../../abis/addresses.json';

// --- Contract Configurations ---
const contractAddresses = {
  PlatformRegistry: addresses.registryAddress as Address,
  CollectionFactory: addresses.factoryAddress as Address,
  PrimaryMarket: addresses.marketAddress as Address,
};

export const collectionFactoryConfig = {
  address: contractAddresses.CollectionFactory,
  abi: CollectionFactoryAbi as const,
};

export const primaryMarketConfig = {
  address: contractAddresses.PrimaryMarket,
  abi: PrimaryMarketAbi as const,
};

export const artProductCollectionAbi = ArtProductCollectionAbi as const;

// --- Simplified and Corrected Contract Hooks ---

/**
 * Hook for CollectionFactory contract.
 * Handles the `createCollection` write transaction.
 */
export function useCollectionFactory() {
    const { data: hash, isPending, error: writeError, writeContract } = useWriteContract();
    const { 
        data: receipt,
        isLoading: isConfirming, 
        isSuccess,
        error: receiptError
    } = useWaitForTransactionReceipt({ hash });
    
    const [newCollectionAddress, setNewCollectionAddress] = useState<Address | null>(null);

    useEffect(() => {
        if (receipt) {
            try {
                const event = decodeEventLog({
                    abi: CollectionFactoryAbi,
                    data: receipt.logs[0].data,
                    topics: receipt.logs[0].topics,
                });
                if (event.eventName === 'CollectionCreated') {
                    const { collection } = event.args as { collection: Address };
                    setNewCollectionAddress(collection);
                }
            } catch (e) {
                console.error("Failed to decode event log:", e);
            }
        }
    }, [receipt]);

    const createCollection = (args: any[]) => {
        setNewCollectionAddress(null); // Reset on new transaction
        writeContract({
            ...collectionFactoryConfig,
            functionName: 'createCollection',
            args,
        });
    };

    const error = writeError || receiptError;

    return { createCollection, isPending, isConfirming, isSuccess, error, hash, newCollectionAddress, receipt };
}

/**
 * Hook for PrimaryMarket contract.
 * Handles the `purchase` write transaction.
 */
export function usePrimaryMarket() {
    const { data: hash, isPending, error: writeError, writeContract } = useWriteContract();
    const { 
        isLoading: isConfirming, 
        isSuccess,
        error: receiptError
    } = useWaitForTransactionReceipt({ hash });

    const purchase = (collectionAddress: Address, price: bigint) => {
        writeContract({
            ...primaryMarketConfig,
            functionName: 'purchase',
            args: [collectionAddress],
            value: price,
        });
    };
    
    const error = writeError || receiptError;

    return { purchase, isPending, isConfirming, isSuccess, error, hash };
}

/**
 * Hook for ArtProductCollection contracts (Read-only operations).
 */
export function useArtProductCollection(address: Address) {
    const getConfig = () => useReadContract({
        address,
        abi: artProductCollectionAbi,
        functionName: 'config',
    });
    
    // You can add other read functions here if needed, e.g., ownerOf(tokenId)
    
    return { getConfig };
}
