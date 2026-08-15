const axios = require('axios');
const cheerio = require('cheerio');
const { isSafeUrl } = require('../utils/urlValidator');

const DEFAULT_TIMEOUT = 15000;

const countWords = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const countLinks = ($, baseUrl) => {
  const links = [];
  const internalLinks = [];
  const externalLinks = [];
  let emptyLinks = 0;
  let invalidLinks = 0;

  $('a').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) {
      emptyLinks += 1;
      return;
    }

    if (
      href.startsWith('#') ||
      href.startsWith('javascript:') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      return;
    }

    let absoluteUrl = href;
    try {
      absoluteUrl = new URL(href, baseUrl).href;
    } catch (err) {
      invalidLinks += 1;
      return;
    }

    links.push(absoluteUrl);

    try {
      const baseDomain = new URL(baseUrl).hostname;
      const linkDomain = new URL(absoluteUrl).hostname;
      if (linkDomain === baseDomain) {
        internalLinks.push(absoluteUrl);
      } else {
        externalLinks.push(absoluteUrl);
      }
    } catch (err) {
      externalLinks.push(absoluteUrl);
    }
  });

  return {
    total: links.length,
    internal: internalLinks.length,
    external: externalLinks.length,
    emptyLinks,
    invalidLinks,
  };
};

const countImages = ($) => {
  let total = 0;
  let withoutAlt = 0;
  let withAlt = 0;

  $('img').each((_, element) => {
    total += 1;
    const alt = $(element).attr('alt');
    if (!alt || alt.trim() === '') {
      withoutAlt += 1;
    } else {
      withAlt += 1;
    }
  });

  return { total, withoutAlt, withAlt };
};

const getMetaContent = ($, selector) => {
  const element = $(selector);
  return element.attr('content')?.trim() || '';
};

const getMetaDescription = ($) => {
  return getMetaContent($, 'meta[name="description"]') || getMetaContent($, 'meta[property="og:description"]') || '';
};

const getCanonical = ($) => {
  return $('link[rel="canonical"]').attr('href')?.trim() || '';
};

const getLanguage = ($) => {
  return $('html').attr('lang')?.trim() || '';
};

const getViewport = ($) => {
  return $('meta[name="viewport"]').attr('content')?.trim() || '';
};

const getFavicon = ($) => {
  return $('link[rel="icon"]').attr('href')?.trim() || $('link[rel="shortcut icon"]').attr('href')?.trim() || '';
};

const getHeadingStats = ($) => {
  return {
    h1Count: $('h1').length,
    h2Count: $('h2').length,
    h3Count: $('h3').length,
  };
};

const getOpenGraphTags = ($) => ({
  ogTitle: $('meta[property="og:title"]').attr('content')?.trim() || '',
  ogDescription: $('meta[property="og:description"]').attr('content')?.trim() || '',
  ogImage: $('meta[property="og:image"]').attr('content')?.trim() || '',
  twitterCard: $('meta[name="twitter:card"]').attr('content')?.trim() || '',
});

const getCharset = ($) => {
  const charset = $('meta[charset]').attr('charset')?.trim();
  if (charset) return charset;
  const contentType = $('meta[http-equiv="Content-Type"]').attr('content') || '';
  const match = contentType.match(/charset=([^;\s]+)/i);
  return match ? match[1].trim() : '';
};

const getRobotsTxtAvailability = async (baseUrl) => {
  try {
    const target = new URL('/robots.txt', baseUrl).toString();
    const response = await axios.get(target, { timeout: 8000 });
    return response.status < 400;
  } catch (error) {
    return false;
  }
};

const getSitemapAvailability = async (baseUrl) => {
  try {
    const target = new URL('/sitemap.xml', baseUrl).toString();
    const response = await axios.get(target, { timeout: 8000 });
    return response.status < 400;
  } catch (error) {
    return false;
  }
};

