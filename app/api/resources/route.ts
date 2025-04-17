// app/api/resources/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getResources } from '@/actions/resources'; // Adjust the import path as needed
import { CurriculumType, ResourceStatus, ResourceType } from '@prisma/client'; // Assuming these types are from Prisma

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    
    // Get all filter parameters
    const subject = searchParams.get('subject') || undefined;
    const grade = searchParams.get('grade') ? parseInt(searchParams.get('grade')!) : undefined;
    const curriculum = searchParams.get('curriculum') as CurriculumType | undefined;
    const status = searchParams.get('status') as ResourceStatus | undefined;
    const type = searchParams.get('type') as ResourceType | undefined;
    
    // Pagination parameters
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 15;

    // Call the getResources function
    const result = await getResources({
      subject,
      grade,
      curriculum,
      status,
      type,
      page,
      limit
    });

    // Return the results
    return NextResponse.json(result);
  } catch (error) {
    console.error('API resources error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch resources',
        details: error instanceof Error ? error.message : 'Unknown error',
        resources: [],
        total: 0,
        pages: 0
      },
      { status: 500 }
    );
  }
}