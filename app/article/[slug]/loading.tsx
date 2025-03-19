import React from 'react';

export default function ArticleLoading() {
  return (
    <div className="container mx-auto px-4 py-8 mt-12 animate-pulse">
      {/* Article Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        
        {/* Author info */}
        <div className="flex items-center mb-8">
          <div className="h-12 w-12 bg-gray-200 rounded-full mr-4"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        
        {/* Cover Image */}
        <div className="relative w-full h-96 bg-gray-200 rounded-lg mb-8"></div>
      </div>
      
      {/* Article Content */}
      <div className="max-w-4xl mx-auto prose lg:prose-xl">
        {/* Paragraph blocks */}
        {Array(6).fill(0).map((_, i) => (
          <React.Fragment key={i}>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
          </React.Fragment>
        ))}
        
        {/* Image block */}
        <div className="relative w-full h-72 bg-gray-200 rounded-lg my-8"></div>
        
        {/* More paragraphs */}
        {Array(4).fill(0).map((_, i) => (
          <React.Fragment key={i}>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6 mb-6"></div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
} 