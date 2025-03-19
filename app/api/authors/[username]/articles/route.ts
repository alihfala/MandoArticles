import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Article } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '6');
    
    // Extract username from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const usernameIndex = pathParts.indexOf('authors') + 1;
    const username = pathParts[usernameIndex];
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // First, find the author by username
    const author = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!author) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }

    // Then, get articles by this author
    const articles = await prisma.article.findMany({
      where: {
        authorId: author.id,
        published: true // Only include published articles
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
          }
        },
        likes: {
          select: {
            id: true,
            userId: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip: page * limit,
      take: limit
    });

    // Transform the response to match frontend types
    const transformedArticles = articles.map((article: any) => ({
      ...article,
      author: article.author ? {
        id: article.author.id,
        name: article.author.fullName,
        username: article.author.username,
        avatar: article.author.avatar,
      } : undefined,
    }));

    return NextResponse.json({
      articles: transformedArticles,
      nextPage: articles.length === limit ? page + 1 : null,
    });
  } catch (error) {
    console.error('Error fetching author articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch author articles' },
      { status: 500 }
    );
  }
} 