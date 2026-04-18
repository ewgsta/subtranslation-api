import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import { errorHandler } from './middleware/errorHandler.js';
import translationRoutes from './routes/translationRoutes.js';

const app = express();

const corsOptions = {
  origin: config.corsOrigins,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-api-key']
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'translation-api' });
});

app.use('/api', translationRoutes);

app.use(errorHandler);

export function start() {
  if (!config.openRouterApiKey) {
    console.error('OPENROUTER_API_KEY tanımlanmamış');
    process.exit(1);
  }

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`translation-api: http://0.0.0.0:${config.port}`);
  });
}

export default app;
