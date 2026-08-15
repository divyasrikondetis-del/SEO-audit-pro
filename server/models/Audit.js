const mongoose = require('mongoose');

const checkSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ['pass', 'warning', 'fail'], required: true },
    name: { type: String, required: true },
    explanation: { type: String, default: '' },
    recommendation: { type: String, default: '' },
    category: { type: String, default: 'general' },
  },
  { _id: false }
);

const recommendationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    category: { type: String, default: 'general' },
  },
  { _id: false }
);

const auditSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: '',
    },
    metaDescription: {
      type: String,
      default: '',
    },
    h1: {
      type: String,
      default: '',
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    images: {
      type: Number,
      default: 0,
    },
    imagesWithoutAlt: {
      type: Number,
      default: 0,
    },
    links: {
      type: Number,
      default: 0,
    },
    internalLinks: {
      type: Number,
      default: 0,
    },
    externalLinks: {
      type: Number,
      default: 0,
    },
    seoScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    scoreBreakdown: {
      type: Object,
      default: {
        technicalSeo: 0,
        contentSeo: 0,
        onPageSeo: 0,
        images: 0,
        links: 0,
        accessibility: 0,
      },
    },
    issues: {
      type: [String],
      default: [],
    },
    issueCategories: {
      type: Object,
      default: {
        technical: 0,
        content: 0,
        images: 0,
        links: 0,
        accessibility: 0,
        general: 0,
      },
    },
    checks: {
      type: [checkSchema],
      default: [],
    },
    recommendations: {
      type: [recommendationSchema],
      default: [],
    },
    contentStats: {
      type: Object,
      default: {},
    },
    imageStats: {
      type: Object,
      default: {},
    },
    linkStats: {
      type: Object,
      default: {},
    },
    technicalStats: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Audit', auditSchema);