import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { decrypt } from "@/lib/crypto";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        envFiles: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Decrypt envFiles content
    const projectWithDecryptedFiles = {
      ...project,
      envFiles: project.envFiles.map((file) => {
        try {
          console.log("🔍 Decrypting file in project route:", file.name);
          console.log("🔒 Encrypted:", file.rawContent);
          const decrypted = decrypt(file.rawContent);
          console.log("🔓 Decrypted:", decrypted);
          return {
            ...file,
            rawContent: decrypted,
          };
        } catch (error) {
          console.error("❌ Decrypt error in project route:", error);
          return file;
        }
      }),
    };

    return NextResponse.json(projectWithDecryptedFiles);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, description } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
      },
      include: {
        envFiles: true,
      },
    });

    // Decrypt envFiles content for update response
    const projectWithDecryptedFiles = {
      ...project,
      envFiles: project.envFiles.map((file) => {
        try {
          return {
            ...file,
            rawContent: decrypt(file.rawContent),
          };
        } catch (error) {
          console.error("❌ Decrypt error in project update:", error);
          return file;
        }
      }),
    };

    return NextResponse.json(projectWithDecryptedFiles);
  } catch {
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
