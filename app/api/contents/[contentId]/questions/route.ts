// app/api/contents/[contentId]/questions/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ contentId: string }> }
) {

  const { contentId } = await params;

  try {
    const questions = await prisma.question.findMany({
      where: {
        contentId: contentId
      },
      orderBy: [
        { order: 'asc' },
        { questionNumber: 'asc' }
      ]
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}