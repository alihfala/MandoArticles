import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';

// Simple POST handler without complex parameters
export async function POST(request: Request) {
  try {
    // Get the slug from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const slug = pathParts[pathParts.indexOf('articles') + 1];
    
    // Get session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Article slug is required' },
        { status: 400 }
      );
    }

    // Find the article
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check if the user has already liked the article
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        articleId: article.id,
      },
    });

    if (existingLike) {
      // User has already liked the article, so remove the like
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      return NextResponse.json({
        message: 'Like removed successfully',
        liked: false,
      });
    } else {
      // User hasn't liked the article yet, so add a like
      await prisma.like.create({
        data: {
          userId,
          articleId: article.id,
        },
      });

      return NextResponse.json({
        message: 'Article liked successfully',
        liked: true,
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
} 