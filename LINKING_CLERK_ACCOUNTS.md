# Linking Clerk Accounts Between Environments

This guide explains how to link your development and production Clerk accounts to use the same database user record in the FlockNerd app.

## How It Works

We've implemented a dual Clerk ID system that allows a single database user to be associated with two different Clerk accounts - one from your development environment and one from production.

- `clerkId`: Primary Clerk ID (typically your production account)
- `secondaryClerkId`: Secondary Clerk ID (typically your development account)

The app will check both IDs when authenticating, so you can seamlessly switch between environments.

## Methods to Link Accounts

You have three ways to link your accounts:

### Method 1: Using the Link Accounts API Endpoint

When logged in with one Clerk account, make a POST request to link another account:

```bash
# When logged in with your production account, link a development account:
curl -X POST https://your-app-url/api/link-accounts \
  -H "Content-Type: application/json" \
  -d '{"secondaryClerkId": "clerk_dev_account_id"}'

# Or you can link by email:
curl -X POST https://your-app-url/api/link-accounts \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com"}'
```

### Method 2: Using the Utility Script

Run the script with your user's email and the Clerk ID you want to link:

```bash
# Link as secondary Clerk ID (recommended for development accounts)
bun run src/scripts/link-clerk-accounts.ts your@email.com clerk_dev_account_id

# Link as primary Clerk ID (if you prefer to switch them)
bun run src/scripts/link-clerk-accounts.ts your@email.com clerk_prod_account_id --primary
```

### Method 3: Through Clerk Webhooks (Automatic)

The app will automatically try to link accounts when:

1. A new Clerk user is created with an email that matches an existing database user
2. If the existing user has no secondaryClerkId, the new Clerk ID will be set as secondary

## Testing the Integration

To verify that the linking works correctly:

1. Sign in with your production Clerk account
2. Check that you can access your existing data
3. Sign out and sign in with your development Clerk account
4. Verify that you can still access the same data

## Troubleshooting

If you encounter issues:

1. Check that the secondaryClerkId column was added to the database:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'flocknerd_User' AND column_name = 'secondaryClerkId';
   ```

2. Verify that your Clerk IDs are correctly stored:
   ```sql
   SELECT id, name, email, "clerkId", "secondaryClerkId" 
   FROM "flocknerd_User" 
   WHERE email = 'your@email.com';
   ```

3. Check the server logs when signing in for any authentication errors

## Important Notes

- A user can have at most two Clerk IDs (primary and secondary)
- If you need to add more environments, you'll need to extend this approach
- Clerk webhooks need to be configured for both environments to keep user data in sync