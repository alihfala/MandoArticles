'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { Article } from '@/types';

// API functions
async function fetchArticle(slug: string) {
  const response = await fetch(`/api/articles/${slug}`);
  if (!response.ok) {
    throw new Error('Failed to fetch article');
  }
  return response.json();
}

async function toggleLike(slug: string) {
  const response = await fetch(`/api/articles/${slug}/like`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to toggle like');
  }
  
  return response.json();
}

// Helper function to check if a value is a non-null object
const isObject = (value: any): boolean => {
  return value !== null && typeof value === 'object';
};

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;
  const [copied, setCopied] = useState(false);

  // Use React Query to fetch article data
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => fetchArticle(slug),
    enabled: !!slug,
  });

  const article: Article | undefined = data?.article;

  // Handle article like action
  const handleLikeClick = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      // Toggle like status
      await toggleLike(slug);
      // Refetch to get the updated article data
      refetch();
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportToPDF = () => {
    // Implement PDF export functionality
    alert('PDF export functionality to be implemented');
  };

  const userHasLiked = article?.likes?.some(
    (like) => session?.user?.id === like.userId
  );

  useEffect(() => {
    if (error) {
      router.push('/');
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (error || !article) {
    return null; // Will redirect in the useEffect
  }

  // Function to safely render article content based on block type
  const renderBlock = (block: any, index: number) => {
    if (!block || typeof block !== 'object') {
      return <div key={index} className="text-red-500">Invalid block data</div>;
    }

    switch (block.type) {
      case 'text':
        return (
          <div key={index} className="mb-4">
            <p>{isObject(block.content) ? JSON.stringify(block.content) : String(block.content || '')}</p>
          </div>
        );
        
      case 'paragraph':
        return (
          <div key={index} className="mb-4">
            <p>{isObject(block.data) && block.data.text ? block.data.text : 
               (isObject(block.content) ? JSON.stringify(block.content) : String(block.content || ''))}</p>
          </div>
        );
        
      case 'header':
        const level = isObject(block.data) && block.data.level ? block.data.level : 2;
        const text = isObject(block.data) && block.data.text ? block.data.text : '';
        
        switch(level) {
          case 1:
            return <h1 key={index} className="text-3xl font-bold mt-6 mb-4">{text}</h1>;
          case 2:
            return <h2 key={index} className="text-2xl font-bold mt-5 mb-3">{text}</h2>;
          case 3:
            return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{text}</h3>;
          case 4:
            return <h4 key={index} className="text-lg font-bold mt-3 mb-2">{text}</h4>;
          case 5:
            return <h5 key={index} className="text-base font-bold mt-3 mb-2">{text}</h5>;
          case 6:
            return <h6 key={index} className="text-sm font-bold mt-3 mb-2">{text}</h6>;
          default:
            return <h2 key={index} className="text-2xl font-bold mt-5 mb-3">{text}</h2>;
        }
        
      case 'quote':
        const quoteText = isObject(block.data) && block.data.text ? block.data.text : '';
        const caption = isObject(block.data) && block.data.caption ? block.data.caption : '';
        const alignment = isObject(block.data) && block.data.alignment ? block.data.alignment : 'left';
        
        return (
          <blockquote 
            key={index} 
            className={`my-6 pl-4 border-l-4 border-gray-300 italic text-gray-700 ${
              alignment === 'center' ? 'text-center' : 
              alignment === 'right' ? 'text-right' : 'text-left'
            }`}
          >
            <p className="text-lg">{quoteText}</p>
            {caption && (
              <footer className="mt-2 text-sm text-gray-500">
                <cite>{caption}</cite>
              </footer>
            )}
          </blockquote>
        );
        
      case 'image':
        // Validate image block content
        if (!isObject(block.content) || !block.content.src) {
          // Check if data has the image info in EditorJS format
          if (isObject(block.data) && block.data.file && block.data.file.url) {
            return (
              <div key={index} className="relative h-80 w-full my-4">
                <Image
                  src={block.data.file.url}
                  alt={block.data.caption || ''}
                  fill
                  className="object-contain"
                />
                {block.data.caption && (
                  <div className="text-center text-sm text-gray-500 mt-2">
                    {block.data.caption}
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <div key={index} className="mb-4 p-4 bg-gray-100 text-gray-700 rounded">
              [Image placeholder - missing image source]
            </div>
          );
        }
        
        return (
          <div key={index} className="relative h-80 w-full my-4">
            <Image
              src={block.content.src}
              alt={block.content.alt || ''}
              fill
              className="object-contain"
            />
            {block.content.alt && (
              <div className="text-center text-sm text-gray-500 mt-2">
                {block.content.alt}
              </div>
            )}
          </div>
        );
        
      case 'code':
        return (
          <pre key={index} className="bg-gray-100 p-4 rounded overflow-x-auto mb-4">
            <code>{isObject(block.content) ? JSON.stringify(block.content, null, 2) : String(block.content || '')}</code>
          </pre>
        );
        
      case 'video':
        const videoUrl = isObject(block.data) && block.data.url ? block.data.url :
                         (isObject(block.content) && block.content.url ? block.content.url : '');
        
        if (!videoUrl) {
          return (
            <div key={index} className="mb-4 p-4 bg-gray-100 text-gray-700 rounded">
              [Video placeholder - missing video URL]
            </div>
          );
        }
        
        // YouTube embed
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
          const videoId = videoUrl.includes('youtube.com/watch?v=') 
            ? videoUrl.split('v=')[1].split('&')[0]
            : videoUrl.includes('youtu.be/') 
              ? videoUrl.split('youtu.be/')[1].split('?')[0] 
              : '';
              
          return (
            <div key={index} className="relative pb-[56.25%] h-0 mb-6">
              <iframe 
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          );
        }
        
        // Vimeo embed
        if (videoUrl.includes('vimeo.com')) {
          const videoId = videoUrl.split('vimeo.com/')[1];
          return (
            <div key={index} className="relative pb-[56.25%] h-0 mb-6">
              <iframe 
                className="absolute top-0 left-0 w-full h-full"
                src={`https://player.vimeo.com/video/${videoId}`}
                title="Vimeo video player"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          );
        }
        
        // Generic video
        return (
          <div key={index} className="mb-6">
            <video controls className="w-full rounded">
              <source src={videoUrl} />
              Your browser does not support video playback.
            </video>
          </div>
        );
        
      case 'list':
        const listItems = isObject(block.data) && Array.isArray(block.data.items) 
          ? block.data.items 
          : [];
        const listStyle = isObject(block.data) && block.data.style === 'ordered' 
          ? 'ordered' 
          : 'unordered';
          
        if (listStyle === 'ordered') {
          return (
            <ol key={index} className="list-decimal pl-5 mb-4 space-y-1">
              {listItems.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          );
        } else {
          return (
            <ul key={index} className="list-disc pl-5 mb-4 space-y-1">
              {listItems.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          );
        }
        
      case 'checklist':
        const checklistItems = isObject(block.data) && Array.isArray(block.data.items) 
          ? block.data.items 
          : [];
          
        return (
          <div key={index} className="mb-4">
            <ul className="space-y-2">
              {checklistItems.map((item: { text: string; checked: boolean }, i: number) => (
                <li key={i} className="flex items-start">
                  <div className={`flex-shrink-0 w-5 h-5 border rounded mr-2 mt-0.5 ${item.checked ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-gray-300'}`}>
                    {item.checked && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white m-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        );
        
      case 'separator':
        return <hr key={index} className="my-6 border-t border-gray-200" />;
        
      default:
        return (
          <div key={index} className="mb-4 p-2 border border-gray-200 rounded">
            <p className="text-sm text-gray-500">Unknown block type: {block.type}</p>
            <pre className="text-xs overflow-auto bg-gray-50 p-2 mt-1 rounded">
              {JSON.stringify(block, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-screen-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main content - article */}
        <article className="lg:col-span-8 bg-white rounded-lg shadow-md overflow-hidden">
          {article.featuredImage && (
            <div className="relative h-80 w-full">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <h1 className="text-4xl font-bold mb-6">{article.title}</h1>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 mr-3">
                  {article.author?.avatar ? (
                    <Image 
                      src={article.author.avatar} 
                      alt={article.author.name || ''} 
                      width={40} 
                      height={40} 
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm text-indigo-500 font-bold">
                        {article.author?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {article.author?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {article.createdAt && format(new Date(article.createdAt), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={copyToClipboard}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Share article"
                  title="Share article"
                >
                  {copied ? (
                    <span className="text-green-600 text-sm">Copied!</span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                  )}
                </button>
                
                <button 
                  onClick={exportToPDF}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Export to PDF"
                  title="Export to PDF"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <button 
                  onClick={handleLikeClick}
                  className={`p-2 rounded-full transition-colors ${
                    userHasLiked 
                      ? 'bg-red-100 hover:bg-red-200' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  aria-label={userHasLiked ? 'Unlike article' : 'Like article'}
                  title={userHasLiked ? 'Unlike article' : 'Like article'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${userHasLiked ? 'text-red-600' : 'text-gray-600'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <span className="text-sm text-gray-600">
                  {article.likes?.length || 0}
                </span>
              </div>
            </div>
            
            <div className="prose max-w-none">
              {/* Render article content here - this will depend on your content format */}
              {typeof article.content === 'string' ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <div>
                  {/* Render blocks if using a block-based editor */}
                  {Array.isArray(article.content.blocks) 
                    ? article.content.blocks.map((block, index) => renderBlock(block, index))
                    : (
                      <div className="p-4 bg-red-50 text-red-700 rounded-md">
                        <p>Invalid article content format</p>
                        <pre className="text-xs mt-2 bg-gray-50 p-2 rounded overflow-auto">
                          {JSON.stringify(article.content, null, 2)}
                        </pre>
                      </div>
                    )
                  }
                </div>
              )}
            </div>
          </div>
        </article>
        
        {/* Sidebar - author info */}
        <aside className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">About the Author</h2>
            
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 mr-3">
                {article.author?.avatar ? (
                  <Image 
                    src={article.author.avatar} 
                    alt={article.author.name || ''} 
                    width={48} 
                    height={48} 
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-sm text-indigo-500 font-bold">
                      {article.author?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {article.author?.name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-500">
                  {article.author?.email ? `@${article.author.email.split('@')[0]}` : ''}
                </p>
              </div>
            </div>
            
            {/* Author bio would go here */}
            <p className="text-gray-600 mb-6">
              {article.author?.bio || 'This author has not provided a bio yet.'}
            </p>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-900 mb-3">More from this author</h3>
              
              {/* This would be replaced with real data from an API call */}
              <div className="space-y-3">
                <p className="text-sm text-indigo-600 hover:underline cursor-pointer">
                  Loading more articles...
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
} 