import express from 'express';
import cors from 'cors';
import packRoutes from './routes/packRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Official API v1 routes
app.use('/api/v1/packs', packRoutes);
app.use('/api/v1/sessions', sessionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

export default app;
