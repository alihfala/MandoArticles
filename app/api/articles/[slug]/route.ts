import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Simple GET handler without complex parameters
export async function GET(request: Request) {
  try {
    // Get the slug from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const slug = pathParts[pathParts.indexOf('articles') + 1];
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Article slug is required' },
        { status: 400 }
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
        { error: 'Article not found' },
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

    return NextResponse.json({ article: transformedArticle });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
} 