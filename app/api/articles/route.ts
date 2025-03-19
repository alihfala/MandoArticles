import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { Article } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '6');
    const authorId = searchParams.get('authorId');
    
    // Build query filters
    const where = {
      published: true,
      ...(authorId ? { authorId } : {}),
    };

    // Fetch paginated articles
    const articles = await prisma.article.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
          },
        },
        likes: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip: page * limit,
      take: limit,
    });

    // Transform data to match frontend types
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
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Authenticate the user - make sure to await the auth call
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Don't allow guest users to create articles
    if (session.user.isGuest) {
      return NextResponse.json(
        { error: 'Guest users cannot create articles' },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    const requestData = await request.json();
    const { title, slug, content, excerpt, featuredImage, published, id } = requestData;
    
    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      );
    }

    console.log('Received article data:', {
      title,
      slug,
      authorId: userId,
      published: published || false
    });

    // If an ID is provided, we're updating an existing article
    if (id) {
      // Check if the article exists and belongs to the user
      const existingArticle = await prisma.article.findUnique({
        where: { id },
        select: { id: true, authorId: true }
      });

      if (!existingArticle) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        );
      }

      if (existingArticle.authorId !== userId) {
        return NextResponse.json(
          { error: 'You do not have permission to edit this article' },
          { status: 403 }
        );
      }

      try {
        // Update the article
        const updatedArticle = await prisma.$transaction(async (tx: PrismaClient) => {
          // First delete existing blocks
          await tx.block.deleteMany({
            where: { articleId: id }
          });

          // Then update the article
          const article = await tx.article.update({
            where: { id },
            data: {
              title,
              slug,
              excerpt,
              content,
              featuredImage,
              published: published || false,
              // Create new blocks
              blocks: {
                create: content.blocks.map((block: any, index: number) => ({
                  type: block.type,
                  content: block.data,
                  order: index
                }))
              }
            },
            include: {
              author: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                  avatar: true,
                }
              }
            }
          });

          return article;
        });

        // Transform article data to match frontend types
        const transformedArticle = {
          ...updatedArticle,
          author: updatedArticle.author ? {
            id: updatedArticle.author.id,
            name: updatedArticle.author.fullName,
            username: updatedArticle.author.username,
            avatar: updatedArticle.author.avatar,
          } : undefined,
        };

        return NextResponse.json({
          article: transformedArticle,
          message: published ? 'Article published successfully' : 'Draft updated successfully'
        });
      } catch (err) {
        console.error('Error in transaction:', err);
        return NextResponse.json(
          { error: 'Failed to update article', details: err instanceof Error ? err.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }

    // Creating a new article - first check if slug already exists
    try {
      const existingArticle = await prisma.article.findUnique({
        where: { slug }
      });

      if (existingArticle) {
        return NextResponse.json(
          { error: 'An article with this slug already exists' },
          { status: 409 }
        );
      }

      // Create the article
      const article = await prisma.article.create({
        data: {
          title,
          slug,
          excerpt,
          content,
          featuredImage,
          published: published || false,
          authorId: userId,
          // Create blocks from content.blocks
          blocks: {
            create: content.blocks.map((block: any, index: number) => ({
              type: block.type,
              content: block.data,
              order: index
            }))
          }
        },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              username: true,
              avatar: true,
            }
          }
        }
      });

      // Transform article data to match frontend types
      const transformedArticle = {
        ...article,
        author: article.author ? {
          id: article.author.id,
          name: article.author.fullName,
          username: article.author.username,
          avatar: article.author.avatar,
        } : undefined,
      };

      console.log('Article created successfully:', article.id);

      return NextResponse.json({
        article: transformedArticle,
        message: published ? 'Article published successfully' : 'Draft saved successfully'
      });
    } catch (err) {
      console.error('Error creating article:', err);
      return NextResponse.json(
        { error: 'Failed to create article', details: err instanceof Error ? err.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { error: 'Failed to save article', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Add PUT method for updating articles (alternative to using POST with an ID)
export async function PUT(request: Request) {
  // This is just a convenience wrapper around POST
  return POST(request);
} 