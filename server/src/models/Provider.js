import mongoose from 'mongoose';

export const PROVIDER_TYPES = ['mechanic', 'spare_parts_seller', 'oil_dealer'];

const locationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number],
      validate: {
        validator: (value) => value.length === 2 && value[0] >= -180 && value[0] <= 180 && value[1] >= -90 && value[1] <= 90,
        message: 'Location must contain valid longitude and latitude coordinates.',
      },
    },
  },
  { _id: false },
);

const providerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    providerType: { type: String, required: true, enum: PROVIDER_TYPES },
    phone: { type: String, required: true, trim: true, maxlength: 25 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    county: { type: String, required: true, trim: true, maxlength: 80 },
    town: { type: String, required: true, trim: true, maxlength: 80 },
    serviceAreas: [{ type: String, trim: true, maxlength: 80 }],
    location: locationSchema,
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

providerSchema.index({ location: '2dsphere' });
providerSchema.index({ providerType: 1, county: 1, isApproved: 1 });

const Provider = mongoose.model('Provider', providerSchema);

export default Provider;