const buildChecks = (data) => {
  const checks = [];

  const addCheck = (status, name, explanation, recommendation, category) => {
    checks.push({ status, name, explanation, recommendation, category });
  };

  addCheck(
    data.title ? 'pass' : 'fail',
    'Title tag exists',
    data.title ? `The page title is present and readable.` : 'The page is missing a title tag.',
    data.title ? 'Keep the title clear and descriptive.' : 'Add a concise title tag that reflects the page topic.',
    'onPage'
  );

  const titleLengthOk = data.title && data.title.length >= 10 && data.title.length <= 60;
  addCheck(
    titleLengthOk ? 'pass' : data.title ? 'warning' : 'fail',
    'Title length is optimized',
    titleLengthOk ? 'The title length fits the recommended range.' : 'The title length should be refined for clarity and search visibility.',
    'Keep the title between 10 and 60 characters and make it specific.',
    'onPage'
  );

  addCheck(
    data.metaDescription ? 'pass' : 'fail',
    'Meta description exists',
    data.metaDescription ? 'A meta description is present for search snippets.' : 'The page is missing a meta description.',
    'Create a unique meta description that summarizes the page in one or two sentences.',
    'content'
  );

  const descriptionLengthOk = data.metaDescription && data.metaDescription.length >= 50 && data.metaDescription.length <= 160;
  addCheck(
    descriptionLengthOk ? 'pass' : data.metaDescription ? 'warning' : 'fail',
    'Meta description length is appropriate',
    descriptionLengthOk ? 'The meta description length falls within a useful range.' : 'The meta description should be clearer and more informative.',
    'Aim for roughly 50-160 characters with a clear value proposition.',
    'content'
  );

  addCheck(
    data.h1 ? 'pass' : 'fail',
    'H1 heading exists',
    data.h1 ? 'A primary H1 heading is present.' : 'The page has no visible H1 heading.',
    'Add a single clear H1 that matches the main intent of the content.',
    'onPage'
  );

  addCheck(
    data.headingStats.h1Count <= 1 ? 'pass' : 'warning',
    'Heading structure is clear',
    data.headingStats.h1Count <= 1 ? 'The page uses a clean H1 structure.' : 'The page has multiple H1 tags, which can dilute focus.',
    'Use one primary H1 and structure the rest of the headings logically.',
    'accessibility'
  );

  addCheck(
    data.imagesWithoutAlt === 0 ? 'pass' : data.images > 0 ? 'warning' : 'pass',
    'Images include descriptive alt text',
    data.imagesWithoutAlt === 0 ? 'Images are properly labeled for accessibility.' : `${data.imagesWithoutAlt} image${data.imagesWithoutAlt > 1 ? 's are' : ' is'} missing alt text.`,
    'Add descriptive alt text to every meaningful image.',
    'images'
  );

  addCheck(
    data.links > 0 ? 'pass' : 'warning',
    'Page contains links',
    data.links > 0 ? 'The page includes links for navigation and discovery.' : 'The page does not include links.',
    'Add relevant internal and external links to improve page depth and navigation.',
    'links'
  );

  addCheck(
    data.internalLinks > 0 ? 'pass' : 'warning',
    'Internal linking is present',
    data.internalLinks > 0 ? 'The page includes internal links.' : 'The page has no internal links.',
    'Connect related content with internal links to improve site structure.',
    'links'
  );

  addCheck(
    data.https ? 'pass' : 'fail',
    'HTTPS is enabled',
    data.https ? 'The page is served over HTTPS.' : 'The page is not using HTTPS.',
    'Enable HTTPS to improve security and trustworthiness.',
    'technical'
  );

  addCheck(
    data.canonical ? 'pass' : 'warning',
    'Canonical URL is present',
    data.canonical ? 'A canonical URL is present.' : 'A canonical URL was not detected.',
    'Add a canonical URL to reduce duplicate content issues.',
    'technical'
  );

  addCheck(
    data.robotsTxt ? 'pass' : 'warning',
    'robots.txt is available',
    data.robotsTxt ? 'The site exposes robots.txt.' : 'robots.txt was not detected for this site.',
    'Publish a robots.txt file to guide crawlers clearly.',
    'technical'
  );

  addCheck(
    data.sitemapXml ? 'pass' : 'warning',
    'sitemap.xml is available',
    data.sitemapXml ? 'A sitemap file is available.' : 'A sitemap file was not detected.',
    'Add a sitemap.xml file to help search engines discover your pages.',
    'technical'
  );

  addCheck(
    data.language ? 'pass' : 'warning',
    'Language attribute is defined',
    data.language ? 'The document declares a language.' : 'The page is missing a language attribute.',
    'Set the html lang attribute to improve accessibility and internationalization.',
    'accessibility'
  );

  addCheck(
    data.viewport ? 'pass' : 'warning',
    'Viewport meta tag is present',
    data.viewport ? 'The viewport meta tag is present.' : 'The viewport meta tag is missing.',
    'Add a viewport meta tag to support responsive design.',
    'accessibility'
  );

  addCheck(
    data.charset ? 'pass' : 'warning',
    'Charset declared',
    data.charset ? `Document charset is declared: ${data.charset}.` : 'The document does not declare a charset.',
    'Add a charset declaration like <meta charset="utf-8"> to avoid encoding issues.',
    'technical'
  );

  return checks;
};

