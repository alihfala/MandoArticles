import React from 'react';

export default function ArticlesLoading() {
  return (
    <div className="container mx-auto px-4 py-8 mt-12 animate-pulse">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full max-w-lg mx-auto"></div>
      </div>
      
      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
            {/* Image */}
            <div className="relative h-48 bg-gray-200"></div>
            
            {/* Content */}
            <div className="p-5">
              <div className="h-5 bg-gray-200 rounded w-4/5 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-200 rounded-full mr-2"></div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-gray-200 rounded-full mr-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-6"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex justify-center mt-12">
        <div className="h-10 w-32 bg-gray-200 rounded-md"></div>
      </div>
    </div>
  );
} 