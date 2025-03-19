'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [endpoint, setEndpoint] = useState('/api/test');
  const [method, setMethod] = useState('GET');
  const [body, setBody] = useState('');

  const testEndpoint = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      if (method !== 'GET' && method !== 'HEAD' && body) {
        options.body = body;
      }
      
      const response = await fetch(endpoint, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Debug request error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">API Debug Tool</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Session Info</h2>
        <pre className="bg-gray-800 text-white p-4 rounded overflow-auto">
          {status === 'loading' 
            ? 'Loading session...' 
            : JSON.stringify(session, null, 2)}
        </pre>
      </div>
      
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">API Endpoint</label>
            <input 
              type="text" 
              value={endpoint} 
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Method</label>
            <select 
              value={method} 
              onChange={(e) => setMethod(e.target.value)}
              className="p-2 border border-gray-300 rounded h-10"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
              <option value="OPTIONS">OPTIONS</option>
            </select>
          </div>
        </div>
        
        {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Request Body (JSON)</label>
            <textarea 
              value={body} 
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded font-mono"
              rows={5}
              placeholder='{"key": "value"}'
            />
          </div>
        )}
        
        <button 
          onClick={testEndpoint}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Response</h3>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Common Endpoints</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <button 
              onClick={() => setEndpoint('/api/test')}
              className="text-indigo-600 hover:underline"
            >
              /api/test
            </button>
            <span className="text-gray-600 ml-2">- Debug endpoint that supports all methods</span>
          </li>
          <li>
            <button 
              onClick={() => setEndpoint('/api/auth/signin')}
              className="text-indigo-600 hover:underline"
            >
              /api/auth/signin
            </button>
            <span className="text-gray-600 ml-2">- NextAuth sign in endpoint</span>
          </li>
          <li>
            <button 
              onClick={() => {
                setEndpoint('/api/auth/register');
                setMethod('POST');
                setBody(JSON.stringify({
                  fullName: "Test User",
                  username: "testuser" + Math.floor(Math.random() * 1000),
                  email: `test${Math.floor(Math.random() * 1000)}@example.com`,
                  password: "password123"
                }, null, 2));
              }}
              className="text-indigo-600 hover:underline"
            >
              /api/auth/register
            </button>
            <span className="text-gray-600 ml-2">- User registration endpoint</span>
          </li>
          <li>
            <button 
              onClick={() => setEndpoint('/api/articles')}
              className="text-indigo-600 hover:underline"
            >
              /api/articles
            </button>
            <span className="text-gray-600 ml-2">- Get all articles</span>
          </li>
        </ul>
      </div>
    </div>
  );
} 