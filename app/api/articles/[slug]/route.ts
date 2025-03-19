import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * GET handler for a specific article by slug
 * This endpoint returns details for an individual article
 */
export async function GET(request: Request) {
  try {
    // Get the slug from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const slug = pathParts[pathParts.indexOf('articles') + 1];
    
    if (!slug) {
      return NextResponse.json(
        { 
          error: 'Article slug is required',
          status: 'error',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Check database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (connError) {
      console.error('Database connection error:', connError);
      return NextResponse.json(
        { 
          error: 'Database connection error', 
          message: 'Unable to connect to the database. Please try again later.',
          details: connError instanceof Error ? connError.message : 'Unknown error',
          status: 'error',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
            bio: true,
            email: true,
          },
        },
        likes: {
          select: {
            id: true,
            userId: true,
          },
        },
        blocks: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { 
          error: 'Article not found',
          status: 'error',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    // Transform the data to match our frontend types
    const transformedArticle = {
      ...article,
      content: article.content,
      author: article.author ? {
        id: article.author.id,
        name: article.author.fullName,
        email: article.author.email,
        image: article.author.avatar,
        bio: article.author.bio,
      } : undefined,
    };

    return NextResponse.json({ 
      article: transformedArticle,
      status: 'success',
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    console.error('Error fetching article:', error);
    
    // Determine if it's a Prisma error
    const isPrismaError = 
      error instanceof Error &&
      (error instanceof Prisma.PrismaClientKnownRequestError || 
      error instanceof Prisma.PrismaClientUnknownRequestError || 
      error instanceof Prisma.PrismaClientRustPanicError || 
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientValidationError);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch article',
        message: isPrismaError ? 'Database error occurred' : 'Server error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 