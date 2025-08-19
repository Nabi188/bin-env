import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { encrypt, decrypt } from "@/lib/crypto";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const envFiles = await prisma.envFile.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });

    // Decrypt content for response
    const decryptedFiles = envFiles.map((file) => {
      try {
        return {
          ...file,
          rawContent: decrypt(file.rawContent),
        };
      } catch (error) {
        console.error("Decrypt error:", error, "Content:", file.rawContent);
        return {
          ...file,
          rawContent: file.rawContent, // Return encrypted if decrypt fails
        };
      }
    });

    return NextResponse.json(decryptedFiles);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch env files" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, rawContent } = await request.json();

    if (!name || !rawContent) {
      return NextResponse.json(
        { error: "Name and content are required" },
        { status: 400 }
      );
    }

    // Check if env file with same name already exists in this project
    const existingFile = await prisma.envFile.findFirst({
      where: {
        projectId: id,
        name: name,
      },
    });

    if (existingFile) {
      return NextResponse.json(
        { error: "Environment file with this name already exists" },
        { status: 409 }
      );
    }

    // Encrypt content before saving
    const encryptedContent = encrypt(rawContent);

    const envFile = await prisma.envFile.create({
      data: {
        name,
        rawContent: encryptedContent,
        projectId: id,
      },
    });

    // Return with decrypted content
    try {
      return NextResponse.json(
        {
          ...envFile,
          rawContent: decrypt(envFile.rawContent),
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Decrypt error on create:", error);
      return NextResponse.json(
        {
          ...envFile,
          rawContent: envFile.rawContent,
        },
        { status: 201 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to create env file" },
      { status: 500 }
    );
  }
}
