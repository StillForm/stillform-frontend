import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import path from "path";

export const dynamic = 'force-dynamic'; // Prevent caching of this route

// --- S3 Client Configuration (from scripts/upload.ts) ---
const REGION = process.env.FILEBASE_REGION || "us-east-1";
const ENDPOINT = process.env.FILEBASE_ENDPOINT || "https://s3.filebase.com";
const ACCESS_KEY_ID = process.env.FILEBASE_KEY || "";
const SECRET_ACCESS_KEY = process.env.FILEBASE_SECRET || "";
const BUCKET = process.env.FILEBASE_BUCKET || "stillform";

if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    console.error("Filebase credentials (FILEBASE_KEY, FILEBASE_SECRET) are not set in .env.local");
}

const s3 = new S3Client({
    region: REGION,
    endpoint: ENDPOINT,
    credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
    forcePathStyle: true,
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const prefix = formData.get("prefix") as string || "uploads"; // Optional prefix

        if (!file) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }

        // --- Upload Logic ---
        const buffer = Buffer.from(await file.arrayBuffer());
        const key = path.posix.join(prefix, `${Date.now()}-${file.name}`);

        await s3.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        }));

        const head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
        const cid = head.Metadata?.cid;
        if (!cid) {
            throw new Error(`Failed to retrieve CID for uploaded file: ${key}`);
        }

        const gatewayUrl = `https://equal-brown-cougar.myfilebase.com/ipfs/${cid}`;

        return NextResponse.json({
            success: true,
            key,
            cid,
            gatewayUrl
        });

    } catch (error) {
        console.error("Error in upload API:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json({ error: "Upload failed.", details: errorMessage }, { status: 500 });
    }
}

// Optional: Add a GET handler to show a simple message
export async function GET() {
    return NextResponse.json({ message: "This is the file upload endpoint. Please use POST to upload files." });
}
