import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const apiKeySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  keyHash: { type: String, required: true, select: false }, // bcrypt hash
  keyPrefix: { type: String, required: true }, // e.g. "wmk_live_7f3a9c"
  label: { type: String, default: 'Default Key' },
  lastUsedAt: { type: Date },
  totalRequests: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Static method to generate a new key
apiKeySchema.statics.generateKey = function () {
  const rawKey = `wmk_live_${uuidv4().replace(/-/g, '').substring(0, 20)}`;
  return rawKey;
};

export default mongoose.model('ApiKey', apiKeySchema);