const buildRecommendations = (checks) => {
  const byStatus = ['fail', 'warning'];
  const recommendations = [];

  checks.filter((check) => byStatus.includes(check.status)).forEach((check) => {
    if (!check.recommendation) return;
    recommendations.push({
      title: check.name,
      description: check.recommendation,
      severity: check.status === 'fail' ? 'high' : 'medium',
      category: check.category || 'general',
    });
  });

  return recommendations.slice(0, 8);
};

const calculateScoreBreakdown = (data) => {
  const technicalSeo = [
    data.https ? 100 : 0,
    data.canonical ? 100 : 0,
    data.robotsTxt ? 100 : 0,
    data.sitemapXml ? 100 : 0,
    data.ogTitle ? 100 : 0,
    data.ogDescription ? 100 : 0,
    data.ogImage ? 100 : 0,
    data.twitterCard ? 100 : 0,
  ];

  const contentSeo = [
    data.title ? 100 : 0,
    data.metaDescription ? 100 : 0,
    data.wordCount >= 300 ? 100 : data.wordCount >= 100 ? 60 : 0,
    data.h1 ? 100 : 0,
  ];

  const onPageSeo = [
    data.title && data.title.length >= 10 && data.title.length <= 60 ? 100 : 50,
    data.metaDescription && data.metaDescription.length >= 50 && data.metaDescription.length <= 160 ? 100 : 50,
    data.language ? 100 : 0,
    data.viewport ? 100 : 0,
    data.favicon ? 100 : 0,
  ];

  const imagesScore = data.images > 0 ? Math.max(0, Math.round(100 - (data.imagesWithoutAlt / Math.max(1, data.images)) * 100)) : 100;
  const linksScore = data.links > 0 ? Math.max(0, Math.round(100 - (data.linkStats.invalidLinks / Math.max(1, data.links)) * 50)) : 50;
  const accessibility = [
    data.imagesWithoutAlt === 0 ? 100 : 50,
    data.language ? 100 : 0,
    data.headingStats.h1Count <= 1 ? 100 : 50,
    data.viewport ? 100 : 0,
  ];

  const average = (values) => {
    if (!values.length) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  };

  const breakdown = {
    technicalSeo: average(technicalSeo),
    contentSeo: average(contentSeo),
    onPageSeo: average(onPageSeo),
    images: imagesScore,
    links: linksScore,
    accessibility: average(accessibility),
  };

  const weightedScore = Math.round(
    breakdown.technicalSeo * 0.2 +
    breakdown.contentSeo * 0.2 +
    breakdown.onPageSeo * 0.2 +
    breakdown.images * 0.15 +
    breakdown.links * 0.15 +
    breakdown.accessibility * 0.1
  );

  return { breakdown, weightedScore };
};

const buildIssueCategories = (checks) => {
  const categories = { technical: 0, content: 0, images: 0, links: 0, accessibility: 0, general: 0 };

  checks.filter((check) => check.status !== 'pass').forEach((check) => {
    const category = check.category || 'general';
    if (category === 'technical') categories.technical += 1;
    else if (category === 'content') categories.content += 1;
    else if (category === 'images') categories.images += 1;
    else if (category === 'links') categories.links += 1;
    else if (category === 'accessibility') categories.accessibility += 1;
    else categories.general += 1;
  });

  return categories;
};

