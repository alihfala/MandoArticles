import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import LikeButton from '@/components/LikeButton/LikeButton';
import React from 'react';

async function getArticle(slug: string) {
  try {
    // Use the same URL construction approach as in the home page
    const baseUrl = process.env.VERCEL_URL || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const url = new URL(`/api/articles/${slug}`, `${protocol}://${baseUrl}`);
    
    const res = await fetch(url, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch article');
    }

    const data = await res.json();
    return data.article;
  } catch (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
}

// Helper function to check if a value is a non-null object
const isObject = (value: any): boolean => {
  return value !== null && typeof value === 'object';
};

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  
  if (!article) {
    notFound();
  }

  const renderContent = (content: any) => {
    try {
      // Handle cases where content is already an object (updated API format)
      let parsedContent;
      
      if (typeof content === 'string') {
        try {
          parsedContent = JSON.parse(content);
        } catch (e) {
          // If not valid JSON, return as plain text
          return <div className="article-content prose">{content}</div>;
        }
      } else if (isObject(content)) {
        parsedContent = content;
      } else {
        // Fallback for unexpected content type
        return <div className="article-content prose">No content available</div>;
      }
      
      // Check if content has blocks property (new format)
      const blocks = Array.isArray(parsedContent.blocks) 
        ? parsedContent.blocks 
        : Array.isArray(parsedContent) 
          ? parsedContent 
          : [];
      
      return (
        <div className="article-content">
          {blocks.map((block: any, index: number) => {
            if (!isObject(block)) return null;
            
            switch (block.type) {
              case 'paragraph':
                return (
                  <p key={index} className="mb-6 text-gray-800 leading-relaxed">
                    {typeof block.content === 'string' ? block.content : ''}
                  </p>
                );
              
              case 'heading': {
                const level = block.level || 2;
                const headingContent = typeof block.content === 'string' ? block.content : '';
                
                switch (level) {
                  case 1:
                    return <h1 key={index} className="text-3xl font-bold mt-10 mb-6">{headingContent}</h1>;
                  case 2:
                    return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{headingContent}</h2>;
                  case 3:
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-3">{headingContent}</h3>;
                  case 4:
                    return <h4 key={index} className="text-lg font-bold mt-6 mb-3">{headingContent}</h4>;
                  default:
                    return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{headingContent}</h2>;
                }
              }
              
              case 'image': {
                // Handle different image block structures
                const imageUrl = block.url || 
                  (isObject(block.content) && block.content.src) || 
                  (isObject(block.content) && block.content.url) ||
                  '/placeholder-image.jpg';
                
                const imageCaption = block.caption || 
                  (isObject(block.content) && block.content.caption) || 
                  'Article image';
                
                return (
                  <div key={index} className="my-8">
                    <div className="relative h-64 md:h-96 w-full">
                      <Image 
                        src={imageUrl} 
                        alt={imageCaption} 
                        fill
                        className="object-contain"
                      />
                    </div>
                    {imageCaption && (
                      <p className="text-center text-sm text-gray-500 mt-2">{imageCaption}</p>
                    )}
                  </div>
                );
              }
              
              case 'code': {
                const codeContent = typeof block.content === 'string' ? block.content : 
                  (isObject(block.content) && typeof block.content.code === 'string') ? block.content.code : '';
                
                return (
                  <pre key={index} className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto mb-6">
                    <code>{codeContent}</code>
                  </pre>
                );
              }
              
              case 'separator':
                return <hr key={index} className="my-8 border-t border-gray-200" />;
              
              case 'video': {
                const videoUrl = block.url || 
                  (isObject(block.content) && block.content.src) || 
                  (isObject(block.content) && block.content.url) || 
                  '';
                
                if (!videoUrl) return null;
                
                return (
                  <div key={index} className="my-8 aspect-video">
                    <iframe
                      src={videoUrl}
                      title="Video"
                      className="w-full h-full"
                      allowFullScreen
                    ></iframe>
                  </div>
                );
              }
              
              default:
                return null;
            }
          })}
        </div>
      );
    } catch (e) {
      console.error('Error rendering content:', e);
      // Fallback for non-JSON content
      return <div className="article-content prose">{typeof content === 'string' ? content : 'Content unavailable'}</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto bg-white rounded-lg overflow-hidden shadow-sm">
        {article.coverImage && (
          <div className="relative h-64 md:h-96 w-full">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <div className="p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              {article.author?.username && (
                <Link href={`/author/${article.author.username}`}>
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 mr-3">
                    {article.author?.image ? (
                      <Image
                        src={article.author.image}
                        alt={article.author.name || 'Author'}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-sm text-indigo-500 font-bold">
                          {article.author?.name?.charAt(0) || 'A'}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              )}
              <div>
                {article.author?.username && (
                  <Link 
                    href={`/author/${article.author.username}`}
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {article.author?.name || 'Anonymous'}
                  </Link>
                )}
                <div className="flex text-xs text-gray-500">
                  <time dateTime={article.createdAt}>
                    {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                  </time>
                  {article.updatedAt && article.createdAt && article.updatedAt !== article.createdAt && (
                    <span className="ml-2">
                      (Updated {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })})
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <LikeButton 
              articleId={article.id} 
              slug={article.slug}
              initialLikeCount={article.likes?.length || 0} 
              initialLiked={article.isLiked || false}
            />
          </div>
          
          {article.content && renderContent(article.content)}
        </div>
      </article>
    </div>
  );
} 