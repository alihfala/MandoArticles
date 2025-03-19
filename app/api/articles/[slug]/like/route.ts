import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

type Params = {
  params: {
    slug: string;
  };
};

export async function POST(
  req: Request,
  { params }: Params
) {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { slug } = params;
    
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