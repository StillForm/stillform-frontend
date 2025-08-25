#!/usr/bin/env node
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";
import mime from "mime";

// 轻量加载 .env.local（不依赖 dotenv）
function loadEnvFile(filename: string) {
    const p = path.resolve(process.cwd(), filename);
    if (!fs.existsSync(p)) return;
    const text = fs.readFileSync(p, "utf8");
    for (const line of text.split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!m) continue;
        const [, k, raw] = m;
        const v = raw.replace(/^['"]|['"]$/g, "");
        if (!process.env[k]) process.env[k] = v;
    }
}
// Next.js 常用这几个文件名，按优先级加载
[".env.local", ".env"].forEach(loadEnvFile);

const REGION = process.env.FILEBASE_REGION || "us-east-1";
const ENDPOINT = process.env.FILEBASE_ENDPOINT || "https://s3.filebase.com";
const ACCESS_KEY_ID = process.env.FILEBASE_KEY || "";
const SECRET_ACCESS_KEY = process.env.FILEBASE_SECRET || "";
const BUCKET = process.env.FILEBASE_BUCKET || "stillform";

if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    console.error("❌ 请设置 FILEBASE_KEY / FILEBASE_SECRET（建议放在 .env.local）");
    process.exit(1);
}

const s3 = new S3Client({
    region: REGION,
    endpoint: ENDPOINT,
    credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
    forcePathStyle: true,
});

async function uploadFile(localPath: string, key: string) {
    const contentType = mime.getType(localPath) || "application/octet-stream";
    const body = fs.createReadStream(localPath);

    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
    }));

    const head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    const cid = head.Metadata?.cid;
    if (!cid) throw new Error(`未在元数据中找到 CID：${key}`);

    return { key, cid, gateway: `https://ipfs.filebase.io/ipfs/${cid}` };
}

async function main() {
    const input = process.argv[2];
    const prefix = process.argv[3] || ""; // 可选 key 前缀

    if (!input) {
        console.log(`用法:
  npx tsx scripts/upload.ts <本地文件或目录> [可选key前缀]

示例:
  npx tsx scripts/upload.ts "./public/art/Weixin Image_2025-08-15_144401_363.jpg" uploads/
  npx tsx scripts/upload.ts ./public/art site/
`);
        process.exit(0);
    }

    const stat = fs.statSync(input);
    const results: Array<{ key: string; cid: string; gateway: string }> = [];

    if (stat.isFile()) {
        const key = path.posix.join(prefix, path.basename(input)).replace(/\\/g, "/");
        const r = await uploadFile(input, key);
        results.push(r);
    } else if (stat.isDirectory()) {
        // 递归上传目录
        const files: string[] = [];
        const walk = (dir: string) => {
            for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, ent.name);
                if (ent.isDirectory()) walk(full);
                else if (ent.isFile()) files.push(full);
            }
        };
        walk(input);

        for (const f of files) {
            const rel = path.relative(input, f).split(path.sep).join("/");
            const key = path.posix.join(prefix, rel);
            const r = await uploadFile(f, key);
            results.push(r);
            console.log(`✅ ${f} -> s3://${BUCKET}/${key}`);
            console.log(`   CID: ${r.cid}`);
            console.log(`   GW : ${r.gateway}\n`);
        }
    } else {
        console.error("❌ 输入既不是文件也不是目录");
        process.exit(1);
    }

    console.log("=== 上传完成（汇总） ===");
    for (const r of results) {
        console.log(`${r.key}`);
        console.log(`  CID: ${r.cid}`);
        console.log(`  GW : ${r.gateway}`);
    }
}

main().catch((e) => {
    console.error("❌ 出错：", e);
    process.exit(1);
});