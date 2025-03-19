// scripts/test-imagekit.js
require('dotenv').config();
const ImageKit = require("imagekit");

// Load environment variables for ImageKit
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

// Print the loaded config for debugging
console.log("ImageKit configuration:");
console.log("Public Key:", IMAGEKIT_PUBLIC_KEY ? "✓ Found" : "✗ Missing");
console.log("Private Key:", IMAGEKIT_PRIVATE_KEY ? "✓ Found" : "✗ Missing");
console.log("URL Endpoint:", IMAGEKIT_URL_ENDPOINT ? "✓ Found" : "✗ Missing");

// Configure ImageKit
const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT
});

// Test authentication parameters
async function testAuthentication() {
  console.log("\nTesting authentication parameters...");
  try {
    const authParams = await imagekit.getAuthenticationParameters();
    console.log("Authentication parameters:", authParams);
    console.log("✓ Authentication parameters generated successfully");
    return true;
  } catch (err) {
    console.error("✗ Error getting authentication parameters:", err);
    return false;
  }
}

// Test listing files
async function testListFiles() {
  console.log("\nTesting file listing...");
  try {
    const files = await imagekit.listFiles({
      limit: 5
    });
    console.log(`✓ Successfully listed ${files.length} files`);
    if (files.length > 0) {
      console.log("Sample file:", {
        name: files[0].name,
        url: files[0].url,
        fileId: files[0].fileId
      });
    }
    return true;
  } catch (err) {
    console.error("✗ Error listing files:", err);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log("=".repeat(50));
  console.log("IMAGEKIT CONNECTION TEST");
  console.log("=".repeat(50));
  
  let authSuccess = await testAuthentication();
  let listSuccess = await testListFiles();
  
  console.log("\n=".repeat(50));
  console.log("TEST RESULTS:");
  console.log("Authentication Test:", authSuccess ? "✓ PASSED" : "✗ FAILED");
  console.log("File Listing Test:", listSuccess ? "✓ PASSED" : "✗ FAILED");
  console.log("=".repeat(50));
  
  if (!authSuccess || !listSuccess) {
    console.log("\nPossible solutions:");
    console.log("1. Verify your ImageKit credentials in the .env file");
    console.log("2. Make sure your ImageKit account is active");
    console.log("3. Check if your IP is allowed in ImageKit security settings");
    console.log("4. If using a free account, check if you have hit API limits");
    process.exit(1);
  }
}

// Execute tests
runTests(); 