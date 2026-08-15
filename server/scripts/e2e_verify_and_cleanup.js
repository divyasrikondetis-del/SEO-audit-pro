require('dotenv').config();
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const User = require('../models/User');
const Audit = require('../models/Audit');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    const users = await User.find({ email: /e2e/ }).sort({ createdAt: -1 }).lean();
    if (!users.length) {
      console.log('No e2e users found.');
      process.exit(0);
    }

    for (const u of users) {
      console.log('Found user:', u.email, 'createdAt:', u.createdAt);
      if (!u.password) {
        console.log('  No password field present!');
      } else {
        console.log('  Password field length:', u.password.length);
        const matchesPlain = (u.password === 'Password123!');
        const bcryptMatch = await bcrypt.compare('Password123!', u.password);
        console.log('  Plain equality with Password123!:', matchesPlain);
        console.log('  bcrypt.compare with Password123!: ', bcryptMatch);
      }
      const audits = await Audit.find({ user: u._id }).lean();
      console.log('  Found audits:', audits.length);
      for (const a of audits) {
        console.log('    Deleting audit', a._id, a.url);
        await Audit.deleteOne({ _id: a._id });
      }
      console.log('  Deleting user', u._id);
      await User.deleteOne({ _id: u._id });
    }

    console.log('Cleanup complete.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(2);
  }
})();