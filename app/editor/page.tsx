'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import ImageWithFallback from '@/components/ImageWithFallback';

type Block = {
  id: string;
  type: 'text' | 'image' | 'video' | 'code' | 'separator';
  content: any;
};

type Selection = {
  blockId: string;
  start: number;
  end: number;
  text: string;
};

export default function EditorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: 'text', content: '' }
  ]);
  const [activeBlockId, setActiveBlockId] = useState('1');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selection, setSelection] = useState<Selection | null>(null);
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [formatToolbarPosition, setFormatToolbarPosition] = useState({ top: 0, left: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [featuredImage, setFeaturedImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/editor');
    }
  }, [status, router]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleBlockChange = (id: string, content: any) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === id ? { ...block, content } : block
      )
    );
  };

  const handleBlockClick = (id: string) => {
    setActiveBlockId(id);
    setShowMenu(false);
  };

  const handleAddBlock = (type: Block['type'], position?: number) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: type === 'text' ? '' : type === 'code' ? '' : type === 'image' ? { src: '', alt: '' } : type === 'video' ? { url: '' } : {}
    };
    
    setBlocks(prevBlocks => {
      const activeBlockIndex = prevBlocks.findIndex(block => block.id === activeBlockId);
      const insertIndex = position !== undefined ? position : activeBlockIndex + 1;
      
      return [
        ...prevBlocks.slice(0, insertIndex),
        newBlock,
        ...prevBlocks.slice(insertIndex)
      ];
    });
    
    setActiveBlockId(newBlock.id);
    setShowMenu(false);
    
    // Focus the new block after the state update
    setTimeout(() => {
      const newBlockElement = blockRefs.current[newBlock.id];
      if (newBlockElement) {
        newBlockElement.focus();
      }
    }, 0);
  };

  const handleBlockKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddBlock('text');
    } else if (e.key === 'Backspace' && (e.target as HTMLElement).textContent === '') {
      e.preventDefault();
      handleDeleteBlock(blockId);
    } else if (e.key === '/' && (e.target as HTMLElement).textContent === '') {
      e.preventDefault();
      showBlockMenu(e);
    }
  };

  const handleDeleteBlock = (id: string) => {
    if (blocks.length === 1) {
      // Don't delete the last block, just clear it
      handleBlockChange(id, '');
      return;
    }
    
    setBlocks(prevBlocks => {
      const index = prevBlocks.findIndex(block => block.id === id);
      const newBlocks = prevBlocks.filter(block => block.id !== id);
      
      // Set the new active block (previous block or next block)
      if (newBlocks.length > 0) {
        const newActiveIndex = Math.min(index, newBlocks.length - 1);
        setActiveBlockId(newBlocks[newActiveIndex].id);
      }
      
      return newBlocks;
    });
  };

  const showBlockMenu = (e: React.MouseEvent | React.KeyboardEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setMenuPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX
    });
    setShowMenu(true);
  };

  const handleSaveData = async (publish: boolean = false) => {
    if (!session?.user) {
      setErrorMessage('You must be signed in to save an article');
      return;
    }
    
    if (!title.trim()) {
      setErrorMessage('Please add a title for your article');
      return;
    }
    
    setIsSaving(true);
    setErrorMessage(null);
    
    try {
      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      // Prepare content as EditorJS compatible format
      const content = {
        time: new Date().getTime(),
        blocks: blocks.map((block, index) => ({
          id: block.id,
          type: block.type,
          data: block.content
        })),
        version: "2.26.5"
      };
      
      // Generate excerpt if not provided manually
      const autoExcerpt = excerpt || generateExcerpt(blocks);
      
      const articleData = {
        title,
        slug,
        content,
        excerpt: autoExcerpt,
        featuredImage,
        published: publish
      };
      
      console.log('Saving article with data:', articleData);
      
      // Send to API
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to save article');
      }
      
      if (publish) {
        // Redirect to the published article
        router.push(`/article/${data.article.slug}`);
      } else {
        // Show success message
        alert('Draft saved successfully!');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save article. Please try again.');
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  };

  const generateExcerpt = (blocks: Block[]): string => {
    // Concatenate text from the first few text blocks for the excerpt
    const textBlocks = blocks.filter(block => block.type === 'text');
    const text = textBlocks
      .slice(0, 2)
      .map(block => block.content)
      .join(' ')
      .trim();
    
    return text.length > 160 ? text.substring(0, 157) + '...' : text;
  };

  const uploadFeaturedImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setErrorMessage(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Uploading featured image:', file.name);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      // Read the response data
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Upload error response:', data);
        
        // Format a more user-friendly error
        let errorMsg = data.error || 'Failed to upload image';
        if (data.details) {
          errorMsg += `: ${data.details}`;
        }
        
        if (data.error === 'ImageKit authentication failed') {
          errorMsg = 'The server is having trouble with image uploads. Please try again later or contact support.';
        }
        
        setErrorMessage(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Image uploaded successfully:', data.url);
      setFeaturedImage(data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred during upload';
      if (!errorMessage) {
        setErrorMessage(errorMsg);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const uploadBlockImage = async (id: string, file: File) => {
    setIsUploading(true);
    setErrorMessage(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Uploading block image:', file.name);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      // Read the response data
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Upload error response:', data);
        
        // Format a more user-friendly error
        let errorMsg = data.error || 'Failed to upload image';
        if (data.details) {
          errorMsg += `: ${data.details}`;
        }
        
        if (data.error === 'ImageKit authentication failed') {
          errorMsg = 'The server is having trouble with image uploads. Please try again later or contact support.';
        }
        
        setErrorMessage(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Image uploaded successfully:', data.url);
      handleBlockChange(id, {
        src: data.url,
        alt: file.name
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred during upload';
      if (!errorMessage) {
        setErrorMessage(errorMsg);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextSelect = (blockId: string, e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setShowFormatToolbar(false);
      return;
    }
    
    const range = selection.getRangeAt(0);
    const text = selection.toString();
    
    if (text.length === 0) {
      setShowFormatToolbar(false);
      return;
    }
    
    const rect = range.getBoundingClientRect();
    setFormatToolbarPosition({
      top: rect.top + window.scrollY - 50,
      left: rect.left + window.scrollX + (rect.width / 2) - 50
    });
    
    setSelection({
      blockId,
      start: range.startOffset,
      end: range.endOffset,
      text
    });
    
    setShowFormatToolbar(true);
  };

  const applyFormat = (format: 'bold' | 'italic' | 'link') => {
    if (!selection) return;
    
    const block = blocks.find(b => b.id === selection.blockId);
    if (!block || block.type !== 'text') return;
    
    let formattedContent = block.content;
    
    switch (format) {
      case 'bold':
        formattedContent = 
          formattedContent.substring(0, selection.start) + 
          `<strong>${selection.text}</strong>` + 
          formattedContent.substring(selection.end);
        break;
      case 'italic':
        formattedContent = 
          formattedContent.substring(0, selection.start) + 
          `<em>${selection.text}</em>` + 
          formattedContent.substring(selection.end);
        break;
      case 'link':
        const url = prompt('Enter URL:', 'https://');
        if (url) {
          formattedContent = 
            formattedContent.substring(0, selection.start) + 
            `<a href="${url}" target="_blank" rel="noopener noreferrer">${selection.text}</a>` + 
            formattedContent.substring(selection.end);
        }
        break;
    }
    
    handleBlockChange(selection.blockId, formattedContent);
    setShowFormatToolbar(false);
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader">Loading...</div>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    router.push('/auth/signin?callbackUrl=/editor');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Please sign in to access the editor</div>
      </div>
    );
  }

  return (
    <div className="editor-container max-w-4xl mx-auto px-4 py-6">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Article Editor</h1>
        <div className="space-x-2">
          <button
            onClick={() => handleSaveData(false)}
            // disabled={isSaving || !title.trim()}
            className={`px-4 py-2 border border-gray-300 rounded-md ${
              isSaving || !title.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => setIsPublishing(true)}
            // disabled={isSaving || !title.trim()}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md ${
              isSaving || !title.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
            }`}
          >
            Publish
          </button>
        </div>
      </div>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p>{errorMessage}</p>
        </div>
      )}
      
      <div className="editor-content">
        <textarea
          placeholder="Title"
          value={title}
          onChange={handleTitleChange}
          className="w-full text-4xl font-bold mb-4 p-2 border-none resize-none overflow-hidden focus:outline-none focus:ring-0"
          rows={1}
        />
        
        <div className="featured-image-section mb-6">
          {featuredImage ? (
            <div className="relative h-60 w-full mb-2 group">
              <ImageWithFallback 
                src={featuredImage}
                alt="Featured image"
                fill
                priority
                unoptimized={featuredImage.includes('placehold.co')}
                className="object-contain rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => setFeaturedImage('')}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Remove Image
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 p-8 text-center rounded-lg mb-4">
              <div className="flex flex-col space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Add a featured image (optional)</h3>
                  <div className="flex justify-center space-x-4">
                    <label htmlFor="featured-image" className="cursor-pointer">
                      <button 
                        type="button"
                        disabled={isUploading}
                        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                      >
                        {isUploading ? 'Uploading...' : 'Upload Image'}
                      </button>
                      <input
                        id="featured-image"
                        type="file"
                        accept="image/*"
                        onChange={uploadFeaturedImage}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                    <span className="text-gray-500">or</span>
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('Enter image URL:', 'https://');
                        if (url && url.trim()) {
                          setFeaturedImage(url.trim());
                        }
                      }}
                      className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Enter URL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="excerpt-section mb-6">
          <label className="block mb-2 font-medium">Excerpt (optional)</label>
          <textarea
            placeholder="Write a brief excerpt for your article..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={3}
            maxLength={160}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {excerpt.length}/160 characters
          </div>
        </div>
        
        <div className="mb-6">
          <div className="block-container space-y-4">
            {blocks.map((block) => (
              <div 
                key={block.id} 
                className={`block-wrapper p-2 rounded transition-all ${activeBlockId === block.id ? 'bg-gray-50 ring-1 ring-gray-200' : ''}`}
                onClick={() => handleBlockClick(block.id)}
              >
                {block.type === 'text' && (
                  <div
                    ref={(el) => {
                      blockRefs.current[block.id] = el;
                    }}
                    contentEditable
                    suppressContentEditableWarning
                    className="text-block min-h-[1.5em] focus:outline-none"
                    onInput={(e) => handleBlockChange(block.id, e.currentTarget.innerHTML)}
                    onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
                    onMouseUp={(e) => handleTextSelect(block.id, e)}
                    dangerouslySetInnerHTML={{ __html: block.content }}
                  />
                )}
                
                {block.type === 'image' && (
                  <div className="image-block">
                    {block.content.src ? (
                      <div className="relative">
                        <ImageWithFallback
                          src={block.content.src}
                          alt={block.content.alt || ''}
                          width={720}
                          height={400}
                          className="max-w-full rounded-lg"
                          unoptimized={block.content.src.includes('placehold.co')}
                        />
                        <input
                          type="text"
                          placeholder="Image caption (optional)"
                          value={block.content.alt || ''}
                          onChange={(e) => handleBlockChange(block.id, { ...block.content, alt: e.target.value })}
                          className="w-full p-2 mt-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 p-8 text-center rounded-lg">
                        <div className="flex flex-col space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">Add an image</h3>
                            <div className="flex justify-center space-x-4">
                              <label htmlFor={`image-upload-${block.id}`} className="cursor-pointer">
                                <button 
                                  type="button"
                                  disabled={isUploading}
                                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                  {isUploading ? 'Uploading...' : 'Upload Image'}
                                </button>
                                <input
                                  id={`image-upload-${block.id}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadBlockImage(block.id, file);
                                  }}
                                  className="hidden"
                                  disabled={isUploading}
                                />
                              </label>
                              <span className="text-gray-500">or</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const url = prompt('Enter image URL:', 'https://');
                                  if (url && url.trim()) {
                                    handleBlockChange(block.id, { 
                                      src: url.trim(), 
                                      alt: ''
                                    });
                                  }
                                }}
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                              >
                                Enter URL
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {block.type === 'video' && (
                  <div className="video-block">
                    <input
                      type="text"
                      placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                      value={block.content.url || ''}
                      onChange={(e) => handleBlockChange(block.id, { url: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    {block.content.url && (
                      <div className="mt-2">
                        <iframe
                          src={block.content.url}
                          className="w-full aspect-video rounded-lg"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {block.type === 'code' && (
                  <div className="code-block">
                    <textarea
                      placeholder="Enter code..."
                      value={block.content}
                      onChange={(e) => handleBlockChange(block.id, e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded font-mono bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      rows={5}
                    />
                  </div>
                )}
                
                {block.type === 'separator' && (
                  <hr className="my-4 border-t-2 border-gray-200" />
                )}
                
                <div className="block-controls opacity-0 group-hover:opacity-100 mt-1 flex items-center justify-end">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      showBlockMenu(e);
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    +
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBlock(block.id);
                    }}
                    className="p-1 text-gray-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => handleAddBlock('text')}
            className="w-full mt-4 p-2 border border-dashed border-gray-300 rounded-md text-center text-gray-500 hover:bg-gray-50"
          >
            + Add block
          </button>
        </div>
      </div>
      
      {showMenu && (
        <div 
          className="block-menu absolute bg-white shadow-lg rounded-md p-2 w-48 z-10"
          style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
        >
          <div className="text-sm text-gray-500 mb-2 p-2">Add block</div>
          <button 
            onClick={() => handleAddBlock('text')}
            className="block w-full text-left p-2 hover:bg-gray-100 rounded"
          >
            Text
          </button>
          <button 
            onClick={() => handleAddBlock('image')}
            className="block w-full text-left p-2 hover:bg-gray-100 rounded"
          >
            Image
          </button>
          <button 
            onClick={() => handleAddBlock('video')}
            className="block w-full text-left p-2 hover:bg-gray-100 rounded"
          >
            Video
          </button>
          <button 
            onClick={() => handleAddBlock('code')}
            className="block w-full text-left p-2 hover:bg-gray-100 rounded"
          >
            Code
          </button>
          <button 
            onClick={() => handleAddBlock('separator')}
            className="block w-full text-left p-2 hover:bg-gray-100 rounded"
          >
            Separator
          </button>
        </div>
      )}
      
      {showFormatToolbar && selection && (
        <div 
          className="format-toolbar absolute bg-white shadow-lg rounded-md p-1 z-10 flex"
          style={{ top: `${formatToolbarPosition.top}px`, left: `${formatToolbarPosition.left}px` }}
        >
          <button 
            onClick={() => applyFormat('bold')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            B
          </button>
          <button 
            onClick={() => applyFormat('italic')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            I
          </button>
          <button 
            onClick={() => applyFormat('link')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            🔗
          </button>
        </div>
      )}
      
      {isPublishing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Publish Article</h2>
            <p className="mb-6">
              Are you sure you want to publish this article? It will be visible to all users.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsPublishing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveData(true)}
                disabled={isSaving}
                className={`bg-indigo-600 text-white px-4 py-2 rounded-md ${
                  isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                }`}
              >
                {isSaving ? 'Publishing...' : 'Publish Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 