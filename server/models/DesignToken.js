import mongoose from 'mongoose';

// Color token — one document per extracted color
const colorTokenSchema = new mongoose.Schema({
  hex: String,              // "#7C6FFF"
  rgb: { r: Number, g: Number, b: Number },
  role: String,             // "Brand Core" | "Background" | "Surface" | "Text" | "Accent" | "Border" | "Danger"
  frequency: Number,        // 0.0–1.0, how dominant in the screenshot
  wcagContrast: {
    onWhite: String,        // "AAA" | "AA" | "FAIL"
    onBlack: String,
  },
  source: { type: String, enum: ['css', 'pixel'], default: 'pixel' },
}, { _id: false });

// Typography token
const typographyTokenSchema = new mongoose.Schema({
  tag: String,              // "h1" | "h2" | "p" | "code" | "label"
  fontFamily: String,       // "Inter, sans-serif"
  fontFamilyClean: String,  // "Inter"
  fontSize: String,         // "64px"
  fontWeight: Number,       // 700
  lineHeight: String,       // "1.1"
  letterSpacing: String,    // "0.02em"
  textTransform: String,    // "none" | "uppercase" | "capitalize"
  sampleText: String,       // actual text node from the page
}, { _id: false });

// Spacing token
const spacingTokenSchema = new mongoose.Schema({
  name: String,             // "sp-1" | "sp-2" etc.
  value: String,            // "4px"
  numericValue: Number,     // 4
  usageCount: Number,       // how many elements use this spacing
  category: String,         // "margin" | "padding" | "gap"
}, { _id: false });

// Animation token
const animationTokenSchema = new mongoose.Schema({
  trigger: String,          // "onLoad" | "onHover" | "onScroll" | "onFocus"
  target: String,           // CSS selector of animated element
  duration: String,         // "0.8s"
  durationMs: Number,       // 800
  easing: String,           // "cubic-bezier(0.16, 1, 0.3, 1)"
  properties: [String],     // ["transform", "opacity"]
  type: String,             // "transition" | "keyframe"
}, { _id: false });

const designTokenSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // All token arrays — populated by the worker after crawl
  colors: [colorTokenSchema],
  typography: [typographyTokenSchema],
  spacing: [spacingTokenSchema],
  animations: [animationTokenSchema],
  
  // Expanded extracted tokens (Phase 2)
  gradients: [mongoose.Schema.Types.Mixed],
  borderRadii: [mongoose.Schema.Types.Mixed],
  assets: [mongoose.Schema.Types.Mixed],
  layoutSpecs: [mongoose.Schema.Types.Mixed],
  components: [mongoose.Schema.Types.Mixed],
  textCopy: [mongoose.Schema.Types.Mixed],

  // Doc B AI suggestions (populated in Phase 3)
  docBSuggestions: {
    alteredColors: [colorTokenSchema],
    darkModePalette: [colorTokenSchema],
    typographyImprovements: mongoose.Schema.Types.Mixed,
    wcagFixNotes: [String],
    generatedAt: Date,
  },

  // Raw aggregated LLM context string
  llmContextJson: { type: String },

}, { timestamps: true });

export default mongoose.model('DesignToken', designTokenSchema);
