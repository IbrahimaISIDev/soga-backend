import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Routes
import authRoutes from './routes/auth';
import formationRoutes from './routes/formations';
import articleRoutes from './routes/articles';
import evenementRoutes from './routes/evenements';
import partenaireRoutes from './routes/partenaires';
import temoignageRoutes from './routes/temoignages';
import equipeRoutes from './routes/equipe';
import expertRoutes from './routes/experts';
import publicationRoutes from './routes/publications';
import thematiqueRoutes from './routes/thematiques';
import institutionRoutes from './routes/institution';
import uploadRoutes from './routes/upload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, '..', UPLOAD_DIR)));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/evenements', evenementRoutes);
app.use('/api/partenaires', partenaireRoutes);
app.use('/api/temoignages', temoignageRoutes);
app.use('/api/equipe', equipeRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/thematiques', thematiqueRoutes);
app.use('/api/institution', institutionRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
