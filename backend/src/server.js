import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { testConnection } from './config/supabase.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Test Supabase connection
  const connected = await testConnection();

  if (!connected && process.env.NODE_ENV === 'production') {
    console.error('❌ Cannot start server: Supabase connection failed');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║   🚀  PORTFOLIO API SERVER STARTED        ║');
    console.log('╠═══════════════════════════════════════════╣');
    console.log(`║   Port    : ${PORT}                            ║`);
    console.log(`║   Mode    : ${process.env.NODE_ENV || 'development'}                  ║`);
    console.log('║   Docs    : /health                       ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log('');
  });
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
