// index.js
const { Client } = require('pg');

exports.handler = async (event) => {
  // Configure database connection
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: true
    }
  });

  try {
    // Connect to the database
    await client.connect();

    // Delete expired tokens
    const deleteQuery = `
      DELETE FROM "reset_password_tokens"
      WHERE "expiresAt" < NOW()
      RETURNING *
    `;

    const result = await client.query(deleteQuery);

    // Log and return results
    console.log(`Deleted ${result.rowCount} expired tokens`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully deleted ${result.rowCount} expired tokens`,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error in token cleanup job:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error executing token cleanup job',
        error: error.message
      })
    };
  } finally {
    // Always close the database connection
    await client.end();
  }
};