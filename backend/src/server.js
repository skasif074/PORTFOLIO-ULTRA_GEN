import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { testConnection } from './config/supabase.js';

// Ensure PORT is a valid number — fall back to 5000 if env var is missing or malformed
const rawPort = process.env.PORT;
const PORT = rawPort && !isNaN(Number(rawPort)) ? Number(rawPort) : 5000;

if (rawPort && isNaN(Number(rawPort))) {
  console.warn(`  Invalid PORT value in .env ("${rawPort}") — falling back to ${PORT}`);
}

const startServer = async () => {
  // Test Supabase connection
  const connected = await testConnection();

  if (!connected && process.env.NODE_ENV === 'production') {
    console.error(' Cannot start server: Supabase connection failed');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log('');
    console.log('PORTFOLIO API SERVER STARTED');
    console.log(`   Port    : ${PORT}`);
    console.log(`   Mode    : ${process.env.NODE_ENV || 'development'}`);
    console.log('   Docs    : /health');
    console.log('');
  });
};

startServer();


process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});