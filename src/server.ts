import express, { Request, Response, NextFunction } from 'express';
import { Server } from 'socket.io'
import { createServer } from 'node:http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PORT, NODE_ENV } from './config';
import routes from './routes';

// Create Express app
const app = express();

// Create HTTP server
const server = createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for testing
    methods: ['GET', 'POST']
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected with ID:', socket.id);
  
  // Log all events for debugging
  socket.onAny((event, ...args) => {
    console.log(`[Socket ${socket.id}] Event: ${event}`, args);
  });
  
  // Echo event for testing
  socket.on('echo', (data) => {
    console.log('Received echo event:', data);
    socket.emit('echo_response', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


// CORS configuration for frontend
const corsOptions = {
  origin: '*', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // CORS with specific options
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Start server
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
  });
}

export default app;