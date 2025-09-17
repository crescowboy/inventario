import mongoose from 'mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found. Seeding database...');
      
      const users = [
        {
          name: 'Admin User',
          email: 'admin@gmail.com',
          password: 'admin',
          role: 'admin',
        },
        {
          name: 'Jefe User',
          email: 'jefe@gmail.com',
          password: 'jefe',
          role: 'jefe',
        },
        {
          name: 'Empleado User',
          email: 'empleado@gmail.com',
          password: 'empleado',
          role: 'empleado',
        },
      ];

      const usersToInsert = await Promise.all(
        users.map(async (user) => {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(user.password, salt);
          return { ...user, password: hashedPassword };
        })
      );

      await User.insertMany(usersToInsert);
      console.log('Database seeded with 3 users.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    await seedDatabase(); 
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default dbConnect;