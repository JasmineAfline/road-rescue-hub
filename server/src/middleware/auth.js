import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireAuthentication(request, response, next) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return response.status(401).json({ message: 'Authentication is required.' });
  }

  try {
    const payload = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);

    if (!user) return response.status(401).json({ message: 'User no longer exists.' });

    request.user = user;
    return next();
  } catch {
    return response.status(401).json({ message: 'Your session is invalid or expired.' });
  }
}

export function allowRoles(...roles) {
  return (request, response, next) => {
    if (!roles.includes(request.user.role)) {
      return response.status(403).json({ message: 'You do not have permission for this action.' });
    }

    return next();
  };
}