const runSeoAudit = async (url) => {
  try {
    const normalizedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

    if (!isSafeUrl(normalizedUrl)) {
      throw new Error('URL is not allowed or appears unsafe');
    }

    let response;
    try {
      response = await axios.get(normalizedUrl, {
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEOAuditBot/1.0; +https://seoauditpro.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      maxRedirects: 5,
    });
    } catch (err) {
      // Map common axios/network errors to clearer messages
      if (err.code === 'ECONNABORTED') {
        throw new Error('Request timed out while fetching the URL');
      }
      if (err.response && err.response.status) {
        throw new Error(`Received HTTP ${err.response.status} when fetching the URL`);
      }
      throw new Error(`Network error while fetching the URL`);
    }
    if (!response || typeof response.data !== 'string') {
      throw new Error('Unexpected non-HTML response from target URL');
    }

    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('title').first().text().trim();
    const metaDescription = getMetaDescription($);
    const h1 = $('h1').first().text().trim();
    const bodyText = $('body').text().trim();
    const wordCount = countWords(bodyText);
    const imageStats = countImages($);
    const linkStats = countLinks($, normalizedUrl);
    const headings = getHeadingStats($);
    const ogTags = getOpenGraphTags($);
    const canonical = getCanonical($);
    const language = getLanguage($);
    const viewport = getViewport($);
    const favicon = getFavicon($);
    const charset = getCharset($);

    const [robotsTxt, sitemapXml] = await Promise.all([
      getRobotsTxtAvailability(normalizedUrl),
      getSitemapAvailability(normalizedUrl),
    ]);

    const auditData = {
      url: normalizedUrl,
      title,
      metaDescription,
      h1,
      charset,
      wordCount,
      images: imageStats.total,
      imagesWithoutAlt: imageStats.withoutAlt,
      links: linkStats.total,
      internalLinks: linkStats.internal,
      externalLinks: linkStats.external,
      linkStats,
      headingStats: headings,
      https: normalizedUrl.startsWith('https://'),
      canonical,
      robotsTxt,
      sitemapXml,
      language,
      viewport,
      favicon,
      ogTitle: ogTags.ogTitle,
      ogDescription: ogTags.ogDescription,
      ogImage: ogTags.ogImage,
      twitterCard: ogTags.twitterCard,
      contentStats: {
        wordCount,
        h1Count: headings.h1Count,
        h2Count: headings.h2Count,
        h3Count: headings.h3Count,
      },
      imageStats: {
        total: imageStats.total,
        withAlt: imageStats.withAlt,
        withoutAlt: imageStats.withoutAlt,
      },
      linkStats: {
        total: linkStats.total,
        internal: linkStats.internal,
        external: linkStats.external,
        emptyLinks: linkStats.emptyLinks,
        invalidLinks: linkStats.invalidLinks,
      },
      technicalStats: {
        https: normalizedUrl.startsWith('https://'),
        canonical,
        robotsTxt,
        sitemapXml,
        ogTitle: ogTags.ogTitle,
        ogDescription: ogTags.ogDescription,
        ogImage: ogTags.ogImage,
        twitterCard: ogTags.twitterCard,
        language,
        viewport,
        favicon,
      },
    };

    const checks = buildChecks(auditData);
    const recommendations = buildRecommendations(checks);
    const scoreSummary = calculateScoreBreakdown(auditData);
    const issues = checks.filter((check) => check.status !== 'pass').map((check) => `${check.name}: ${check.explanation}`);

    return {
      ...auditData,
      seoScore: scoreSummary.weightedScore,
      scoreBreakdown: scoreSummary.breakdown,
      issues,
      issueCategories: buildIssueCategories(checks),
      checks,
      recommendations,
      contentStats: {
        wordCount,
        h1Count: headings.h1Count,
        h2Count: headings.h2Count,
        h3Count: headings.h3Count,
      },
      imageStats: {
        total: imageStats.total,
        withAlt: imageStats.withAlt,
        withoutAlt: imageStats.withoutAlt,
      },
      linkStats: {
        total: linkStats.total,
        internal: linkStats.internal,
        external: linkStats.external,
        emptyLinks: linkStats.emptyLinks,
        invalidLinks: linkStats.invalidLinks,
      },
      technicalStats: {
        https: normalizedUrl.startsWith('https://'),
        canonical,
        robotsTxt,
        sitemapXml,
        ogTitle: ogTags.ogTitle,
        ogDescription: ogTags.ogDescription,
        ogImage: ogTags.ogImage,
        twitterCard: ogTags.twitterCard,
        language,
        viewport,
        favicon,
      },
    };
  } catch (error) {
    throw new Error(`Failed to audit website: ${error.message}`);
  }
};

module.exports = { runSeoAudit };