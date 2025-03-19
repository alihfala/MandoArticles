'use client';

import React, { useState } from 'react';
import Image from 'next/image';

// Sample blocks for testing
const sampleBlocks = {
  header: {
    id: "header-test",
    data: {
      text: "This is a sample heading",
      level: 2
    },
    type: "header"
  },
  paragraph: {
    id: "paragraph-test",
    data: {
      text: "This is a sample paragraph with some text content. It should render properly in the article view."
    },
    type: "paragraph"
  },
  quote: {
    id: "quote-test",
    data: {
      text: "The best way to predict the future is to create it.",
      caption: "Abraham Lincoln",
      alignment: "left"
    },
    type: "quote"
  },
  image: {
    id: "image-test",
    data: {
      file: {
        url: "https://picsum.photos/800/400"
      },
      caption: "Sample image caption",
      withBorder: false,
      stretched: false,
      withBackground: false
    },
    type: "image"
  },
  list: {
    id: "list-test",
    data: {
      style: "unordered",
      items: [
        "First list item",
        "Second list item",
        "Third list item with more text to see how it wraps"
      ]
    },
    type: "list"
  },
  orderedList: {
    id: "ordered-list-test",
    data: {
      style: "ordered",
      items: [
        "First ordered item",
        "Second ordered item",
        "Third ordered item with more text"
      ]
    },
    type: "list"
  },
  checklist: {
    id: "checklist-test",
    data: {
      items: [
        {
          text: "Completed item",
          checked: true
        },
        {
          text: "Uncompleted item",
          checked: false
        },
        {
          text: "Another completed item",
          checked: true
        }
      ]
    },
    type: "checklist"
  },
  video: {
    id: "video-test",
    data: {
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    type: "video"
  },
  code: {
    id: "code-test",
    content: `function helloWorld() {\n  console.log("Hello, world!");\n}`,
    type: "code"
  },
  separator: {
    id: "separator-test",
    type: "separator"
  }
};

// Define the isValidObject function (no need to import from util)
const isValidObject = (value: any): boolean => {
  return value !== null && typeof value === 'object';
};

// Simplified version of the renderBlock function from article page
const renderBlock = (block: any, index: number) => {
  if (!block || typeof block !== 'object') {
    return <div key={index} className="text-red-500">Invalid block data</div>;
  }

  switch (block.type) {
    case 'text':
      return (
        <div key={index} className="mb-4">
          <p>{isValidObject(block.content) ? JSON.stringify(block.content) : String(block.content || '')}</p>
        </div>
      );
      
    case 'paragraph':
      return (
        <div key={index} className="mb-4">
          <p>{isValidObject(block.data) && block.data.text ? block.data.text : 
             (isValidObject(block.content) ? JSON.stringify(block.content) : String(block.content || ''))}</p>
        </div>
      );
      
    case 'header':
      const level = isValidObject(block.data) && block.data.level ? block.data.level : 2;
      const text = isValidObject(block.data) && block.data.text ? block.data.text : '';
      
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
      const quoteText = isValidObject(block.data) && block.data.text ? block.data.text : '';
      const caption = isValidObject(block.data) && block.data.caption ? block.data.caption : '';
      const alignment = isValidObject(block.data) && block.data.alignment ? block.data.alignment : 'left';
      
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
      if (!isValidObject(block.content) || !block.content.src) {
        // Check if data has the image info in EditorJS format
        if (isValidObject(block.data) && block.data.file && block.data.file.url) {
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
          <code>{isValidObject(block.content) ? JSON.stringify(block.content, null, 2) : String(block.content || '')}</code>
        </pre>
      );
      
    case 'video':
      const videoUrl = isValidObject(block.data) && block.data.url ? block.data.url :
                       (isValidObject(block.content) && block.content.url ? block.content.url : '');
      
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
      const listItems = isValidObject(block.data) && Array.isArray(block.data.items) 
        ? block.data.items 
        : [];
      const listStyle = isValidObject(block.data) && block.data.style === 'ordered' 
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
      const checklistItems = isValidObject(block.data) && Array.isArray(block.data.items) 
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

export default function TestBlocksPage() {
  const [selectedBlocks, setSelectedBlocks] = useState<any[]>([]);
  const [customBlock, setCustomBlock] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Function to add a sample block to the preview
  const addSampleBlock = (blockType: keyof typeof sampleBlocks) => {
    setSelectedBlocks(prev => [...prev, sampleBlocks[blockType]]);
  };

  // Function to add a custom block from JSON
  const addCustomBlock = () => {
    try {
      const blockData = JSON.parse(customBlock);
      setSelectedBlocks(prev => [...prev, blockData]);
      setCustomBlock('');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Invalid JSON. Please check your format.');
    }
  };

  // Function to clear all blocks
  const clearBlocks = () => {
    setSelectedBlocks([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Block Renderer Test Page</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Add Sample Blocks</h2>
            
            <div className="space-y-2">
              {Object.keys(sampleBlocks).map((blockType) => (
                <button
                  key={blockType}
                  onClick={() => addSampleBlock(blockType as keyof typeof sampleBlocks)}
                  className="w-full py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded transition-colors text-left"
                >
                  {blockType}
                </button>
              ))}
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Add Custom Block</h2>
              <textarea
                value={customBlock}
                onChange={(e) => setCustomBlock(e.target.value)}
                placeholder='{
  "id": "custom-block",
  "data": {
    "text": "Your content here"
  },
  "type": "paragraph"
}'
                className="w-full h-48 p-4 border rounded-md text-sm font-mono"
              ></textarea>
              
              {errorMessage && (
                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
              )}
              
              <button
                onClick={addCustomBlock}
                className="mt-2 py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Add Custom Block
              </button>
            </div>
            
            <div className="mt-6">
              <button
                onClick={clearBlocks}
                className="py-2 px-4 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
              >
                Clear All Blocks
              </button>
            </div>
          </div>
        </div>
        
        {/* Preview */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Block Preview</h2>
            
            {selectedBlocks.length === 0 ? (
              <p className="text-gray-500 italic">Add blocks to see them rendered here.</p>
            ) : (
              <div className="prose max-w-none">
                {selectedBlocks.map((block, index) => renderBlock(block, index))}
              </div>
            )}
          </div>
          
          {selectedBlocks.length > 0 && (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Block JSON Data</h2>
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify({
                  time: new Date().getTime(),
                  blocks: selectedBlocks,
                  version: "2.26.5"
                }, null, 2)}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify({
                    time: new Date().getTime(),
                    blocks: selectedBlocks,
                    version: "2.26.5"
                  }, null, 2));
                }}
                className="mt-2 py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 