import express from 'express';
import "dotenv/config";

import authRoutes from './routes/auth.route.js';
import { connectDB } from './lib/db.config.js';

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use('/api/auth', authRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});