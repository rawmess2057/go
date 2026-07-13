import { NextResponse } from "next/server";
import { isValidImageFile } from "@/lib/validate";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const check = await isValidImageFile(file);
  if (!check.valid) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    console.error("PINATA_JWT not set");
    return NextResponse.json({ error: "Upload not configured" }, { status: 500 });
  }

  const buffer = await file.arrayBuffer();
  const blob = new Blob([buffer], { type: file.type });
  const pinataFormData = new FormData();
  pinataFormData.set("file", blob, file.name);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: pinataFormData,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Pinata upload failed:", err);
    return NextResponse.json({ error: `Upload failed: ${err}` }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}` });
}
