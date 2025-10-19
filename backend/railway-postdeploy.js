#!/usr/bin/env node

/**
 * Railway Post-Deploy Script
 * Runs database migrations and seeds automatically after deployment
 */

const { execSync } = require('child_process');

console.log('=== Railway Post-Deploy Script ===\n');

// Check if production environment
if (process.env.NODE_ENV !== 'production') {
  console.log('Not in production environment, skipping migrations...');
  process.exit(0);
}

// Check if MySQL is ready
const mysqlReady = process.env.MYSQLHOST && process.env.MYSQLDATABASE;
if (!mysqlReady) {
  console.log('MySQL not ready yet, skipping migrations...');
  process.exit(0);
}

console.log('MySQL Connection:');
console.log(`- Host: ${process.env.MYSQLHOST}`);
console.log(`- Database: ${process.env.MYSQLDATABASE}`);
console.log(`- User: ${process.env.MYSQLUSER}\n`);

try {
  // Run migrations
  console.log('Running database migrations...');
  execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
  console.log('✅ Migrations completed successfully\n');

  // Run seeders (only if not already seeded)
  console.log('Running database seeders...');
  execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
  console.log('✅ Seeders completed successfully\n');

  console.log('=== Post-Deploy Script Completed ===\n');
  process.exit(0);
} catch (error) {
  console.error('❌ Error during post-deploy script:', error.message);
  
  // Don't fail deployment if migrations/seeds fail
  // This allows manual fixing via Railway console
  console.log('Continuing with deployment...\n');
  process.exit(0);
}
