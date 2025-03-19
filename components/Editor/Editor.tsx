// components/Editor.tsx
'use client';
import { useState } from 'react';

type Block = {
  id: string;
  type: 'text' | 'image' | 'code';
  content: string;
};

export default function Editor() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedText, setSelectedText] = useState<string>('');

  const addBlock = (type: Block['type']) => {
    setBlocks([...blocks, {
      id: crypto.randomUUID(),
      type,
      content: ''
    }]);
  };

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection) setSelectedText(selection.toString());
  };

  return (
    <div className="max-w-4xl mx-auto my-8">
      <div 
        contentEditable
        className="min-h-[500px] p-4 border rounded"
        onSelect={handleTextSelect}
      >
        {blocks.map((block) => (
          <div key={block.id} className="mb-4">
            {block.type === 'text' && (
              <div className="prose" contentEditable>
                {block.content}
              </div>
            )}
            {/* Add other block types */}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => addBlock('text')}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          + Text
        </button>
        <button 
          onClick={() => addBlock('image')}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          + Image
        </button>
      </div>

      {selectedText && (
        <div className="absolute bg-white shadow-lg p-2 rounded border">
          <button className="mr-2 font-bold">B</button>
          <button className="mr-2 italic">I</button>
        </div>
      )}
    </div>
  );
}