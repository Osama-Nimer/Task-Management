import express from 'express';
import { register, sendCode, verifyCode, login, logout, getAllUsers, updateUserRole } from '../controller/authController.js';
import  authorizeRole  from '../middleware/authorizeRole.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    keyGenerator: (req) => req.body.email || req.ip,
    message: 'Too many login attempts for this user, please try again after 10 minutes',
});

router.post('/register', register);
router.post('/sendCode', authorizeRole("user"), sendCode);
router.post('/verification', authorizeRole("user"), verifyCode);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/all', authorizeRole("admin"), getAllUsers);
router.put('/updateRole/:id', authorizeRole("admin"), updateUserRole);

export default router;