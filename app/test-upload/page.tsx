'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadDetails, setUploadDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setErrorDetails(null);
      setUploadedUrl(null);
      setUploadDetails(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setErrorDetails(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Upload failed');
        setErrorDetails(data.details || null);
        throw new Error(data.error || 'Upload failed');
      }

      setUploadedUrl(data.url);
      setUploadDetails(data);
    } catch (err) {
      console.error('Error during upload:', err);
      if (!error) {
        setError(err instanceof Error ? err.message : 'An error occurred during upload');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Test Image Upload</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <button
              type="submit"
              disabled={uploading || !file}
              className={`w-full py-2 px-4 rounded-md text-white ${
                uploading || !file
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              <p className="font-semibold">{error}</p>
              {errorDetails && <p className="text-sm mt-1">{errorDetails}</p>}
            </div>
          )}

          {file && !uploadedUrl && !error && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">Selected File:</h2>
              <div className="p-3 bg-gray-100 rounded-md">
                <p><span className="font-medium">Name:</span> {file.name}</p>
                <p><span className="font-medium">Type:</span> {file.type}</p>
                <p><span className="font-medium">Size:</span> {(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <Link 
              href="/debug-imagekit" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Debug ImageKit Configuration
            </Link>
          </div>
        </div>
        
        {uploadedUrl && (
          <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-3">Uploaded Image:</h2>
            <div className="relative h-64 w-full mb-4">
              <Image
                src={uploadedUrl}
                alt="Uploaded image"
                fill
                className="object-contain rounded-md"
              />
            </div>
            {uploadDetails?.mock && (
              <div className="p-3 bg-yellow-100 text-yellow-800 rounded-md mb-4">
                <p className="font-semibold">⚠️ Mock Mode Active</p>
                <p className="text-sm">This is a placeholder image. ImageKit integration is in mock mode.</p>
              </div>
            )}
            <p className="mt-2 text-sm text-gray-600 break-all">
              <span className="font-medium">URL:</span> {uploadedUrl}
            </p>
            {uploadDetails && (
              <div className="mt-4">
                <h3 className="font-medium mb-1">Upload Details:</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(uploadDetails, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 