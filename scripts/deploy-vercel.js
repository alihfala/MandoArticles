#!/usr/bin/env node
// scripts/deploy-vercel.js
const { execSync } = require('child_process');
const readline = require('readline');
const https = require('https');
const { verifyDatabaseConnection } = require('./verify-db-connection');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to get public IP
async function getPublicIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org', (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', err => reject(err));
  });
}

// Helper function to prompt user
function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer));
  });
}

// Main function
async function main() {
  console.log('🚀 Preparing Vercel deployment for Mando Articles...');
  
  try {
    // Step 1: Get the current DATABASE_URL
    const currentDbUrl = process.env.DATABASE_URL;
    if (!currentDbUrl) {
      console.error('❌ DATABASE_URL is not set in your .env.local file');
      console.log('Please set it first and try again');
      process.exit(1);
    }
    
    // Parse the current URL
    const dbUrlObj = new URL(currentDbUrl);
    const currentHost = dbUrlObj.hostname;
    const currentPort = dbUrlObj.port;
    const currentUser = dbUrlObj.username;
    const currentPassword = dbUrlObj.password;
    const currentDatabase = dbUrlObj.pathname.substring(1);
    
    console.log(`\nCurrent database configuration:`);
    console.log(`- Host: ${currentHost}`);
    console.log(`- Port: ${currentPort}`);
    console.log(`- Database: ${currentDatabase}`);
    console.log(`- User: ${currentUser}`);
    
    // Step 2: Check if the host is localhost or a private IP
    const privateIpPrefixes = ['127.', '10.', '192.168.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21.', '172.22.', '172.23.', '172.24.', '172.25.', '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.'];
    const isLocalOrPrivate = currentHost === 'localhost' || privateIpPrefixes.some(prefix => currentHost.startsWith(prefix));
    
    if (isLocalOrPrivate) {
      console.log('\n⚠️ WARNING: Your database host appears to be localhost or a private IP address.');
      console.log('This will NOT work on Vercel. You need a publicly accessible database.');
      
      // Try to get the public IP
      try {
        const publicIp = await getPublicIP();
        console.log(`\n🌐 Your current public IP appears to be: ${publicIp}`);
        console.log('If your database is on this machine, you can use this IP, but you must:');
        console.log('1. Ensure PostgreSQL is configured to accept remote connections');
        console.log('2. Your firewall allows connections to port 5433');
        console.log('3. If behind a router, port forwarding is set up correctly');
        
        const usePublicIp = await prompt('\nWould you like to use this public IP for Vercel deployment? (y/n): ');
        
        if (usePublicIp.toLowerCase() === 'y') {
          // Create new URL with public IP
          dbUrlObj.hostname = publicIp;
          const newDbUrl = dbUrlObj.toString();
          console.log(`\n✅ Your new DATABASE_URL will be:`);
          console.log(newDbUrl.replace(/:([^:@]+)@/, ':******@')); // Mask password for display
          
          // Test the connection with the new URL
          console.log('\n🔍 Testing connection to the database with this new URL...');
          
          // Set the environment variable temporarily for testing
          process.env.DATABASE_URL = newDbUrl;
          
          const connectionSuccess = await verifyDatabaseConnection();
          
          if (!connectionSuccess) {
            console.log('\n❌ Could not connect to the database with the public IP.');
            console.log('Please check your PostgreSQL configuration and firewall settings.');
            console.log('See VERCEL_DB_SETUP.md for detailed instructions.');
            
            const proceed = await prompt('\nDo you want to proceed with deployment anyway? (y/n): ');
            if (proceed.toLowerCase() !== 'y') {
              console.log('Deployment cancelled.');
              process.exit(1);
            }
          } else {
            console.log('\n✅ Successfully connected to the database with the public IP!');
          }
          
          // Ask to update Vercel environment variables
          const updateVercel = await prompt('\nDo you want to update the Vercel environment variables now? (y/n): ');
          if (updateVercel.toLowerCase() === 'y') {
            try {
              console.log('\n🔑 Setting up Vercel environment variables...');
              execSync(`npx vercel env add DATABASE_URL production`, { stdio: 'inherit' });
              execSync(`npx vercel env add DIRECT_URL production`, { stdio: 'inherit' });
              console.log('\n✅ Environment variables set up successfully!');
            } catch (error) {
              console.error('\n❌ Failed to set Vercel environment variables:', error.message);
              console.log('Please set them manually in the Vercel dashboard.');
            }
          }
        }
      } catch (error) {
        console.error('❌ Could not determine your public IP:', error.message);
      }
    }
    
    // Step 3: Ask to proceed with deployment
    const deploy = await prompt('\nDo you want to deploy to Vercel now? (y/n): ');
    if (deploy.toLowerCase() === 'y') {
      try {
        console.log('\n🚀 Deploying to Vercel...');
        execSync('npx vercel --prod', { stdio: 'inherit' });
        console.log('\n✅ Deployment completed!');
      } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
      }
    } else {
      console.log('\nDeployment cancelled. You can deploy manually later with:');
      console.log('  npx vercel --prod');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Run the script
main(); 