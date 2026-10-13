// Run once to create your first admin account:
//   node scripts/promoteToAdmin.js someone@example.com
// The user must already have registered normally through the site.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/promoteToAdmin.js <email>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: 'admin' },
    { new: true }
  );

  if (!user) {
    console.error(`No user found with email ${email}. Register the account first, then run this again.`);
  } else {
    console.log(`${user.name} (${user.email}) is now an admin.`);
  }

  await mongoose.disconnect();
}

run();
