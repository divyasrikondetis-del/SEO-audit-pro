const Audit = require('../models/Audit');
const { runSeoAudit } = require('../services/seoAuditService');

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

const formatUrl = (url) => {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

const createAudit = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    const formattedUrl = formatUrl(url);

    if (!isValidHttpUrl(formattedUrl)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid URL starting with http:// or https://' });
    }

    const existingAudit = await Audit.findOne({ user: req.user._id, url: formattedUrl, status: 'completed' }).sort({ createdAt: -1 });
    if (existingAudit) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      if (existingAudit.createdAt > sevenDaysAgo) {
        return res.status(200).json({ success: true, message: 'Using cached audit (less than 7 days old)', audit: existingAudit, cached: true });
      }
    }

    const audit = new Audit({ user: req.user._id, url: formattedUrl, status: 'pending' });
    await audit.save();

    try {
      const auditResults = await runSeoAudit(formattedUrl);

      audit.title = auditResults.title || '';
      audit.metaDescription = auditResults.metaDescription || '';
      audit.h1 = auditResults.h1 || '';
      audit.wordCount = auditResults.wordCount || 0;
      audit.images = auditResults.images || 0;
      audit.imagesWithoutAlt = auditResults.imagesWithoutAlt || 0;
      audit.links = auditResults.links || 0;
      audit.internalLinks = auditResults.internalLinks || 0;
      audit.externalLinks = auditResults.externalLinks || 0;
      audit.seoScore = auditResults.seoScore || 0;
      audit.scoreBreakdown = auditResults.scoreBreakdown || {};
      audit.issues = auditResults.issues || [];
      audit.issueCategories = auditResults.issueCategories || {};
      audit.checks = auditResults.checks || [];
      audit.recommendations = auditResults.recommendations || [];
      audit.contentStats = auditResults.contentStats || {};
      audit.imageStats = auditResults.imageStats || {};
      audit.linkStats = auditResults.linkStats || {};
      audit.technicalStats = auditResults.technicalStats || {};
      audit.status = 'completed';

      await audit.save();

      return res.status(201).json({ success: true, message: 'Audit completed successfully', audit, cached: false });
    } catch (auditError) {
      audit.status = 'failed';
      audit.issues = [`Failed to analyze website: ${auditError.message}`];
      await audit.save();

      return res.status(502).json({ success: false, message: 'Unable to analyze this website. Please check the URL and try again.', error: auditError.message });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while creating audit', error: error.message });
  }
};

const getAudits = async (req, res) => {
  try {
    const audits = await Audit.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: audits.length, audits });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while fetching audits', error: error.message });
  }
};

const getAuditById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid audit ID format' });
    }

    const audit = await Audit.findOne({ _id: id, user: req.user._id });
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit not found or you do not have permission to view it' });
    }

    return res.status(200).json({ success: true, audit });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while fetching audit', error: error.message });
  }
};

const deleteAudit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid audit ID format' });
    }

    const audit = await Audit.findOneAndDelete({ _id: id, user: req.user._id });
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit not found or you do not have permission to delete it' });
    }

    return res.status(200).json({ success: true, message: 'Audit deleted successfully', audit });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while deleting audit', error: error.message });
  }
};

const getAuditStats = async (req, res) => {
  try {
    const audits = await Audit.find({ user: req.user._id }).sort({ createdAt: -1 });
    const total = audits.length;
    const averageScore = total ? Math.round(audits.reduce((sum, audit) => sum + (audit.seoScore || 0), 0) / total) : 0;
    const highestScore = total ? Math.max(...audits.map((audit) => audit.seoScore || 0)) : 0;
    const lowestScore = total ? Math.min(...audits.map((audit) => audit.seoScore || 0)) : 0;
    const totalIssues = audits.reduce((sum, audit) => sum + (audit.issues?.length || 0), 0);
    const completedAudits = audits.filter((audit) => audit.status === 'completed').length;
    const failedAudits = audits.filter((audit) => audit.status === 'failed').length;
    const uniqueWebsites = new Set(audits.map((audit) => new URL(audit.url).hostname)).size;

    const bestAudit = [...audits].sort((a, b) => (b.seoScore || 0) - (a.seoScore || 0))[0] || null;
    const worstAudit = [...audits].sort((a, b) => (a.seoScore || 0) - (b.seoScore || 0))[0] || null;
    const mostRecent = audits[0] || null;

    return res.status(200).json({
      success: true,
      stats: {
        // original detailed keys
        total,
        averageScore,
        highestScore,
        lowestScore,
        totalIssues,
        completedAudits,
        failedAudits,
        uniqueWebsites,
        bestAudit,
        worstAudit,
        mostRecent,
        // frontend-friendly aliases (keeps backward compatibility)
        average: averageScore,
        highest: highestScore,
        lowest: lowestScore,
        issues: totalIssues,
        completed: completedAudits,
        failed: failedAudits,
        websites: uniqueWebsites,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while fetching audit stats', error: error.message });
  }
};

const compareAudits = async (req, res) => {
  try {
    const { id1, id2 } = req.params;

    const audits = await Audit.find({ _id: { $in: [id1, id2] }, user: req.user._id });
    if (audits.length !== 2) {
      return res.status(404).json({ success: false, message: 'Both audits must exist and belong to the current user' });
    }

    const [before, after] = audits[0]._id.toString() === id1 ? [audits[0], audits[1]] : [audits[1], audits[0]];

    const comparison = [
      { label: 'SEO Score', before: before.seoScore || 0, after: after.seoScore || 0, unit: '/100' },
      { label: 'Word Count', before: before.wordCount || 0, after: after.wordCount || 0, unit: 'words' },
      { label: 'Images', before: before.images || 0, after: after.images || 0, unit: 'images' },
      { label: 'Missing Alt', before: before.imagesWithoutAlt || 0, after: after.imagesWithoutAlt || 0, unit: 'images' },
      { label: 'Issues', before: before.issues?.length || 0, after: after.issues?.length || 0, unit: 'issues' },
    ];

    return res.status(200).json({ success: true, comparison, before, after });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while comparing audits', error: error.message });
  }
};

module.exports = {
  createAudit,
  getAudits,
  getAuditById,
  deleteAudit,
  getAuditStats,
  compareAudits,
};