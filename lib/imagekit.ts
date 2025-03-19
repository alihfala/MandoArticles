// lib/imagekit.ts
import ImageKit from "imagekit";

// Add better error handling and diagnostics
console.log("ImageKit initialization - checking environment variables:");
console.log("IMAGEKIT_PUBLIC_KEY:", process.env.IMAGEKIT_PUBLIC_KEY ? "✓ Found" : "✗ Missing");
console.log("IMAGEKIT_PRIVATE_KEY:", process.env.IMAGEKIT_PRIVATE_KEY ? "✓ Found" : "✗ Missing");
console.log("IMAGEKIT_URL_ENDPOINT:", process.env.IMAGEKIT_URL_ENDPOINT ? "✓ Found" : "✗ Missing");

// Make sure keys aren't empty strings
const publicKey = process.env.IMAGEKIT_PUBLIC_KEY?.trim();
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim();
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT?.trim();

if (!publicKey || !privateKey || !urlEndpoint) {
  console.error("ERROR: ImageKit credentials missing or empty!");
}

export const imagekit = new ImageKit({
  publicKey: publicKey || "",
  privateKey: privateKey || "",
  urlEndpoint: urlEndpoint || ""
});