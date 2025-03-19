# Setting Up Your Database Connection for Vercel Deployment

This guide will help you correctly set up your PostgreSQL database connection for Vercel deployment of your Mando Articles application.

## Prerequisites

1. A PostgreSQL database server running and accessible from the internet
2. The public IP address of your database server
3. Proper database user permissions

## Step 1: Configure PostgreSQL for Remote Access

You need to make your database accessible from Vercel's servers. Here are the key steps:

### A. Edit PostgreSQL Configuration Files

1. Locate your `postgresql.conf` file and ensure these settings:
   ```
   listen_addresses = '*'    # Listen on all interfaces
   port = 5433               # Your configured port
   ```

2. Edit your `pg_hba.conf` file to allow remote connections:
   ```
   # Allow connections from everywhere with password authentication
   host    all             all             0.0.0.0/0               md5
   host    all             all             ::/0                    md5
   ```

3. Restart PostgreSQL to apply changes:
   ```bash
   sudo systemctl restart postgresql
   # or
   sudo service postgresql restart
   ```

### B. Configure Your Firewall

Make sure your database port (5433) is open to the internet:

```bash
# If using UFW (Ubuntu)
sudo ufw allow 5433/tcp

# If using iptables
sudo iptables -A INPUT -p tcp --dport 5433 -j ACCEPT
sudo iptables-save
```

If your server is behind a router, forward port 5433 to your database server.

## Step 2: Verify Your Public IP

1. Get your server's public IP address:
   ```bash
   curl ifconfig.me
   # or visit https://whatismyip.com
   ```

2. Test connectivity from another machine:
   ```bash
   psql -h YOUR_PUBLIC_IP -p 5433 -U postgres -d mangoArticles
   ```

## Step 3: Configure Vercel Environment Variables

In your Vercel project, add these environment variables:

1. `DATABASE_URL`:
   ```
   postgresql://postgres:P@ssw0rd@YOUR_PUBLIC_IP:5433/mangoArticles?schema=public&pool_timeout=10&connection_limit=5
   ```

2. `DIRECT_URL` (same as DATABASE_URL):
   ```
   postgresql://postgres:P@ssw0rd@YOUR_PUBLIC_IP:5433/mangoArticles?schema=public
   ```

3. `PRISMA_CLIENT_ENGINE_TYPE`:
   ```
   binary
   ```

## Step 4: Grant Proper Database Permissions

Ensure your PostgreSQL user has all necessary permissions:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create user if not exists
CREATE USER postgres WITH PASSWORD 'P@ssw0rd';

-- Make sure the database exists
CREATE DATABASE "mangoArticles";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE "mangoArticles" TO postgres;

-- Connect to the mangoArticles database
\c mangoArticles

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO postgres;
```

## Step 5: Verify Your Connection

Run our verification script to check your connection:

```bash
npm run verify:db
```

If successful, you're ready to deploy!

## Troubleshooting

### Connection Refused or Timed Out
- Check your firewall/router settings
- Verify your IP address is correct
- Ensure PostgreSQL is running and listening on the correct port

### Authentication Failed
- Check the username and password
- Verify the user has proper permissions

### Database Not Found
- Ensure the database "mangoArticles" exists
- Check that the user has access to this database

### Testing From Vercel
If everything seems correct but Vercel still can't connect:
1. Use the `/api/debug-db` endpoint to see connection details
2. Check Vercel logs for specific error messages
3. Consider using a database hosting service like Supabase or Railway instead of a self-hosted solution 