// Import environment configuration first
import './test-env';
import { db } from '../lib/db';
import http from 'http';
import app from '../server'; // Import your Express app

let server: http.Server;

// Global setup before all tests
beforeAll(async () => {
  // Any global setup you might need
  // Verify we can connect to the database
  try {
    await db.$connect();

    // Start the server for integration tests
    return new Promise<void>((resolve, reject) => {
      server = app.listen(0, () => { // 0 means pick a random available port
        console.log('Test server started');
        resolve();
      }).on('error', (err) => {
        console.error('Server start error:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    throw error; // Let Jest handle the error instead of calling process.exit
  }
});

// Cleanup after each test
afterEach(async () => {
  // Clean database tables between tests - respect foreign key constraints
  try {
    // First delete photos for test users
    await db.photo.deleteMany({
      where: {
        user: {
          email: {
            contains: 'test'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error during test cleanup:', error);
  }
});

// Global teardown after all tests
afterAll(async () => {
  // Close the server
  await new Promise<void>((resolve, reject) => {
    if (server) {
      server.close((err) => {
        if (err) {
          console.error('Error closing server:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });

  // Close database connection
  await db.$disconnect();
});