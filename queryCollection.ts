import { ethers, Contract } from 'ethers';

// =================================================================
// 配置区域 - 请修改这里的 RPC URL（推荐用环境变量注入）
// =================================================================
const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL ||
    "https://eth-sepolia.g.alchemy.com/v2/O6ySduKVVmH2gx7bQ9M-uI1DmJBvdOkv";
if (!SEPOLIA_RPC_URL) {
    console.error("错误：请设置 SEPOLIA_RPC_URL 环境变量或在脚本中提供 RPC URL。");
    process.exit(1);
}
// =================================================================

const contractAbi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function config() view returns (uint8 ptype, uint256 price, uint32 maxSupply, string unrevealedUri, address creator, address registry)",
    "function styles(uint256 index) view returns (uint16 weightBp, uint32 maxSupply, uint32 minted, string baseUri)"
];

function getProductType(ptype: number): string {
    switch (ptype) {
        case 0: return "NORMAL";
        case 1: return "BLINDBOX";
        default: return "UNKNOWN";
    }
}

async function queryCollection(collectionAddress: string) {
    if (!ethers.isAddress(collectionAddress)) {
        console.error(`错误: 无效的以太坊地址: ${collectionAddress}`);
        return;
    }

    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const collection = new Contract(collectionAddress, contractAbi, provider);

    console.log("==================================================");
    console.log(`查询 Collection: ${collectionAddress}`);
    console.log("==================================================");

    try {
        console.log("\n--- 基本信息 ---");
        const [name, symbol, totalSupply] = await Promise.all([
            collection.name(),
            collection.symbol(),
            collection.totalSupply()
        ]);
        console.log(`名称: ${name}`);
        console.log(`符号: ${symbol}`);
        console.log(`总供应量: ${totalSupply.toString()}`);

        console.log("\n--- Collection 配置 ---");
        const config = await collection.config();
        const ptype = getProductType(Number(config.ptype));
        console.log(`产品类型: ${ptype}`);
        console.log(`价格 (wei): ${config.price.toString()}`);
        console.log(`最大供应量: ${config.maxSupply.toString ? config.maxSupply.toString() : config.maxSupply}`);
        console.log(`创作者: ${config.creator}`);
        if (ptype === "BLINDBOX") {
            console.log(`未揭示 URI: ${config.unrevealedUri}`);
        }
        console.log(`平台注册表: ${config.registry}`);

        console.log("\n--- Styles ---");
        let i = 0;
        let stylesFound = false;
        while (true) {
            try {
                const style = await collection.styles(i);
                stylesFound = true;
                console.log(`\n样式 #${i}:`);
                console.log(`  - 基础 URI: ${style.baseUri}`);
                console.log(`  - 最大供应量: ${style.maxSupply.toString ? style.maxSupply.toString() : style.maxSupply}`);
                console.log(`  - 已铸造数量: ${style.minted.toString ? style.minted.toString() : style.minted}`);
                console.log(`  - 权重 (基点): ${style.weightBp.toString ? style.weightBp.toString() : style.weightBp}`);
                i++;
            } catch {
                if (!stylesFound) console.log("未找到任何样式。");
                break;
            }
        }
    } catch (error: any) {
        console.error("\n查询过程中发生错误:", error?.message || error);
    } finally {
        console.log("\n==================================================");
        console.log("查询完毕。");
        console.log("==================================================");
    }
}

function main() {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.log("用法: npx tsx queryCollection.ts <collection_address>");
        return;
    }
    const collectionAddress = args[0];
    queryCollection(collectionAddress);
}

main();