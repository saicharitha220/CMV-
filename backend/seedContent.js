import dotenv from 'dotenv';
dotenv.config();

import connectDB from './src/config/db.js';
import Content from './src/models/Content.js';

const sample = [
  {
    key: 'SUPER',
    name: 'Homepage Hero',
    description: 'Main hero text and CTA on homepage',
    value: { title: 'NEW THINGS', subtitle: 'Explore the latest features', cta: { text: 'Get Started', href: '/start' } },
  },
  {
    key: 'CHARIITHA',
    name: 'Author Bio',
    description: 'Short bio for Chariitha',
    value: { name: 'Chariitha', degree: 'B.Tech', role: 'Frontend Developer', bio: 'Building delightful web experiences.' },
  },
  {
    key: 'CONTENT_1',
    name: 'Welcome Message',
    description: 'Short welcome shown on dashboard',
    value: { heading: 'Welcome to the CMS', body: 'Use the left menu to manage content and users.' },
  },
];

const run = async () => {
  console.log('Connecting to DB...');
  await connectDB();
  console.log('Seeding content...');
  for (const item of sample) {
    // upsert
    await Content.findOneAndUpdate({ key: item.key }, item, { upsert: true, new: true, setDefaultsOnInsert: true });
    console.log('Seeded', item.key);
  }
  console.log('Seeding complete');
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
