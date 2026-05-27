/**
 * Seeder — populates the DB with sample users + pins + boards.
 * Usage:
 *   npm run seed          # import
 *   npm run seed destroy  # wipe
 */
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const Pin      = require('../models/Pin');
const Board    = require('../models/Board');

const connectDB = require('../config/db');

const PLACEHOLDER = 'https://images.unsplash.com/photo-';

const sampleImages = [
  `${PLACEHOLDER}1486325212027-8081e485255e?w=800`,
  `${PLACEHOLDER}1497366216548-37526070297c?w=800`,
  `${PLACEHOLDER}1504711434489-d845cc745d57?w=800`,
  `${PLACEHOLDER}1449034446853-66c86144b0ad?w=800`,
  `${PLACEHOLDER}1416879595882-3373a0480b5b?w=800`,
  `${PLACEHOLDER}1555041469-a586c61ea9bc?w=800`,
];

const users = [
  { name: 'Mira Asante',  username: 'mira_asante',  email: 'mira@demo.com',  password: 'password123', bio: 'Visual archaeologist.' },
  { name: 'Leo Navarro',  username: 'leo_navarro',  email: 'leo@demo.com',   password: 'password123', bio: 'Architect by day.' },
  { name: 'Suki Tanaka',  username: 'suki_tanaka',  email: 'suki@demo.com',  password: 'password123', bio: 'Food, craft, and quiet spaces.' },
];

const categories = ['Architecture','Nature','Design','Food','Travel','Fashion','Art','Technology','Minimal'];

const pinTitles = [
  'Brutalist Tower','Wabi-sabi Still Life','Fern Forest Floor','Soba & Dashi','Santorini Dusk',
  'Monochrome Layers','Ink & Paper','Grid Interface','Stone & Light','Copper Workshop',
  'Mangrove Root','Charcoal Ramen','Kyoto Alleys','Structured Coat','Linocut Series',
  'Void Interface','Rice Paper Screen','Hammered Silver',
];

const seed = async () => {
  await connectDB();
  await User.deleteMany(); await Pin.deleteMany(); await Board.deleteMany();
  console.log('🗑  Cleared existing data');

  const createdUsers = await User.insertMany(
    await Promise.all(users.map(async u => ({ ...u, password: await bcrypt.hash(u.password, 12) })))
  );
  console.log(`👤 Created ${createdUsers.length} users`);

  const pins = await Pin.insertMany(
    pinTitles.map((title, i) => ({
      title,
      description: `A beautiful ${categories[i % categories.length].toLowerCase()} scene.`,
      image: { url: sampleImages[i % sampleImages.length], publicId: `seed_${i}` },
      author:   createdUsers[i % createdUsers.length]._id,
      category: categories[i % categories.length],
      tags:     [categories[i % categories.length].toLowerCase(), 'curated'],
    }))
  );
  console.log(`📌 Created ${pins.length} pins`);

  await Board.insertMany([
    { name: 'Dark Architecture', owner: createdUsers[0]._id, pins: pins.slice(0, 4).map(p => p._id) },
    { name: 'Japanese Aesthetics', owner: createdUsers[0]._id, pins: pins.slice(4, 8).map(p => p._id) },
    { name: 'Studio References', owner: createdUsers[1]._id, pins: pins.slice(8, 12).map(p => p._id) },
  ]);
  console.log('📋 Created 3 boards');
  console.log('\n✅ Seeding complete!\nDemo credentials: mira@demo.com / password123');
  process.exit(0);
};

const destroy = async () => {
  await connectDB();
  await User.deleteMany(); await Pin.deleteMany(); await Board.deleteMany();
  console.log('🗑  All data wiped');
  process.exit(0);
};

if (process.argv[2] === 'destroy') destroy(); else seed();
