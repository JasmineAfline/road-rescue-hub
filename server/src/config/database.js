import mongoose from 'mongoose';

export async function connectDatabase() {
  const { MONGODB_URI: mongoUri } = process.env;

  if (!mongoUri) throw new Error('MONGODB_URI is not configured.');

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');
}
