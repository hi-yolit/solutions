// app/api/contents/[contentId]/children/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/actions/user';

export async function GET(
  request: NextRequest,
  { params }: { params: { contentId: string } }
) {
  try {
    // Verify admin status
    const { isAdmin, error } = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Wait for the params object to be fully resolved
    const { contentId } = await params;
    
    // Get children with counts
    const children = await prisma.content.findMany({
      where: { 
        parentId: contentId 
      },
      include: {
        _count: {
          select: {
            children: true,
            questions: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    // Find the parent content item
    const parentContent = await prisma.content.findUnique({
      where: { id: contentId },
      select: { id: true, type: true, parentId: true }
    });

    // Calculate chapter ID for each child
    let chapterId = null;
    
    if (parentContent) {
      if (parentContent.type === 'CHAPTER') {
        // Parent is already a chapter
        chapterId = parentContent.id;
      } else if (parentContent.parentId) {
        // Check if parent's parent is a chapter
        const grandparent = await prisma.content.findUnique({
          where: { id: parentContent.parentId },
          select: { type: true, id: true }
        });
        
        if (grandparent && grandparent.type === 'CHAPTER') {
          chapterId = grandparent.id;
        }
      }
    }
    
    // Add chapterId to each child
    const enrichedChildren = children.map(child => ({
      ...child,
      chapterId  // Add the chapter ID to each child
    }));
    
    console.log(enrichedChildren);
    
    return NextResponse.json({ children: enrichedChildren });
  } catch (error) {
    console.error('Error fetching content children:', error);
    return NextResponse.json({ error: 'Failed to fetch content children' }, { status: 500 });
  }
}