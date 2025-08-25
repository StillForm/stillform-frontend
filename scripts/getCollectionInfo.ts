// scripts/getCollectionInfo.ts
import { createPublicClient, http, isAddress, Chain } from 'viem';
import { localhost, mainnet, base, sepolia } from 'viem/chains';
import ArtProductCollection from '../abis/ArtProductCollection.abi.json';

// Helper to select the correct viem chain object based on a chainId
const getChain = (chainId?: string | number): Chain => {
  const id = Number(chainId);
  if (!id || isNaN(id)) {
    console.log("No valid chainId provided, defaulting to Sepolia testnet.");
    return sepolia; 
  }

  switch (id) {
    case 1: return mainnet;
    case 11155111: return sepolia;
    case 8453: return base;
    case 1337:
    case 31337:
      return localhost;
    default:
      console.warn(`Unsupported chainId: ${id}. Defaulting to Sepolia.`);
      return sepolia;
  }
};

async function getCollectionInfo(address: string, chainId?: string | number) {
  if (!isAddress(address)) {
    console.error(`Error: Invalid address provided: ${address}`);
    return;
  }

  const chain = getChain(chainId);
  const publicClient = createPublicClient({ chain, transport: http() });

  console.log(`\nQuerying collection information for address:`);
  console.log(`  -> ${address}`);
  console.log(`On network:`);
  console.log(`  -> ${chain.name} (ID: ${chain.id})`);
  console.log('--------------------------------------------------');

  try {
    // Fetch all data in parallel
    const namePromise = publicClient.readContract({ address: address as `0x${string}`, abi: ArtProductCollection, functionName: 'name' });
    const symbolPromise = publicClient.readContract({ address: address as `0x${string}`, abi: ArtProductCollection, functionName: 'symbol' });
    const configPromise = publicClient.readContract({ address: address as `0x${string}`, abi: ArtProductCollection, functionName: 'config' });
    const stylesPromise = publicClient.readContract({ address: address as `0x${string}`, abi: ArtProductCollection, functionName: 'getStyles' });

    const [name, symbol, config, styles] = await Promise.all([namePromise, symbolPromise, configPromise, stylesPromise]);
    
    console.log("\n✅ Successfully fetched all data from the contract.");
    console.log('--------------------------------------------------');
    
    // --- Raw Data Output ---
    console.log("\nRAW DATA:\n");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Config:", config);
    console.log("Styles:", styles);
    
    // --- Formatted Data Output ---
    const configData = config as any;
    const isBlindbox = configData.ptype === 1;

    const formatted = {
      address: address,
      name: name,
      symbol: symbol,
      type: isBlindbox ? 'Blindbox' : 'Standard',
      creator: configData.creator,
      price: `${Number(configData.price) / 1e18} ETH`,
      maxSupply: configData.maxSupply,
      unrevealedUri: isBlindbox ? configData.unrevealedUri : 'N/A',
      styles: (styles as any[]).map((s, i) => ({
        styleIndex: i,
        name: s.name,
        baseUri: s.baseURI,
        probability: `${Number(s.probabilityBps) / 100}%`,
      })),
    };
    
    console.log('--------------------------------------------------');
    console.log("\nFORMATTED DATA:\n");
    console.log(JSON.stringify(formatted, null, 2));
    console.log('--------------------------------------------------');

  } catch (error) {
    console.error("\n❌ An error occurred while fetching contract data:");
    console.error(error);
  }
}

// --- How to run this script ---
// npx ts-node --esm ./scripts/getCollectionInfo.ts <COLLECTION_ADDRESS> [CHAIN_ID]
// Example:
// npx ts-node --esm ./scripts/getCollectionInfo.ts 0x123...abc 11155111
// -----------------------------

const args = process.argv.slice(2);
const collectionAddress = args[0];
const chainId = args[1]; // Optional

if (!collectionAddress) {
  console.error("Usage: npx ts-node --esm ./scripts/getCollectionInfo.ts <COLLECTION_ADDRESS> [CHAIN_ID]");
  process.exit(1);
}

getCollectionInfo(collectionAddress, chainId);
