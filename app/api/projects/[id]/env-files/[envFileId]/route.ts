import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { encrypt, decrypt } from "@/lib/crypto";

const prisma = new PrismaClient();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; envFileId: string }> }
) {
  try {
    const { envFileId } = await params;
    const envFile = await prisma.envFile.findUnique({
      where: { id: envFileId },
    });

    if (!envFile) {
      return NextResponse.json(
        { error: "Env file not found" },
        { status: 404 }
      );
    }

    // Return with decrypted content
    return NextResponse.json({
      ...envFile,
      rawContent: decrypt(envFile.rawContent),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch env file" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; envFileId: string }> }
) {
  try {
    const { envFileId } = await params;
    const { name, rawContent } = await request.json();

    if (!rawContent) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Encrypt content before saving
    const encryptedContent = encrypt(rawContent);

    // Prepare update data - only include name if provided
    const updateData: { rawContent: string; name?: string } = {
      rawContent: encryptedContent,
    };

    if (name) {
      updateData.name = name;
    }

    const envFile = await prisma.envFile.update({
      where: { id: envFileId },
      data: updateData,
    });

    // Return with decrypted content
    return NextResponse.json({
      ...envFile,
      rawContent: decrypt(envFile.rawContent),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update env file" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; envFileId: string }> }
) {
  try {
    const { envFileId } = await params;
    await prisma.envFile.delete({
      where: { id: envFileId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete env file" },
      { status: 500 }
    );
  }
}
