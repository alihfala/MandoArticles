'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import ArticleCard from '@/components/ArticleCard/ArticleCard';
import { Article, User } from '@/types';

async function fetchAuthorProfile(username: string) {
  const response = await fetch(`/api/authors/${username}`);
  if (!response.ok) {
    throw new Error('Failed to fetch author profile');
  }
  return response.json();
}

async function fetchAuthorArticles(username: string, page: number = 0) {
  const response = await fetch(`/api/authors/${username}/articles?page=${page}`);
  if (!response.ok) {
    throw new Error('Failed to fetch author articles');
  }
  return response.json();
}

export default function AuthorProfilePage() {
  const { username } = useParams() as { username: string };
  const router = useRouter();
  const { data: session } = useSession();
  const [page, setPage] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError
  } = useQuery({
    queryKey: ['authorProfile', username],
    queryFn: () => fetchAuthorProfile(username),
  });

  const {
    data: articlesData,
    isLoading: isArticlesLoading,
    error: articlesError,
    refetch: refetchArticles
  } = useQuery({
    queryKey: ['authorArticles', username, page],
    queryFn: () => fetchAuthorArticles(username, page),
  });

  const author = profileData?.author as User;
  const isOwnProfile = session?.user?.username === username;
  const articles = articlesData?.articles as Article[];
  const topArticles = articlesData?.topArticles as Article[];
  const hasMoreArticles = articlesData?.nextPage !== null;

  const handleLoadMore = () => {
    setPage(current => current + 1);
  };

  const handleUpdateProfile = () => {
    // Will be implemented with a modal or separate page
    alert('Profile update functionality to be implemented');
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      try {
        const response = await fetch(`/api/authors/${username}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete account');
        }
        
        // Sign out and redirect to home page
        router.push('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account. Please try again.');
      }
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader">Loading profile...</div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">Failed to load author profile</p>
        <button 
          onClick={() => router.push('/')}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Return to home
        </button>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Author not found</h1>
        <p className="mb-4">The author you're looking for does not exist.</p>
        <Link href="/" className="text-indigo-600 hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-screen-xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-40 w-full"></div>
        
        <div className="p-6 -mt-16 relative">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
            <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white bg-white shadow-md">
              {author.avatar ? (
                <Image 
                  src={author.avatar} 
                  alt={author.name} 
                  width={112} 
                  height={112}
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-3xl text-indigo-500 font-bold">
                    {author.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-0 md:ml-6 flex-grow">
              <h1 className="text-3xl font-bold">{author.name}</h1>
              <p className="text-gray-600">@{author.username}</p>
              <p className="text-gray-600 mt-2">{author.bio || 'No bio available'}</p>
            </div>
            
            {isOwnProfile && (
              <div className="mt-4 md:mt-0">
                <button
                  onClick={handleUpdateProfile}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 mr-2"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isOwnProfile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">Total Articles</h2>
            <p className="text-3xl font-bold text-indigo-600">{articlesData?.totalArticles || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">Total Likes</h2>
            <p className="text-3xl font-bold text-indigo-600">{articlesData?.totalLikes || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">Top Performing Article</h2>
            {topArticles && topArticles.length > 0 ? (
              <Link href={`/article/${topArticles[0].slug}`} className="text-indigo-600 hover:underline">
                {topArticles[0].title}
                <span className="ml-2 text-sm text-gray-500">({topArticles[0].likes?.length || 0} likes)</span>
              </Link>
            ) : (
              <p className="text-gray-600">No articles yet</p>
            )}
          </div>
        </div>
      )}
      
      {isOwnProfile && topArticles && topArticles.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Top Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-2xl font-bold mb-6">
          {isOwnProfile ? 'Your Articles' : `Articles by ${author.name}`}
        </h2>
        
        {isArticlesLoading ? (
          <div className="text-center py-8">
            <div className="loader">Loading articles...</div>
          </div>
        ) : articlesError ? (
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load articles</p>
          </div>
        ) : articles && articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            
            {hasMoreArticles && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">No articles published yet</p>
            {isOwnProfile && (
              <Link href="/editor" className="text-indigo-600 hover:underline">
                Write your first article
              </Link>
            )}
          </div>
        )}
      </div>
      
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Delete Account</h2>
            <p className="mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your articles will be removed.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 