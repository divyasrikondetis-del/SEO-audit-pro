require('dotenv').config();
const axios = require('axios');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const User = require('../models/User');
const Audit = require('../models/Audit');

const base = process.env.BASE_URL || 'http://localhost:5001/api';

(async () => {
  try {
    const rand = Math.floor(Math.random()*1000000);
    const name = `E2E_STATS ${rand}`;
    const email = `e2e_stats+${rand}@example.com`;
    const pw = 'Password123!';
    console.log('Registering', email);
    const reg = await axios.post(`${base}/auth/register`, { name, email, password: pw });
    console.log('Register response status', reg.status);
    const token = reg.data.token;
    if (!token) throw new Error('No token returned');

    // create audits
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Creating audit https://example.com');
    const a1 = await axios.post(`${base}/audits`, { url: 'https://example.com' });
    console.log('Audit1 created:', a1.data.audit._id);
    console.log('Creating audit https://example.org');
    const a2 = await axios.post(`${base}/audits`, { url: 'https://example.org' });
    console.log('Audit2 created:', a2.data.audit._id);

    // fetch stats
    const statsResp = await axios.get(`${base}/audits/stats`);
    console.log('Stats response:', statsResp.data.stats);
    const stats = statsResp.data.stats;

    const expectedTotal = 2;
    if (stats.total !== expectedTotal) {
      throw new Error(`Expected total ${expectedTotal} got ${stats.total}`);
    }
    if (stats.completed < 1) {
      throw new Error(`Expected at least one completed audit, got ${stats.completed}`);
    }

    console.log('Stats assertions passed');

    // cleanup: remove audits and user via DB
    await connectDB();
    const user = await User.findOne({ email });
    if (user) {
      const audits = await Audit.find({ user: user._id });
      for (const a of audits) {
        await Audit.deleteOne({ _id: a._id });
      }
      await User.deleteOne({ _id: user._id });
      console.log('Cleanup done');
    }

    process.exit(0);
  } catch (err) {
    console.error('E2E stats check error:', err.response?.data || err.message || err);
    process.exit(2);
  }
})();