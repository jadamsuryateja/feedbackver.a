import express from 'express';
import { login, verify } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', (req, res, next) => {
  console.log('Login attempt:', req.body);
  login(req, res, next);
});

router.get('/verify', authenticate, (req, res, next) => {
  console.log('Verify attempt:', req.user);
  verify(req, res, next);
});

export default router;
