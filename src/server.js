import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth/authRouter.js'
import taskRouter from './routes/Task/taskRouter.js';
import asnwerRouter from './routes/answer/answerRouter.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;


/* Middleware */


app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
  
/* Middleware */


app.use('/auth' , authRouter);
app.use('/task' , taskRouter);
app.use('/answer' , asnwerRouter);

app.listen(PORT , ()=> {
    console.log(`Server starts in PORT ${PORT}`);
})