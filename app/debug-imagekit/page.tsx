'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function DebugImageKit() {
  const [imagekitInfo, setImagekitInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchImageKitInfo() {
      try {
        const response = await fetch('/api/debug-imagekit');
        const data = await response.json();
        setImagekitInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ImageKit info');
      } finally {
        setLoading(false);
      }
    }

    fetchImageKitInfo();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleTestUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">ImageKit Configuration Debug</h1>

      {loading ? (
        <div className="p-4 bg-gray-100 rounded-lg">Loading configuration...</div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg">{error}</div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Configuration Status</h2>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Public Key:</span>
                <span className={imagekitInfo.config.publicKey === 'Set' ? 'text-green-600' : 'text-red-600'}>
                  {imagekitInfo.config.publicKey === 'Set' ? '✓ Available' : '✗ Missing'}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Private Key:</span>
                <span className={imagekitInfo.config.privateKey === 'Set' ? 'text-green-600' : 'text-red-600'}>
                  {imagekitInfo.config.privateKey === 'Set' ? '✓ Available' : '✗ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">URL Endpoint:</span>
                <span className={imagekitInfo.config.urlEndpoint ? 'text-green-600' : 'text-red-600'}>
                  {imagekitInfo.config.urlEndpoint || '✗ Missing'}
                </span>
              </div>
            </div>
            
            {imagekitInfo.error ? (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                <p className="font-semibold">Error:</p>
                <p>{imagekitInfo.error}</p>
                {imagekitInfo.message && <p className="mt-1 text-sm">{imagekitInfo.message}</p>}
              </div>
            ) : (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                <p>{imagekitInfo.message || "Configuration loaded"}</p>
              </div>
            )}

            {imagekitInfo.authParams && (
              <div className="mt-4">
                <p className="font-semibold">Authentication Parameters:</p>
                <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto text-xs">
                  {JSON.stringify(imagekitInfo.authParams, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Test Upload</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={uploading}
                />
              </div>

              <button
                onClick={handleTestUpload}
                disabled={!file || uploading}
                className={`px-4 py-2 rounded-md text-white ${
                  !file || uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {uploading ? 'Uploading...' : 'Test Upload'}
              </button>

              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md">
                  <p className="font-semibold">Upload Error:</p>
                  <p>{error}</p>
                </div>
              )}

              {uploadResult && (
                <div className="space-y-3">
                  <div className="p-3 bg-green-100 text-green-700 rounded-md">
                    <p>Upload successful!</p>
                  </div>
                  
                  <div className="relative h-60 w-full">
                    <Image
                      src={uploadResult.url}
                      alt="Uploaded image"
                      fill
                      className="object-contain rounded-md"
                    />
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-semibold">Image Details:</p>
                    <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto text-xs">
                      {JSON.stringify(uploadResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Verify your <code className="bg-gray-100 px-1 rounded">IMAGEKIT_PUBLIC_KEY</code>, <code className="bg-gray-100 px-1 rounded">IMAGEKIT_PRIVATE_KEY</code>, and <code className="bg-gray-100 px-1 rounded">IMAGEKIT_URL_ENDPOINT</code> in your .env file.</li>
              <li>Make sure your ImageKit account is active and not suspended.</li>
              <li>Check if your account has the necessary permissions for file uploads.</li>
              <li>Try regenerating your API keys in the ImageKit dashboard.</li>
              <li>If using a free account, check if you've hit usage limits.</li>
              <li>Check if your network/IP is allowed by ImageKit's security settings.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
} 