const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const connectDB = require('../config/db');
const User = require('../models/User');
const Reflection = require('../models/Reflection');

const loadEnv = () => {
  const envCandidates = ['.env', 'ATT14776.env'];

  for (const fileName of envCandidates) {
    const envPath = path.join(__dirname, '..', fileName);
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      break;
    }
  }
};

const seedUsers = [
  {
    _id: '60d5ecb8b392d7001f8e8e9a',
    email: 'trungtapLXO@gmail.com',
    password: 'password123',
    full_name: 'Giao Vien La Xuan Oai',
    role: 'teacher',
    avatar: 'https://i.pravatar.cc/150?u=trungtapLXO',
    isActive: true
  },
  {
    _id: '60d5ecb8b392d7001f8e8e41',
    email: 'student_lxo_6@gmail.com',
    password: 'password123',
    full_name: 'Hoc Sinh La Xuan Oai 6',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?u=student_lxo_6',
    isActive: true
  },
  {
    _id: '60d5ecb8b392d7001f8e8e42',
    email: 'student_lxo_7@gmail.com',
    password: 'password123',
    full_name: 'Hoc Sinh La Xuan Oai 7',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?u=student_lxo_7',
    isActive: true
  },
  {
    _id: '60d5ecb8b392d7001f8e8e51',
    email: 'student_cd_6@gmail.com',
    password: 'password123',
    full_name: 'Hoc Sinh Chuong Duong 6',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?u=student_cd_6',
    isActive: true
  }
];

const seedReflections = [
  {
    userId: '60d5ecb8b392d7001f8e8e41',
    journeyId: '60d5ecb8b392d7001f8e9001',
    nodeId: '60d5ecb8b392d7001f8ea001',
    content: 'Hom nay em hoc duoc them nhieu cach giai bai toan va cam thay rat vui.',
    emotion: 'happy',
    visibility: 'public'
  },
  {
    userId: '60d5ecb8b392d7001f8e8e42',
    journeyId: '60d5ecb8b392d7001f8e9001',
    nodeId: '60d5ecb8b392d7001f8ea001',
    content: 'Em van hoi boi roi o mot so phan nhung da hieu hon sau khi thao luan nhom.',
    emotion: 'confused',
    visibility: 'public'
  },
  {
    userId: '60d5ecb8b392d7001f8e8e51',
    journeyId: '60d5ecb8b392d7001f8e9001',
    nodeId: '60d5ecb8b392d7001f8ea001',
    content: 'Em thay bai hoc nay huu ich va em muon xem lai de hieu sau hon.',
    emotion: 'neutral',
    visibility: 'public'
  }
];

const upsertUser = async (seedUser) => {
  const existing = await User.findById(seedUser._id);

  if (!existing) {
    const created = new User(seedUser);
    await created.save();
    return 'created';
  }

  existing.email = seedUser.email.toLowerCase();
  existing.full_name = seedUser.full_name;
  existing.role = seedUser.role;
  existing.avatar = seedUser.avatar;
  existing.isActive = seedUser.isActive;
  existing.password = seedUser.password;
  await existing.save();
  return 'updated';
};

const upsertReflection = async (seedReflection) => {
  const existing = await Reflection.findOne({
    userId: seedReflection.userId,
    journeyId: seedReflection.journeyId,
    nodeId: seedReflection.nodeId
  });

  if (!existing) {
    const created = new Reflection(seedReflection);
    await created.save();
    return 'created';
  }

  existing.content = seedReflection.content;
  existing.emotion = seedReflection.emotion;
  existing.visibility = seedReflection.visibility;
  await existing.save();
  return 'updated';
};

const run = async () => {
  loadEnv();

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI khong ton tai. Hay cau hinh .env hoac ATT14776.env');
  }

  await connectDB();

  const userStats = { created: 0, updated: 0 };
  const reflectionStats = { created: 0, updated: 0 };

  for (const seedUser of seedUsers) {
    const status = await upsertUser(seedUser);
    userStats[status] += 1;
  }

  for (const seedReflection of seedReflections) {
    const status = await upsertReflection(seedReflection);
    reflectionStats[status] += 1;
  }

  console.log('Seed users:', userStats);
  console.log('Seed reflections:', reflectionStats);
  await mongoose.disconnect();
};

run()
  .then(() => {
    console.log('Seed dev data thanh cong');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Seed dev data that bai:', error);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Mongo disconnect error:', disconnectError);
    }
    process.exit(1);
  });
