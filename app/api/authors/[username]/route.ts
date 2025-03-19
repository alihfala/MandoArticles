import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    // Make sure params is awaited properly
    const username = params?.username;
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const author = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        _count: {
          select: {
            articles: true,
          }
        }
      }
    });

    if (!author) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }

    // Transform author data to match the User type expected by the frontend
    const transformedAuthor = {
      id: author.id,
      name: author.fullName,
      username: author.username,
      email: author.email,
      avatar: author.avatar,
      bio: author.bio,
      articleCount: author._count.articles
    };

    return NextResponse.json({
      author: transformedAuthor,
    });
  } catch (error) {
    console.error('Error fetching author:', error);
    return NextResponse.json(
      { error: 'Failed to fetch author' },
      { status: 500 }
    );
  }
} 