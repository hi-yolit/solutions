// app/api/contents/[contentId]/questions/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { contentId: string } }
) {
  try {
    const questions = await prisma.question.findMany({
      where: {
        contentId: params.contentId
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