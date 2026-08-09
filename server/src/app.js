import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'road-rescue-hub-api',
  });
});

app.use('/api/auth', authRoutes);

app.use((error, _request, response, _next) => {
  console.error(error);

  if (error.name === 'ValidationError') {
    return response.status(400).json({ message: error.message });
  }

  return response.status(500).json({ message: 'An unexpected server error occurred.' });
});

export default app;
