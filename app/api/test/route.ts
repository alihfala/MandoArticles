import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Log all request details
  console.log('GET request received at /api/test');
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  
  return NextResponse.json({ 
    message: 'GET request successful',
    method: 'GET',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  console.log('POST request received at /api/test');
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    const body = await request.json();
    console.log('Body:', body);
  } catch (error) {
    console.log('No JSON body or error parsing body');
  }

  return NextResponse.json({ 
    message: 'POST request successful',
    method: 'POST',
    timestamp: new Date().toISOString()
  });
}

export async function PUT(request: Request) {
  console.log('PUT request received at /api/test');
  return NextResponse.json({ 
    message: 'PUT request successful',
    method: 'PUT',
    timestamp: new Date().toISOString()
  });
}

export async function DELETE(request: Request) {
  console.log('DELETE request received at /api/test');
  return NextResponse.json({ 
    message: 'DELETE request successful',
    method: 'DELETE',
    timestamp: new Date().toISOString()
  });
}

// Handle all other methods with 405 Method Not Allowed
export async function OPTIONS(request: Request) {
  console.log('OPTIONS request received at /api/test');
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, POST, PUT, DELETE, OPTIONS',
    },
  });
} 