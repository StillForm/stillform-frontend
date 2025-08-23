import { useEffect, useState } from "react";
import { useCreateWorkStore } from "@/store/create-work-store";
import { Button } from "./ui/button";
import { useAccount } from "wagmi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi, decodeEventLog, TransactionReceipt } from "viem";
import addresses from "../../abis/addresses.json";

// Simplified ABI for the CollectionFactory
const factoryAbi = parseAbi([
  "event CollectionCreated(address indexed creator, address indexed collection, bytes32 configHash)",
  "function createCollection(string, string, (uint8, uint256, uint32, string, address, address), (uint16, uint32, uint32, string)[]) returns (address)"
]);

import { useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";

export function ReviewAndPublish() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { formData, workType, reset } = useCreateWorkStore();
  const { address: userAddress } = useAccount();
  const { data: hash, writeContract, isPending: isTxPending, error: txError } = useWriteContract();
  
  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = 
    useWaitForTransactionReceipt({ hash });

  const [backendError, setBackendError] = useState<string | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [backendSuccessData, setBackendSuccessData] = useState<any | null>(null);
  const [uploadedIpfsUrl, setUploadedIpfsUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log("Wagmi isTxPending state changed to:", isTxPending);
    if (txError) {
      console.error("Wagmi txError state has been set:", txError);
    }
  }, [isTxPending, txError]);

  const handlePublish = async () => {
    if (!userAddress || !formData.rawFile) {
        console.error("User address or file is missing.");
        setUploadError("User address or file is missing. Please ensure your wallet is connected and you have selected a file.");
        return;
    }

    setIsFileUploading(true);
    setUploadError(null);

    try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", formData.rawFile);
        uploadFormData.append("prefix", "art"); // As per project structure

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.details || "File upload failed.");
        }

        const ipfsUrl = result.gatewayUrl;
        console.log("File uploaded successfully. IPFS URL:", ipfsUrl);
        setUploadedIpfsUrl(ipfsUrl); // Store the URL in state
        
        // Now, proceed with the contract call using the new IPFS URL
        triggerContractCall(ipfsUrl);

    } catch (err: any) {
        console.error("Upload process failed:", err);
        setUploadError(err.message || "An unexpected error occurred during upload.");
    } finally {
        setIsFileUploading(false);
    }
  };

  const triggerContractCall = (baseUri: string) => {
    if (!userAddress) return;
    
    console.log("ReviewAndPublish handlePublish formData:", JSON.stringify(formData, null, 2));
    console.log("Current user address:", userAddress);

    setBackendError(null);
    setBackendSuccessData(null);
    
    const priceInWei = BigInt(Math.round((formData.editions?.[0]?.price || 0) * 1e18));
    console.log("Calculated priceInWei:", priceInWei.toString());

    // Convert config object to an array with the exact order defined in the ABI
    const configAsArray = [
      workType === 'standard' ? 0 : 1, // ptype
      priceInWei, // price
      formData.editions?.[0]?.supply || 0, // maxSupply
      "", // unrevealedUri (only for blindbox)
      userAddress, // creator
      addresses.registryAddress, // registry
    ];
    
    // Convert styles objects to arrays, now using the IPFS URL
    const stylesAsArray = workType === 'blindbox' 
      ? (formData.blindboxStyles || []).map(s => ([
          Math.round(s.probability * 100),
          0,
          0,
          s.image || baseUri, // Use specific image if available, else fallback
        ]))
      : [[
          10000,
          formData.editions?.[0]?.supply || 0,
          0,
          baseUri, // Use the uploaded file's URL
        ]];

    const contractArgs = {
      address: addresses.factoryAddress as `0x${string}`,
      abi: factoryAbi,
      functionName: 'createCollection',
      args: [
        formData.title || '',
        formData.symbol || '',
        configAsArray,
        stylesAsArray,
      ],
    };

    console.log("Arguments for writeContract:", JSON.stringify(contractArgs, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value, 2
    ));

    try {
      writeContract(contractArgs);
    } catch (e) {
      console.error("Error calling writeContract:", e);
    }
  };
  
  useEffect(() => {
    const postToBackend = async (receipt: TransactionReceipt) => {
        try {
           const event = receipt.logs
            .map((log: any) => {
              try {
                return decodeEventLog({ abi: factoryAbi, ...log });
              } catch { return null; }
            })
            .find((e: any) => e?.eventName === 'CollectionCreated');

          if (!event || !event.args.collection) {
            throw new Error("CollectionCreated event not found in transaction logs.");
          }
          const newCollectionAddress = (event.args as { collection: string }).collection;
          
          if (!uploadedIpfsUrl) {
            throw new Error("IPFS URL was not available for backend post.");
          }

          const collectionData = {
            id: newCollectionAddress, // Use the real address from the event
            creatorAddress: userAddress,
            name: formData.title,
            type: workType === 'standard' ? 'NORMAL' : 'BLIND_BOX',
            price: (BigInt(Math.round((formData.editions?.[0]?.price || 0) * 1e18))).toString(),
            maxSupply: formData.editions?.[0]?.supply || 0,
            coverImageUrl: uploadedIpfsUrl, // Use the IPFS URL from state
          };
          
          const response = await fetch('http://localhost:3001/api/collections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(collectionData),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message || "Failed to save to backend.");
          setBackendSuccessData(result);
          
          console.log("%c[ReviewAndPublish] Attempting to invalidate 'collections' query...", 'color: blue;');
          await queryClient.invalidateQueries({ queryKey: ['collections'] });
          console.log("%c[ReviewAndPublish] Collections query invalidation command sent.", 'color: green;');
          reset(); // Reset the form on final success

          // Navigate to the newly created collection's detail page in the creator's studio
          console.log(`%c[ReviewAndPublish] Navigating to /creator/studio/${newCollectionAddress}`, 'color: purple;');
          router.push(`/creator/studio/${newCollectionAddress}`);
        } catch (err: any) {
          setBackendError(`Backend update failed: ${err.message}`);
        }
      };

    if (isConfirmed && receipt) {
      postToBackend(receipt);
    }
  }, [isConfirmed, receipt, userAddress, formData, workType, reset, uploadedIpfsUrl]);


  const isSubmitting = isFileUploading || isTxPending || isConfirming;
  const isSuccess = isConfirmed && !!backendSuccessData;
  
  let buttonText = "Publish";
  if (isFileUploading) buttonText = "Uploading file...";
  if (isTxPending) buttonText = "Waiting for signature...";
  if (isConfirming) buttonText = "Confirming on-chain...";
  if (isSuccess) buttonText = "Published Successfully!";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review and Publish</h2>
      <div className="p-4 border rounded-md bg-muted">
        <h3 className="font-semibold">Data to be sent to contract:</h3>
        <pre className="mt-2 text-sm whitespace-pre-wrap">
          {JSON.stringify({ ...formData, rawFile: formData.rawFile?.name }, null, 2)}
        </pre>
      </div>

      <Button onClick={handlePublish} disabled={isSubmitting || isSuccess} className="w-full" size="lg">
        {buttonText}
      </Button>

      {(txError || receiptError || backendError || uploadError) && (
        <p className="text-red-500 text-sm">
          {uploadError || txError?.message.split('Details:')[0] || receiptError?.message.split('Details:')[0] || backendError}
        </p>
      )}
      
      {isSuccess && (
        <div className="text-green-500 text-sm">
          <p>Success! Collection created and saved.</p>
          <p>Collection Address: {backendSuccessData.id}</p>
        </div>
      )}
    </div>
  );
}
