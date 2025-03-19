import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Article } from '@/types';

type ArticleCardProps = {
  article: Article;
};

export default function ArticleCard({ article }: ArticleCardProps) {
  // Function to truncate title if it's too long
  const truncateTitle = (title: string, maxLength = 60) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  // Extract content preview from the JSON content
  const extractPreview = (content: any): string => {
    try {
      // This is a simple example - in reality, you'd need to parse your
      // specific content format to extract text
      if (typeof content === 'string') {
        return content.substring(0, 120) + '...';
      }
      
      // If content is stored as JSON with blocks
      if (content.blocks && Array.isArray(content.blocks)) {
        const textBlock = content.blocks.find((block: any) => block.type === 'text');
        if (textBlock && textBlock.content) {
          return textBlock.content.substring(0, 120) + '...';
        }
      }
      
      return 'Read this article...';
    } catch (error) {
      return 'Read this article...';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/article/${article.slug}`}>
        <div className="relative h-48 w-full">
          {article.featuredImage ? (
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="bg-gray-200 h-full w-full flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/article/${article.slug}`}>
          <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
            {truncateTitle(article.title)}
          </h2>
        </Link>
        
        <p className="text-gray-600 mb-4 text-sm">
          {article.excerpt || extractPreview(article.content)}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 mr-2">
              {article.author?.avatar ? (
                <Image 
                  src={article.author.avatar} 
                  alt={article.author.name || ''} 
                  width={32} 
                  height={32} 
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xs text-indigo-500 font-bold">
                    {article.author?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">
                {article.author?.name || 'Unknown'}
              </p>
              <p className="text-xs text-gray-500">
                {article.updatedAt && formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-1">
              {article.likes?.length || 0}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
} 