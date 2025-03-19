'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
  articleId: string;
  slug: string;
  initialLikeCount: number;
  initialLiked: boolean;
}

export default function LikeButton({ 
  articleId, 
  slug, 
  initialLikeCount, 
  initialLiked = false 
}: LikeButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local state if props change
  useEffect(() => {
    setLikeCount(initialLikeCount);
    setIsLiked(initialLiked);
  }, [initialLikeCount, initialLiked]);

  const handleLike = async () => {
    if (status === 'loading') {
      return; // Don't do anything while session is loading
    }

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.isGuest) {
      router.push('/auth/signin?error=GuestAccessDenied');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/articles/${slug}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to like article');
      }

      const data = await response.json();
      
      if (data.liked) {
        setIsLiked(true);
        setLikeCount((prevCount) => prevCount + 1);
      } else {
        setIsLiked(false);
        setLikeCount((prevCount) => prevCount - 1);
      }
    } catch (error) {
      console.error('Error liking article:', error);
      setError(error instanceof Error ? error.message : 'Error liking article');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleLike}
        disabled={isLoading || status === 'loading'}
        className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
          isLiked 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-gray-500 hover:text-gray-700'
        } ${isLoading || status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
        aria-label={isLiked ? 'Unlike article' : 'Like article'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 ${isLiked ? 'fill-current' : 'stroke-current fill-none'}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={isLiked ? 0 : 2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span>{likeCount}</span>
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
} 