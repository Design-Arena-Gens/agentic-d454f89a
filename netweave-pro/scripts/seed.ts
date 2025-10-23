import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://demo:demo123@cluster0.mongodb.net/netweave?retryWrites=true&w=majority';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  affiliateId: String,
  referredBy: String,
  role: String,
  isActive: Boolean,
  totalEarnings: Number,
  availableBalance: Number,
  pendingBalance: Number,
  level: Number,
  downlineCount: Number,
  directReferrals: [String],
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  type: String,
  price: Number,
  commissionRate: Number,
  levelCommissions: [{
    level: Number,
    rate: Number,
  }],
  images: [String],
  isActive: Boolean,
  stock: Number,
  downloadUrl: String,
  createdBy: String,
  totalSales: Number,
}, { timestamps: true });

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 12);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@netweave.com',
      password: hashedPassword,
      affiliateId: nanoid(10).toUpperCase(),
      role: 'admin',
      isActive: true,
      totalEarnings: 0,
      availableBalance: 0,
      pendingBalance: 0,
      level: 1,
      downlineCount: 0,
      directReferrals: [],
    });

    console.log('Created admin user:', adminUser.email, '- Password: password123');

    const products = [
      {
        name: 'Digital Marketing Masterclass',
        description: 'Complete digital marketing course covering SEO, social media, email marketing, and more.',
        category: 'Education',
        type: 'digital',
        price: 299.99,
        commissionRate: 20,
        levelCommissions: [
          { level: 1, rate: 20 },
          { level: 2, rate: 10 },
          { level: 3, rate: 5 },
          { level: 4, rate: 3 },
          { level: 5, rate: 2 },
        ],
        images: [],
        isActive: true,
        downloadUrl: '/downloads/marketing-course.zip',
        createdBy: adminUser._id.toString(),
        totalSales: 0,
      },
      {
        name: 'E-Book: Build Your Business',
        description: 'Comprehensive guide to building a successful online business from scratch.',
        category: 'Books',
        type: 'digital',
        price: 49.99,
        commissionRate: 25,
        levelCommissions: [
          { level: 1, rate: 25 },
          { level: 2, rate: 12 },
          { level: 3, rate: 6 },
          { level: 4, rate: 4 },
          { level: 5, rate: 3 },
        ],
        images: [],
        isActive: true,
        downloadUrl: '/downloads/business-ebook.pdf',
        createdBy: adminUser._id.toString(),
        totalSales: 0,
      },
      {
        name: 'Wellness Supplement Pack',
        description: 'Premium health supplement pack including multivitamins and omega-3.',
        category: 'Health',
        type: 'physical',
        price: 89.99,
        commissionRate: 15,
        levelCommissions: [
          { level: 1, rate: 15 },
          { level: 2, rate: 8 },
          { level: 3, rate: 5 },
          { level: 4, rate: 3 },
          { level: 5, rate: 2 },
        ],
        images: [],
        isActive: true,
        stock: 500,
        createdBy: adminUser._id.toString(),
        totalSales: 0,
      },
      {
        name: 'Web Development Bootcamp',
        description: 'Full-stack web development course with HTML, CSS, JavaScript, React, and Node.js.',
        category: 'Education',
        type: 'digital',
        price: 499.99,
        commissionRate: 30,
        levelCommissions: [
          { level: 1, rate: 30 },
          { level: 2, rate: 15 },
          { level: 3, rate: 8 },
          { level: 4, rate: 5 },
          { level: 5, rate: 2 },
        ],
        images: [],
        isActive: true,
        downloadUrl: '/downloads/webdev-bootcamp.zip',
        createdBy: adminUser._id.toString(),
        totalSales: 0,
      },
      {
        name: 'Premium Coffee Subscription',
        description: 'Monthly subscription of premium organic coffee beans from around the world.',
        category: 'Food & Beverage',
        type: 'physical',
        price: 29.99,
        commissionRate: 20,
        levelCommissions: [
          { level: 1, rate: 20 },
          { level: 2, rate: 10 },
          { level: 3, rate: 5 },
          { level: 4, rate: 3 },
          { level: 5, rate: 2 },
        ],
        images: [],
        isActive: true,
        stock: 1000,
        createdBy: adminUser._id.toString(),
        totalSales: 0,
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    console.log('\\n=== Seed completed successfully ===');
    console.log('Login credentials:');
    console.log('Email: admin@netweave.com');
    console.log('Password: password123');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
