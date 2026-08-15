const net = require('net');

const isIp = (host) => {
  return net.isIP(host) !== 0;
};

const isPrivateIPv4 = (ip) => {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  if (parts[0] === 10) return true;
  if (parts[0] === 127) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  return false;
};

const isSafeUrl = (urlString) => {
  try {
    const u = new URL(urlString);

    // Only allow http/https
    if (!['http:', 'https:'].includes(u.protocol)) return false;

    const host = u.hostname.toLowerCase();

    // Block common local hostnames
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.local')) return false;

    // If hostname is an IP, block private ranges
    if (isIp(host)) {
      if (isPrivateIPv4(host)) return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

module.exports = { isSafeUrl };
