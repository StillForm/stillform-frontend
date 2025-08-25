import { notFound } from "next/navigation";
import { ArtDetailClientPage } from "./art-detail-client-page";
import { createPublicClient, http, isAddress, Address } from "viem";
import { sepolia } from "viem/chains";
import { artProductCollectionAbi } from '@/lib/contractClient';
import { Work } from "@/app/api/mock/data";

// Create a server-side Viem public client to interact with the blockchain.
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/O6ySduKVVmH2gx7bQ9M-uI1DmJBvdOkv"),
});

// Define types for the tuple data returned by the smart contract.
type CollectionConfigTuple = readonly [ptype: number, price: bigint, maxSupply: bigint, unrevealedUri: string, creator: Address, registry: Address];
type StyleTuple = readonly [weightBp: number, maxSupply: number, minted: number, baseUri: string];

/**
 * Fetches all necessary details for a single collection directly from the blockchain.
 * This function runs on the server.
 * @param address The contract address of the collection.
 * @returns A fully-formed 'Work' object or null if not found.
 */
async function getCollectionDetails(address: string): Promise<Work | null> {
  if (!isAddress(address)) {
    console.warn("Invalid address provided to getCollectionDetails:", address);
    return null;
  }

  try {
    const results = await publicClient.multicall({
      contracts: [
        { address, abi: artProductCollectionAbi, functionName: 'config' },
        { address, abi: artProductCollectionAbi, functionName: 'name' },
        { address, abi: artProductCollectionAbi, functionName: 'styles', args: [0] },
      ],
      allowFailure: true,
    });

    const [configResult, nameResult, styleResult] = results;

    if (configResult.status !== 'success' || nameResult.status !== 'success' || styleResult.status !== 'success') {
      throw new Error(`One or more contract calls failed. Config: ${configResult.status}, Name: ${nameResult.status}, Style: ${styleResult.status}`);
    }
    
    const config = configResult.result as CollectionConfigTuple;
    const name = nameResult.result as string;
    const style = styleResult.result as StyleTuple;

    // --- Correctly access tuple data by index ---
    const ptype = config[0];
    const price = config[1];
    const maxSupply = config[2];
    const creatorAddress = config[4];
    
    const minted = style[2];
    const baseUri = style[3];
    // --- End of corrected access ---

    if (!creatorAddress) {
      throw new Error("Creator address is missing from the contract response.");
    }

    const imageUrl = baseUri || '/vercel.svg';

    const work: Work = {
        id: address,
        slug: address,
        title: name,
        description: 'Details fetched directly from the blockchain.',
        media: [{ type: 'image', url: imageUrl }],
        creator: {
            address: creatorAddress,
            displayName: `Creator ${creatorAddress.slice(0, 6)}...`,
            avatarUrl: '/vercel.svg',
        },
        editions: [{
            editionId: 1,
            supply: Number(maxSupply),
            price: Number(price) / 1e18,
            currency: 'ETH'
        }],
        chain: {
            type: 'evm',
            chainId: sepolia.id,
            contractAddress: address as Address,
        },
        status: 'listed',
        type: ptype === 0 ? 'standard' : 'blindbox',
        tags: [], physicalOptions: [],
        stats: {
            favorites: 0,
            sales: Number(minted),
        },
        createdAt: new Date().toISOString(),
    };
    return work;

  } catch (error) {
    console.error(`Failed to fetch details for collection ${address}:`, error);
    return null;
  }
}

export default async function ArtDetailPage({ params }: { params: { slug: string } }) {
  const work = await getCollectionDetails(params.slug);

  if (!work) {
    notFound();
  }

  return (
    <div className="container py-10">
      <ArtDetailClientPage work={work} />
    </div>
  );
}
