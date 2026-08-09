import { Router } from 'express';
import Provider, { PROVIDER_TYPES } from '../models/Provider.js';
import { allowRoles, requireAuthentication } from '../middleware/auth.js';

const router = Router();
const providerRoles = ['mechanic', 'spare_parts_seller', 'oil_dealer'];

function profileInput(body) {
  const { businessName, providerType, phone, description, county, town, serviceAreas, location } = body;
  return { businessName, providerType, phone, description, county, town, serviceAreas, location };
}

function hasRequiredProfileFields(profile) {
  return profile.businessName && profile.providerType && profile.phone && profile.county && profile.town;
}

function validateProviderType(user, providerType) {
  return PROVIDER_TYPES.includes(providerType) && user.role === providerType;
}

router.get('/', async (request, response, next) => {
  try {
    const { type, county, town, q } = request.query;
    const filters = { isApproved: true };

    if (type) {
      if (!PROVIDER_TYPES.includes(type)) return response.status(400).json({ message: 'Invalid provider type.' });
      filters.providerType = type;
    }
    if (county) filters.county = new RegExp(`^${escapeRegex(county)}$`, 'i');
    if (town) filters.town = new RegExp(`^${escapeRegex(town)}$`, 'i');
    if (q) filters.$or = [{ businessName: new RegExp(escapeRegex(q), 'i') }, { serviceAreas: new RegExp(escapeRegex(q), 'i') }];

    const providers = await Provider.find(filters)
      .select('businessName providerType phone description county town serviceAreas location')
      .sort({ createdAt: -1 })
      .limit(50);

    return response.status(200).json({ providers });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuthentication, allowRoles(...providerRoles), async (request, response, next) => {
  try {
    const provider = await Provider.findOne({ user: request.user.id });
    return response.status(200).json({ provider });
  } catch (error) {
    return next(error);
  }
});

router.post('/me', requireAuthentication, allowRoles(...providerRoles), async (request, response, next) => {
  try {
    if (await Provider.exists({ user: request.user.id })) {
      return response.status(409).json({ message: 'A provider profile already exists for this account.' });
    }

    const profile = profileInput(request.body);
    if (!hasRequiredProfileFields(profile) || !validateProviderType(request.user, profile.providerType)) {
      return response.status(400).json({ message: 'Complete all required fields and use the provider type assigned to your account.' });
    }

    const provider = await Provider.create({ ...profile, user: request.user.id });
    return response.status(201).json({ provider });
  } catch (error) {
    return next(error);
  }
});

router.patch('/me', requireAuthentication, allowRoles(...providerRoles), async (request, response, next) => {
  try {
    const profile = profileInput(request.body);
    if (profile.providerType && !validateProviderType(request.user, profile.providerType)) {
      return response.status(400).json({ message: 'Provider type must match your account role.' });
    }

    const updates = Object.fromEntries(Object.entries(profile).filter(([, value]) => value !== undefined));
    const provider = await Provider.findOneAndUpdate({ user: request.user.id }, updates, { new: true, runValidators: true });
    if (!provider) return response.status(404).json({ message: 'Create a provider profile before updating it.' });

    return response.status(200).json({ provider });
  } catch (error) {
    return next(error);
  }
});

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default router;
