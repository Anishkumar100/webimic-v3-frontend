import mongoose from 'mongoose';

// Sub-schema for one section snapshot (one viewport-sized screenshot
// captured while auto-scrolling the page).
const sectionShotSchema = new mongoose.Schema({
  index: Number,
  scrollY: Number,
  url: String,
  publicId: String,
}, { _id: false });

// Sub-schema for a single crawled page
const pageDataSchema = new mongoose.Schema({
  url: String,
  title: String,
  screenshotPublicId: String,   // Cloudinary public_id for the screenshot
  screenshotUrl: String,        // Cloudinary secure_url
  sectionShotUrls: [sectionShotSchema], // per-viewport snapshots from scrolling
  links: [String],
  pageOrder: Number,
}, { _id: false });

// Sub-schema for token summary counts (matches frontend TokenColumns)
const tokenSummarySchema = new mongoose.Schema({
  colors: { type: Number, default: 0 },
  typography: { type: Number, default: 0 },
  spacing: { type: Number, default: 0 },
  animations: { type: Number, default: 0 },
}, { _id: false });

const jobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued',
  },

  // Crawl config (from NewJobModal form inputs)
  // scopeMode: 'single' → just the seed URL; 'full' → BFS every same-domain link
  // up to FULL_SITE_HARD_CAP (server-side safety limit). maxDepth is only used
  // for legacy 'single' jobs (kept for backward compatibility with old docs).
  scopeMode: { type: String, enum: ['single', 'full'], default: 'single' },
  maxDepth: { type: Number, default: 1, min: 1, max: 200 },
  devicePreset: { type: String, enum: ['desktop', 'tablet', 'mobile'], default: 'desktop' },

  // Crawl results
  pages: [pageDataSchema],
  pageCount: { type: Number, default: 0 },
  internalLinksFound: { type: Number, default: 0 },

  // Token summary (used in Dashboard stats + JobsTable)
  tokens: { type: tokenSummarySchema, default: () => ({}) },

  // PDF outputs — stored on Cloudinary
  docAPublicId: { type: String },
  docAUrl: { type: String },
  docASize: { type: String }, // e.g. "4.2 MB"
  docBPublicId: { type: String },
  docBUrl: { type: String },

  // LLM-ready JSON — stored on Cloudinary as raw file
  llmContextUrl: { type: String },

  // Job metadata
  error: { type: String },
  processingLog: [{ time: Date, message: String, level: String, agent: String }],
  completedAt: { type: Date },

  // BullMQ job reference
  queueJobId: { type: String },
}, { timestamps: true });

// Virtual: makes frontend-compatible "id" field from MongoDB "_id"
jobSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

jobSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.createdAt = ret.createdAt;
    ret.pdfSize = ret.docASize; // Map to what the frontend expects
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Job', jobSchema);
