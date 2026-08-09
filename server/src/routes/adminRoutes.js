import { Router } from 'express';
import Provider from '../models/Provider.js';
import { allowRoles, requireAuthentication } from '../middleware/auth.js';

const router = Router();

router.use(requireAuthentication, allowRoles('admin'));

router.get('/providers', async (request, response, next) => {
  try {
    const { status = 'pending' } = request.query;
    const filters = {};

    if (status === 'pending') filters.isApproved = false;
    else if (status === 'approved') filters.isApproved = true;
    else if (status !== 'all') return response.status(400).json({ message: 'Status must be pending, approved, or all.' });

    const providers = await Provider.find(filters)
      .populate('user', 'fullName email role')
      .sort({ createdAt: -1 });

    return response.status(200).json({ providers });
  } catch (error) {
    return next(error);
  }
});

router.patch('/providers/:providerId/approval', async (request, response, next) => {
  try {
    if (typeof request.body.isApproved !== 'boolean') {
      return response.status(400).json({ message: 'isApproved must be true or false.' });
    }

    const provider = await Provider.findByIdAndUpdate(
      request.params.providerId,
      { isApproved: request.body.isApproved },
      { new: true, runValidators: true },
    ).populate('user', 'fullName email role');

    if (!provider) return response.status(404).json({ message: 'Provider profile was not found.' });

    return response.status(200).json({ provider });
  } catch (error) {
    return next(error);
  }
});

export default router;
