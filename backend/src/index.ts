import express from 'express';
import userRoutes from './routes/user.route';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});