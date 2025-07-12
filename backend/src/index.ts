import express from 'express';
import {Request , Response} from 'express'
import userRoutes from './routes/user.route';
import * as dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.post('/', (_req : Request , res : Response)=>{
  res.json("WOW")
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
