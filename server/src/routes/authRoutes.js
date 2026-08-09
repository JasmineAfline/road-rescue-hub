import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User, { USER_ROLES } from '../models/User.js';
import { requireAuthentication } from '../middleware/auth.js';

const router = Router();

function createToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function publicUser(user) {
  return { id: user.id, fullName: user.fullName, email: user.email, role: user.role };
}

router.post('/register', async (request, response, next) => {
  try {
    const { fullName, email, password, role = 'vehicle_owner' } = request.body;
    if (!fullName || !email || !password) {
      return response.status(400).json({ message: 'Full name, email, and password are required.' });
    }
    if (!USER_ROLES.includes(role) || role === 'admin') {
      return response.status(400).json({ message: 'Choose a valid non-administrator role.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (await User.exists({ email: normalizedEmail })) {
      return response.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({ fullName, email: normalizedEmail, password, role });
    return response.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (request, response, next) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) return response.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.matchesPassword(password))) {
      return response.status(401).json({ message: 'Invalid email or password.' });
    }

    return response.status(200).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuthentication, (request, response) => {
  response.status(200).json({ user: publicUser(request.user) });
});

export default router;
