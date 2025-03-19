// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { imagekit } from "@/lib/imagekit";

// Check if mock mode is enabled
const MOCK_MODE = process.env.USE_MOCK_IMAGEKIT === 'true';

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Don't allow guest users to upload
    if (session.user.isGuest) {
      return NextResponse.json(
        { error: "Guest users cannot upload images" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          error: `Invalid file type: ${file.type}`, 
          details: `Allowed types: ${allowedTypes.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds the maximum allowed (5MB)` },
        { status: 400 }
      );
    }

    try {
      // Verify ImageKit credentials are available
      if (!MOCK_MODE && (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT)) {
        console.error("Missing ImageKit credentials", {
          publicKey: !!process.env.IMAGEKIT_PUBLIC_KEY,
          privateKey: !!process.env.IMAGEKIT_PRIVATE_KEY,
          urlEndpoint: !!process.env.IMAGEKIT_URL_ENDPOINT
        });
        return NextResponse.json(
          { 
            error: "Server configuration error - ImageKit credentials missing",
            details: "Please contact the administrator to set up ImageKit properly"
          },
          { status: 500 }
        );
      }

      // Get the file buffer
      const buffer = await file.arrayBuffer();
      
      // Generate a more unique filename to prevent collisions
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
      const uniqueFileName = `${timestamp}-${randomStr}-${fileName}`;
      
      console.log("Uploading image:", uniqueFileName, MOCK_MODE ? "(MOCK MODE)" : "");
      
      // Use mock mode for demonstration if needed
      if (MOCK_MODE) {
        // Return a mock response for testing
        console.log("MOCK MODE: Returning fake image upload response");
        
        // Generate placeholder image URL based on file type
        let mockUrl = "";
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          // JPG files get jpg format
          mockUrl = `https://placehold.co/600x400.jpg?text=${encodeURIComponent(fileName)}`;
        } else if (file.type === 'image/png') {
          // PNG files get png format
          mockUrl = `https://placehold.co/600x400.png?text=${encodeURIComponent(fileName)}`;
        } else {
          // Default to png for others
          mockUrl = `https://placehold.co/600x400.png?text=${encodeURIComponent(fileName)}`;
        }
        
        return NextResponse.json({ 
          url: mockUrl,
          fileId: `mock_${timestamp}`,
          name: uniqueFileName,
          size: file.size,
          type: file.type,
          mock: true
        });
      }
      
      // Actual upload to ImageKit
      const result = await imagekit.upload({
        file: Buffer.from(buffer),
        fileName: uniqueFileName,
        useUniqueFileName: true,
      });
      
      console.log("Upload successful:", result.url);
      
      return NextResponse.json({ 
        url: result.url,
        fileId: result.fileId,
        name: result.name,
        size: result.size,
        type: file.type
      });
    } catch (uploadError: any) {
      console.error("ImageKit upload error:", uploadError);
      
      // Check for authentication errors specifically
      if (uploadError.message && uploadError.message.includes("cannot be authenticated")) {
        return NextResponse.json(
          { 
            error: "ImageKit authentication failed",
            details: "The server's ImageKit credentials are invalid or expired. Please contact the administrator.",
            originalError: uploadError.message,
            help: uploadError.help || "Check your IMAGEKIT_PRIVATE_KEY in the .env file"
          },
          { status: 500 }
        );
      }
      
      // Other ImageKit errors
      const errorMessage = uploadError.message || "Failed to upload image";
      const errorDetails = uploadError.help || uploadError.details || "";
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { 
        error: "Failed to upload image", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
} 