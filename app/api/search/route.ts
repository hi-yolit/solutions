// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchResources } from '@/actions/search';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    // Validate query parameter
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Call the search function
    const searchResults = await searchResources({
      query,
      page,
      limit
    });

    // Return results
    return NextResponse.json(searchResults);
  } catch (error) {
    console.error('API search error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}