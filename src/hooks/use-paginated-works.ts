"use client";

import { useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { Work } from '@/app/api/mock/data';
import { artProductCollectionAbi } from '@/lib/contractClient';
import { Address } from 'viem';

// TODO: 此处需要一个真实的、由索引服务提供的 NFT 集合地址列表
// 目前使用一个空的占位符。请在这里填入实际的集合合约地址。
const MOCK_COLLECTION_ADDRESSES: Address[] = [
  // ！！重要提示！！
  // 这是一个临时的、用于演示的硬编码地址。
  // 在没有索引服务的情况下，您需要手动将新创建的集合地址添加到此列表中才能看到它们。
  "0x08D395011197282AC83302e5A9879214478daf37"
];


type CollectionConfig = {
  ptype: number;
  price: bigint;
  maxSupply: bigint;
  unrevealedUri: string;
  creator: Address;
  registry: Address;
};

// As returned by the contract call, it's a tuple (array)
type StyleTuple = readonly [number, number, number, string]; // [weightBp, maxSupply, minted, baseUri]

export const usePaginatedWorks = () => {
    const contracts = MOCK_COLLECTION_ADDRESSES.flatMap(address => ([
      { address, abi: artProductCollectionAbi, functionName: 'config' },
      { address, abi: artProductCollectionAbi, functionName: 'name' },
      { address, abi: artProductCollectionAbi, functionName: 'styles', args: [0] },
    ]));

    const { data: contractResults, isFetching: isFetchingConfig } = useReadContracts({
      contracts,
    });

    const collectionData = useMemo(() => {
      if (!contractResults) return [];
      const collections: ({ config: CollectionConfig; name: string; style: StyleTuple } | null)[] = [];
      
      for (let i = 0; i < MOCK_COLLECTION_ADDRESSES.length; i++) {
        const configResult = contractResults[i * 3];
        const nameResult = contractResults[i * 3 + 1];
        const styleResult = contractResults[i * 3 + 2];

        if (
          configResult?.status === 'success' &&
          nameResult?.status === 'success' &&
          styleResult?.status === 'success'
        ) {
          collections.push({
            config: configResult.result as CollectionConfig,
            name: nameResult.result as string,
            style: styleResult.result as StyleTuple,
          });
        } else {
          console.error(
            `Failed to fetch data for collection at address: ${MOCK_COLLECTION_ADDRESSES[i]}.`,
            {
              configStatus: configResult?.status,
              nameStatus: nameResult?.status,
              styleStatus: styleResult?.status,
              configError: configResult?.error?.message,
              nameError: nameResult?.error?.message,
              styleError: styleResult?.error?.message,
            }
          );
          collections.push(null);
        }
      }
      return collections;
    }, [contractResults]);

    const works: Work[] = collectionData
      .map((data, index) => {
        if (!data) return null;
        
        const address = MOCK_COLLECTION_ADDRESSES[index];
        const { config, name, style } = data;
        
        const creatorAddress = config.creator || "0x0000000000000000000000000000000000000000";
        const [weightBp, maxSupply, minted, baseUri] = style;
        const imageUrl = baseUri || '/vercel.svg';

        const work: Work = {
          id: address,
          slug: address,
          title: name || `Chain Collection ${index + 1}`,
          description: 'No description available.', // Description is not available from this query
          media: [{ type: 'image', url: imageUrl }],
          creator: {
            address: creatorAddress,
            displayName: `Creator ${creatorAddress.slice(0, 6)}...`,
            avatarUrl: '/vercel.svg',
          },
          editions: [{
            editionId: 1,
            supply: Number(config.maxSupply),
            price: Number(config.price) / 1e18,
            currency: 'ETH'
          }],
          chain: {
            type: 'evm',
            chainId: 11155111, // Sepolia
            contractAddress: address,
          },
          status: 'listed',
          type: config.ptype === 0 ? 'standard' : 'blindbox',
          tags: [],
          physicalOptions: [],
          stats: {
            favorites: 0,
            sales: Number(minted),
          },
          createdAt: new Date().toISOString(),
        };
        return work;
      })
      .filter((w): w is Work => w !== null);

    const isLoading = isFetchingConfig;

    return {
      isLoading,
      data: {
        items: works,
        total: works.length,
        page: 1,
        pageSize: works.length,
      },
    };
};
