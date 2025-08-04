import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        envFiles: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(projects)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        name,
        description
      },
      include: {
        envFiles: true
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}