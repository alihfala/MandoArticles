// app/page.tsx

import React from 'react';
import ArticleCard from '@/components/ArticleCard';
import { Article } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

// Add dynamic metadata
export const dynamic = 'force-dynamic';

// This function isn't used in the current implementation
// async function fetchArticles({ pageParam = 0 }) {
//   const response = await fetch(`/api/articles?page=${pageParam}`);
//   if (!response.ok) {
//     throw new Error('Failed to fetch articles');
//   }
//   return response.json();
// }

async function getArticles() {
  try {
    // For Server Components in Next.js, we need to provide a full URL for API routes
    const baseUrl = process.env.VERCEL_URL || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const url = new URL('/api/articles', `${protocol}://${baseUrl}`);
    
    // Use incremental static regeneration with a short revalidation period
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch articles: ${res.status}`);
    }

    const data = await res.json();
    return data.articles || [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

// This can remain async as a Server Component
export default async function Home() {
  const articles = await getArticles();

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Welcome to Mando Articles
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover insightful articles and share your knowledge with the world
          </p>
        </div>
        
        {/* Featured Articles - First 3 articles */}
        {articles.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {articles.slice(0, 3).map((article: any) => (
                <div key={article.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-48 w-full">
                    <Link href={`/article/${article.slug}`} className="block h-full w-full">
                      {article.coverImage ? (
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-500 font-semibold">Mando Articles</span>
                        </div>
                      )}
                    </Link>
                  </div>
                  <div className="p-5">
                    <Link href={`/article/${article.slug}`} className="block">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-indigo-600">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.excerpt || article.content?.substring(0, 150) || "No content available"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 mr-2">
                          {article.author?.image ? (
                            <Image
                              src={article.author.image}
                              alt={article.author.name || 'Author'}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-xs text-indigo-500 font-bold">
                                {article.author?.name?.charAt(0) || 'A'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Link href={`/author/${article.author?.username}`} className="text-sm font-medium text-gray-800 hover:text-indigo-600">
                            {article.author?.name || 'Anonymous'}
                          </Link>
                          <p className="text-xs text-gray-500">
                            {article.createdAt 
                              ? formatDistanceToNow(new Date(article.createdAt), { addSuffix: true }) 
                              : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {article.likes?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Recent Articles - Next 6 articles */}
        {articles.length > 3 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.slice(3, 9).map((article: any) => (
                <div key={article.id} className="bg-white rounded-lg overflow-hidden shadow border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row">
                  <div className="relative h-48 md:h-auto md:w-1/3">
                    <Link href={`/article/${article.slug}`} className="block h-full w-full">
                      {article.coverImage ? (
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-500 font-semibold">Mando Articles</span>
                        </div>
                      )}
                    </Link>
                  </div>
                  <div className="p-5 flex-1">
                    <Link href={`/article/${article.slug}`} className="block">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-indigo-600">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {article.excerpt || article.content?.substring(0, 100) || "No content available"}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center">
                        <Link href={`/author/${article.author?.username}`} className="text-sm font-medium text-gray-800 hover:text-indigo-600">
                          {article.author?.name || 'Anonymous'}
                        </Link>
                        <span className="mx-2 text-gray-300">•</span>
                        <p className="text-xs text-gray-500">
                          {article.createdAt 
                            ? formatDistanceToNow(new Date(article.createdAt), { addSuffix: true }) 
                            : 'Unknown date'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {article.likes?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {articles.length > 9 && (
              <div className="text-center mt-8">
                <Link 
                  href="/articles" 
                  className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors duration-300"
                >
                  View All Articles
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* Empty state */}
        {articles.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No articles yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share your knowledge!</p>
            <Link
              href="/editor"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors duration-300"
            >
              Write an Article
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}